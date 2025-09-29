"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings, LogOut, ShoppingBag, MapPin, CreditCard, Bell, Eye, X, AlertCircle, CheckCircle, Clock, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Order {
  id: number;
  total_amount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  created_at: string;
  updated_at: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zipcode: string;
  delivery_complement?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  items?: OrderItem[];
  payment?: {
    id: number;
    method: string;
    amount: number;
    installments: number;
    card_holder_name: string;
    card_number: string;
    status: string;
    transaction_id: string;
    created_at: string;
    updated_at: string;
  };
}interface OrderItem {
    id: number;
    product_id: number;
    product_title: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    product_image_url?: string;
}

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    memberSince: string;
}

export default function UserDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Mock user data - em um app real, isso viria de um contexto de autenticação
    const userProfile: UserProfile = {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        memberSince: '2024-01-15'
    };

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/order');
                if (response.ok) {
                    const data = await response.json();
                    // Ordenar pedidos do mais recente para o mais antigo
                    const sortedOrders = data.sort((a: Order, b: Order) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    setOrders(sortedOrders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-800';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'Pendente';
            case 'confirmed': return 'Confirmado';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'confirmed': return <CheckCircle className="w-3 h-3" />;
            case 'shipped': return <Truck className="w-3 h-3" />;
            case 'delivered': return <CheckCircle className="w-3 h-3" />;
            case 'cancelled': return <X className="w-3 h-3" />;
            default: return <AlertCircle className="w-3 h-3" />;
        }
    };

    const getPaymentStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusText = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'Pago';
            case 'pending': return 'Pendente';
            case 'failed': return 'Falhou';
            case 'refunded': return 'Reembolsado';
            default: return 'N/A';
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <LoadingSpinner fullScreen text="Carregando dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Dashboard do Usuário */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                                <AvatarFallback>
                                    {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Olá, {userProfile.name.split(' ')[0]}!
                                </h1>
                                <p className="text-gray-600">
                                    Bem-vindo ao seu painel de controle
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            className="flex items-center space-x-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Voltar à Loja</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Visão Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Pedidos</span>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Perfil</span>
                        </TabsTrigger>
                        <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                            <Heart className="w-4 h-4" />
                            <span>Favoritos</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Visão Geral */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{orders.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Desde {new Date(userProfile.memberSince).toLocaleDateString('pt-BR')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatPrice(orders.reduce((sum, order) => sum + order.total_amount, 0))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Em {orders.length} pedidos
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {orders.filter(order => order.status.toLowerCase() === 'pending').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Aguardando processamento
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Último Pedido</CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {orders.length > 0 ? `#${orders[0].id}` : 'N/A'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {orders.length > 0 ? formatDate(orders[0].created_at) : 'Nenhum pedido'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pedidos Recentes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pedidos Recentes</CardTitle>
                                <CardDescription>
                                    Seus últimos pedidos realizados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-6">
                                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                            Nenhum pedido encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Você ainda não fez nenhum pedido.
                                        </p>
                                        <div className="mt-6">
                                            <Button onClick={() => router.push('/')}>
                                                Começar a comprar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(order.status)}
                                                        <div>
                                                            <p className="font-semibold">Pedido #{order.id}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <Badge className={`${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab de Pedidos */}
                    <TabsContent value="orders" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Todos os Pedidos</CardTitle>
                                <CardDescription>
                                    Histórico completo de seus pedidos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-6">
                                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                            Nenhum pedido encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Você ainda não fez nenhum pedido.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusIcon(order.status)}
                                                        <div>
                                                            <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                Realizado em {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={getStatusColor(order.status)}>
                                                            {getStatusText(order.status)}
                                                        </Badge>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(order)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Ver Detalhes
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                                                        <div className="text-sm text-gray-600">
                                                            <p>{order.delivery_address}</p>
                                                            <p>{order.delivery_city}, {order.delivery_state}</p>
                                                            <p>CEP: {order.delivery_zipcode}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>Subtotal:</span>
                                                                <span>{formatPrice(order.subtotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Frete:</span>
                                                                <span>{formatPrice(order.shipping)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Taxa:</span>
                                                                <span>{formatPrice(order.tax)}</span>
                                                            </div>
                                                            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                                                                <span>Total:</span>
                                                                <span>{formatPrice(order.total_amount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab de Perfil */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Pessoais</CardTitle>
                                <CardDescription>
                                    Gerencie suas informações de perfil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                                        <AvatarFallback>
                                            {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                                        <p className="text-gray-600">Membro desde {formatDate(userProfile.memberSince)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-gray-900">{userProfile.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Telefone</label>
                                        <p className="text-gray-900">{userProfile.phone}</p>
                                    </div>
                                </div>

                                <Button className="mt-4">
                                    Editar Perfil
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab de Lista de Desejos */}
                    <TabsContent value="wishlist" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Favoritos</CardTitle>
                                <CardDescription>
                                    Produtos que você salvou para mais tarde
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                        Lista vazia
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Você ainda não adicionou produtos aos favoritos.
                                    </p>
                                    <div className="mt-6">
                                        <Button onClick={() => router.push('/')}>
                                            Explorar Produtos
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Detalhes do Pedido */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Informações completas do seu pedido
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Status e Informações Gerais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Status do Pedido</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(selectedOrder.status)}
                                            <Badge className={getStatusColor(selectedOrder.status).replace('hover:bg-', 'bg-').replace('hover:text-', 'text-')} variant="outline">
                                                {getStatusText(selectedOrder.status)}
                                            </Badge>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            <p>Criado: {formatDate(selectedOrder.created_at)}</p>
                                            <p>Atualizado: {formatDate(selectedOrder.updated_at)}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatPrice(selectedOrder.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Frete:</span>
                                                <span>{formatPrice(selectedOrder.shipping)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Taxa:</span>
                                                <span>{formatPrice(selectedOrder.tax)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                                <span>Total:</span>
                                                <span className="text-green-600">{formatPrice(selectedOrder.total_amount)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Informações de Entrega */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                                        <p>{selectedOrder.delivery_address}</p>
                                        {selectedOrder.delivery_complement && (
                                            <p>{selectedOrder.delivery_complement}</p>
                                        )}
                                        <p>{selectedOrder.delivery_city}, {selectedOrder.delivery_state}</p>
                                        <p>CEP: {selectedOrder.delivery_zipcode}</p>
                                        <p className="mt-2"><strong>Telefone:</strong> {selectedOrder.phone}</p>
                                        <p><strong>Email:</strong> {selectedOrder.email}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Informações de Pagamento */}
                            {selectedOrder.payment && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Informações de Pagamento</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Método de Pagamento</h4>
                                                <div className="space-y-1 text-sm">
                                                    <p><strong>Método:</strong> {selectedOrder.payment.method === 'credit_card' ? 'Cartão de Crédito' : selectedOrder.payment.method}</p>
                                                    <p><strong>Portador:</strong> {selectedOrder.payment.card_holder_name}</p>
                                                    <p><strong>Cartão:</strong> **** **** **** {selectedOrder.payment.card_number.slice(-4)}</p>
                                                    <p><strong>Parcelas:</strong> {selectedOrder.payment.installments}x</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Status da Transação</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getPaymentStatusColor(selectedOrder.payment.status)} variant="outline">
                                                            {getPaymentStatusText(selectedOrder.payment.status)}
                                                        </Badge>
                                                    </div>
                                                    <p><strong>ID da Transação:</strong> {selectedOrder.payment.transaction_id}</p>
                                                    <p><strong>Valor:</strong> {formatPrice(selectedOrder.payment.amount)}</p>
                                                    <p><strong>Data:</strong> {formatDate(selectedOrder.payment.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Itens do Pedido */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                                                    {item.product_image_url ? (
                                                        <img
                                                            src={item.product_image_url}
                                                            alt={item.product_title}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h5 className="font-medium">{item.product_title}</h5>
                                                        <p className="text-sm text-gray-600">
                                                            Produto ID: {item.product_id}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Quantidade: {item.quantity} x {formatPrice(item.product_price)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            {formatPrice(item.subtotal)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}