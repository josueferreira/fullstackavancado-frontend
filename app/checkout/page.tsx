"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { ApiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ShippingForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [shippingData, setShippingData] = useState<ShippingForm>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    complement: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [paymentData, setPaymentData] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  // Calculate totals
  const subtotal = state.total;
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Function to fetch CEP data
  const fetchCepData = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: CepResponse = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado. Verifique e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Update form with CEP data
      setShippingData(prev => ({
        ...prev,
        address: data.logradouro,
        city: data.localidade,
        state: data.uf,
        zipCode: cep,
      }));

      toast({
        title: "CEP encontrado!",
        description: `Endereço preenchido automaticamente para ${data.localidade}, ${data.uf}`,
      });
      
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar os dados do CEP. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  // Redirect if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Carrinho vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione produtos ao carrinho antes de finalizar a compra.
          </p>
          <Link href="/">
            <Button>Voltar à loja</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping form
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    const isValid = requiredFields.every(field => 
      shippingData[field as keyof ShippingForm].trim() !== ''
    );

    if (!isValid) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Termos de uso",
        description: "Você deve aceitar os termos e condições para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validate payment form
    const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
    const isValid = requiredFields.every(field => 
      paymentData[field as keyof PaymentForm].trim() !== ''
    );

    if (!isValid) {
      toast({
        title: "Dados do cartão",
        description: "Por favor, preencha todos os dados do cartão.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar dados do pedido para a API
      const orderData = {
        items: state.items.map(item => ({
          product_id: item.product.id,
          product_title: item.product.title,
          product_price: item.product.price,
          quantity: item.quantity,
          product_image_url: item.product.image
        })),
        delivery_address: {
          delivery_address: shippingData.address,
          delivery_city: shippingData.city,
          delivery_state: shippingData.state,
          delivery_zipcode: shippingData.zipCode,
          delivery_complement: shippingData.complement,
          email: shippingData.email,
          first_name: shippingData.firstName,
          last_name: shippingData.lastName,
          phone: shippingData.phone
        },
        payment: {
          method: 'credit_card' as const,
          amount: total,
          installments: 1,
          card_holder_name: paymentData.cardName,
          card_number: paymentData.cardNumber.replace(/\s/g, '')
        }
      };

      // Fazer requisição para a API
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pedido');
      }

      // Clear cart and show success
      clearCart();
      
      toast({
        title: "Pedido confirmado! 🎉",
        description: `Pedido #${result.order.id} criado com sucesso. Você receberá um email de confirmação.`,
        duration: 5000,
      });

      // Redirect to user dashboard
      router.push('/dashboard/user');
      
    } catch (error) {
      console.error('Erro no checkout:', error);
      
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    formType: 'shipping' | 'payment',
    field: string,
    value: string
  ) => {
    if (formType === 'shipping') {
      // Format CEP input
      if (field === 'zipCode') {
        const cleanValue = value.replace(/\D/g, '');
        const formattedValue = cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
        value = formattedValue.slice(0, 9); // Limit to 9 characters (XXXXX-XXX)
      }
      
      // Format phone input
      if (field === 'phone') {
        const cleanValue = value.replace(/\D/g, '');
        const formattedValue = cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        value = formattedValue.slice(0, 15); // Limit to 15 characters (XX) XXXXX-XXXX
      }
      
      // Format state input (uppercase)
      if (field === 'state') {
        value = value.toUpperCase().slice(0, 2); // Limit to 2 characters and uppercase
      }
      
      setShippingData(prev => ({ ...prev, [field]: value }));
      
      // Auto-fetch CEP data when zipCode is complete
      if (field === 'zipCode' && value.replace(/\D/g, '').length === 8) {
        fetchCepData(value);
      }
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar à loja</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">Finalizar Compra</h1>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Informações de Entrega</span>
                  </CardTitle>
                  <CardDescription>
                    Preencha seus dados para entrega do pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                          placeholder="seu@email.com"
                          required
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            value={shippingData.firstName}
                            onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                            placeholder="João"
                            required
                          />
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            value={shippingData.lastName}
                            onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                            placeholder="Silva"
                            required
                          />
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode" className="flex items-center space-x-1">
                          <span>CEP *</span>
                          {loadingCep && (
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="zipCode"
                            value={shippingData.zipCode}
                            onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                            placeholder="01234-567"
                            maxLength={9}
                            disabled={loadingCep}
                            required
                          />
                          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Digite o CEP para preenchimento automático
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            value={shippingData.phone}
                            onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                            required
                          />
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        value={shippingData.address}
                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                        placeholder="Rua das Flores, 123"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={shippingData.complement}
                        onChange={(e) => handleInputChange('shipping', 'complement', e.target.value)}
                        placeholder="Apto 101, Bloco A (opcional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                          placeholder="São Paulo"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={shippingData.state}
                          onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                          placeholder="SP"
                          maxLength={2}
                          style={{ textTransform: 'uppercase' }}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Continuar para Pagamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Informações de Pagamento</span>
                  </CardTitle>
                  <CardDescription>
                    Complete os dados do cartão para finalizar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão *</Label>
                      <Input
                        id="cardName"
                        value={paymentData.cardName}
                        onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                        placeholder="João Silva"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Validade *</Label>
                        <Input
                          id="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Aceito os{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          termos e condições
                        </Link>
                      </Label>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : `Finalizar Compra`}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-50 rounded overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">
                            Quantidade: {item.quantity}
                          </span>
                          <span className="text-sm font-medium">
                            {ApiService.formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{ApiService.formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete:</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="secondary" className="text-xs">Grátis</Badge>
                      ) : (
                        ApiService.formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa:</span>
                    <span>{ApiService.formatPrice(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{ApiService.formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 200 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 Adicione {ApiService.formatPrice(200 - subtotal)} para ganhar frete grátis!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
