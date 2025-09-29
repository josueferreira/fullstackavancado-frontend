"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingCart,
    Package,
    DollarSign,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Filter,
    BarChart3,
    PieChart,
    AlertCircle,
    CheckCircle,
    Clock,
    Truck,
    X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Order {
    id: number;
    total_amount: number;
    subtotal: number;
    tax: number;
    shipping: number;
    status: string;
    payment_status?: string;
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
}

interface OrderItem {
    id: number;
    product_id: number;
    product_title: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    product_image_url?: string;
}

interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

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
                    setFilteredOrders(sortedOrders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    useEffect(() => {
        let filtered = orders;

        // Filtrar por status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter);
        }

        // Filtrar por busca (ID, nome, email)
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por data
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
                    break;
            }
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchTerm, dateFilter]);

    const getStats = (): OrderStats => {
        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
            pendingOrders: orders.filter(order => order.status.toLowerCase() === 'pending').length,
            completedOrders: orders.filter(order =>
                ['delivered', 'completed'].includes(order.status.toLowerCase())
            ).length,
            averageOrderValue: orders.length > 0
                ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length
                : 0
        };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
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

    // Função para visualizar detalhes do pedido
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Função para editar status do pedido
    const handleEditStatus = (order: Order) => {
        setSelectedOrder(order);
        setEditingStatus(order.status);
        setShowEditModal(true);
    };

    // Função para excluir pedido
    const handleDeleteOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    // Atualizar status do pedido
    const updateOrderStatus = async () => {
        if (!selectedOrder || !editingStatus) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/order/${selectedOrder.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: editingStatus }),
            });

            if (response.ok) {
                // Atualizar ordem local
                const updatedOrders = orders.map(order =>
                    order.id === selectedOrder.id
                        ? { ...order, status: editingStatus, updated_at: new Date().toISOString() }
                        : order
                );
                setOrders(updatedOrders);
                setShowEditModal(false);
                setSelectedOrder(null);
            } else {
                alert('Erro ao atualizar status do pedido');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Erro ao conectar com o servidor');
        } finally {
            setIsUpdating(false);
        }
    };

    // Excluir pedido
    const deleteOrder = async () => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/order/${selectedOrder.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remover ordem da lista local
                const updatedOrders = orders.filter(order => order.id !== selectedOrder.id);
                setOrders(updatedOrders);
                setShowDeleteModal(false);
                setSelectedOrder(null);
            } else {
                alert('Erro ao excluir pedido');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Erro ao conectar com o servidor');
        } finally {
            setIsUpdating(false);
        }
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <LoadingSpinner fullScreen text="Carregando dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header da Dashboard do Administrador */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard Administrativo
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gerencie pedidos e monitore performance
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">

                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                size="sm"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Voltar à Loja
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Visão Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Pedidos</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <PieChart className="w-4 h-4" />
                            <span>Análises</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab de Visão Geral */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Todos os tempos
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatPrice(stats.totalRevenue)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total vendido
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {stats.pendingOrders}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Requer atenção
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.completedOrders}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Finalizados
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatPrice(stats.averageOrderValue)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Por pedido
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pedidos Recentes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pedidos Recentes</CardTitle>
                                <CardDescription>
                                    Últimos pedidos realizados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                            Nenhum pedido encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Aguardando novos pedidos...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 8).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(order.status)}
                                                        <div>
                                                            <p className="font-semibold">Pedido #{order.id}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.first_name} {order.last_name} • {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <Badge className={getStatusColor(order.status)} variant="outline">
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                    {order.payment?.status && (
                                                        <Badge className={getPaymentStatusColor(order.payment.status)} variant="outline">
                                                            💳 {getPaymentStatusText(order.payment.status)}
                                                        </Badge>
                                                    )}
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
                        {/* Filtros */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Filtros</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Buscar</label>
                                        <Input
                                            placeholder="ID, nome ou email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Status</label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os status</SelectItem>
                                                <SelectItem value="pending">Pendente</SelectItem>
                                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                                <SelectItem value="shipped">Enviado</SelectItem>
                                                <SelectItem value="delivered">Entregue</SelectItem>
                                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Período</label>
                                        <Select value={dateFilter} onValueChange={setDateFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os períodos</SelectItem>
                                                <SelectItem value="today">Hoje</SelectItem>
                                                <SelectItem value="week">Últimos 7 dias</SelectItem>
                                                <SelectItem value="month">Último mês</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                setDateFilter('all');
                                            }}
                                            className="w-full"
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Limpar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de Pedidos */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Gerenciar Pedidos ({filteredOrders.length})
                                        </CardTitle>
                                        <CardDescription>
                                            Lista completa de pedidos com ações administrativas
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                            Nenhum pedido encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Ajuste os filtros para ver mais resultados.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredOrders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusIcon(order.status)}
                                                        <div>
                                                            <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {order.first_name} {order.last_name} • {order.email}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={getStatusColor(order.status)} variant="outline">
                                                            {getStatusText(order.status)}
                                                        </Badge>
                                                        {order.payment?.status && (
                                                            <Badge className={getPaymentStatusColor(order.payment.status)} variant="outline">
                                                                💳 {getPaymentStatusText(order.payment.status)}
                                                            </Badge>
                                                        )}
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-green-600">
                                                                {formatPrice(order.total_amount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-1">Contato</h4>
                                                        <p className="text-gray-600">📞 {order.phone}</p>
                                                        <p className="text-gray-600">✉️ {order.email}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-1">Endereço de Entrega</h4>
                                                        <p className="text-gray-600">{order.delivery_address}</p>
                                                        {order.delivery_complement && (
                                                            <p className="text-gray-600">{order.delivery_complement}</p>
                                                        )}
                                                        <p className="text-gray-600">{order.delivery_city}, {order.delivery_state}</p>
                                                        <p className="text-gray-600">CEP: {order.delivery_zipcode}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-1">Resumo Financeiro</h4>
                                                        <div className="space-y-1 text-gray-600">
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
                                                            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                                                                <span>Total:</span>
                                                                <span>{formatPrice(order.total_amount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t">
                                                    <div className="text-xs text-gray-500">
                                                        Última atualização: {formatDate(order.updated_at)}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(order)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Ver Detalhes
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditStatus(order)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Editar Status
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteOrder(order)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab de Análise de Dados */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Distribuição por Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição por Status</CardTitle>
                                    <CardDescription>
                                        Análise do status dos pedidos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                                            const count = orders.filter(o => o.status.toLowerCase() === status).length;
                                            const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                                            return (
                                                <div key={status} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(status)}
                                                        <span className="capitalize">{getStatusText(status)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium w-12 text-right">
                                                            {count} ({percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Análise de Receita */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Análise de Receita</CardTitle>
                                    <CardDescription>
                                        Breakdown dos componentes de receita
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Subtotal dos Produtos</span>
                                            <span className="text-lg font-bold">
                                                {formatPrice(orders.reduce((sum, o) => sum + o.subtotal, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Total em Frete</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {formatPrice(orders.reduce((sum, o) => sum + o.shipping, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Total em Taxas</span>
                                            <span className="text-lg font-bold text-purple-600">
                                                {formatPrice(orders.reduce((sum, o) => sum + o.tax, 0))}
                                            </span>
                                        </div>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold">Receita Total</span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {formatPrice(stats.totalRevenue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Análise de Dados */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Métricas Adicionais</CardTitle>
                                <CardDescription>
                                    Outras informações importantes do negócio
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">
                                            {orders.length > 0 ? Math.round(stats.completedOrders / stats.totalOrders * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-600">Taxa de Conclusão</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            {new Set(orders.map(o => o.email)).size}
                                        </div>
                                        <div className="text-sm text-gray-600">Clientes Únicos</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">
                                            {new Set(orders.map(o => o.delivery_city)).size}
                                        </div>
                                        <div className="text-sm text-gray-600">Cidades Atendidas</div>
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
                            Informações completas do pedido
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
                                            <Badge className={getStatusColor(selectedOrder.status)} variant="outline">
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

                            {/* Informações do Cliente */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Informações do Cliente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Dados Pessoais</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Nome:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                                                <p><strong>Email:</strong> {selectedOrder.email}</p>
                                                <p><strong>Telefone:</strong> {selectedOrder.phone}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Endereço de Entrega</h4>
                                            <div className="space-y-1 text-sm">
                                                <p>{selectedOrder.delivery_address}</p>
                                                {selectedOrder.delivery_complement && (
                                                    <p>{selectedOrder.delivery_complement}</p>
                                                )}
                                                <p>{selectedOrder.delivery_city}, {selectedOrder.delivery_state}</p>
                                                <p>CEP: {selectedOrder.delivery_zipcode}</p>
                                            </div>
                                        </div>
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
                        <Button onClick={() => {
                            setShowDetailsModal(false);
                            if (selectedOrder) handleEditStatus(selectedOrder);
                        }}>
                            Editar Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição de Status */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Status do Pedido #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Altere o status do pedido para atualizar seu estado no sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Novo Status</label>
                            <Select value={editingStatus} onValueChange={setEditingStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                    <SelectItem value="shipped">Enviado</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrder && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Status Atual:</strong> {getStatusText(selectedOrder.status)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Cliente:</strong> {selectedOrder.first_name} {selectedOrder.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={updateOrderStatus}
                            disabled={isUpdating || !editingStatus}
                        >
                            {isUpdating ? 'Atualizando...' : 'Salvar Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. O pedido será permanentemente removido do sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">
                                    Excluir Pedido #{selectedOrder.id}
                                </h4>
                            </div>
                            <div className="text-sm text-red-700 space-y-1">
                                <p><strong>Cliente:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                                <p><strong>Email:</strong> {selectedOrder.email}</p>
                                <p><strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}</p>
                                <p><strong>Status:</strong> {getStatusText(selectedOrder.status)}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={deleteOrder}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}