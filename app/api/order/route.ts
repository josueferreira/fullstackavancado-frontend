import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  product_id: number;
  product_title: string;
  product_price: number;
  quantity: number;
  product_image_url?: string;
}

interface DeliveryAddress {
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zipcode: string;
  delivery_complement?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface Payment {
  method: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'cash';
  amount: number;
  installments?: number;
  card_holder_name?: string;
  card_number?: string;
}

interface OrderRequest {
  items: OrderItem[];
  delivery_address: DeliveryAddress;
  payment: Payment;
  totals?: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

interface OrderResponse {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zipcode: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Pedido deve ter pelo menos um item' },
        { status: 400 }
      );
    }

    // Validar dados obrigatórios do endereço
    const requiredFields = [
      'delivery_address',
      'delivery_city', 
      'delivery_state',
      'delivery_zipcode',
      'email',
      'first_name',
      'last_name',
      'phone'
    ];

    for (const field of requiredFields) {
      if (!body.delivery_address[field as keyof DeliveryAddress]?.toString().trim()) {
        const fieldNames: Record<string, string> = {
          delivery_address: 'Endereço de entrega',
          delivery_city: 'Cidade',
          delivery_state: 'Estado',
          delivery_zipcode: 'CEP',
          email: 'Email',
          first_name: 'Nome',
          last_name: 'Sobrenome',
          phone: 'Telefone'
        };
        
        return NextResponse.json(
          { error: `${fieldNames[field]} é obrigatório` },
          { status: 400 }
        );
      }
    }

    // Validar itens do pedido
    for (const item of body.items) {
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: `Quantidade deve ser maior que zero para o produto ${item.product_id}` },
          { status: 400 }
        );
      }
      
      if (item.product_price <= 0) {
        return NextResponse.json(
          { error: `Preço deve ser maior que zero para o produto ${item.product_id}` },
          { status: 400 }
        );
      }
    }

    // Calcular totais dos produtos
    const subtotal = body.items.reduce((total, item) => {
      return total + (item.product_price * item.quantity);
    }, 0);

    // Calcular frete e taxa
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.1;

    // Preparar dados para enviar ao backend Python
    const orderData = {
      items: body.items,
      delivery_address: body.delivery_address,
      payment: {
        ...body.payment,
        installments: body.payment.installments || 1
      },
      shipping: shipping,
      tax: tax,
      subtotal: subtotal
    };

    // Fazer requisição para o backend Python
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!backendResponse.ok) {
      let errorMessage = 'Erro interno do servidor';
      
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        if (backendResponse.status === 404) {
          errorMessage = 'Serviço temporariamente indisponível';
        } else if (backendResponse.status >= 500) {
          errorMessage = 'Erro interno do servidor';
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: backendResponse.status }
      );
    }

    // Parse da resposta do backend
    const orderResponse: OrderResponse = await backendResponse.json();

    return NextResponse.json(
      {
        success: true,
        message: 'Pedido criado com sucesso!',
        order: {
          id: orderResponse.id,
          total_amount: orderResponse.total_amount,
          status: orderResponse.status || 'confirmed',
          created_at: orderResponse.created_at,
          delivery_info: {
            address: orderResponse.delivery_address,
            city: orderResponse.delivery_city,
            state: orderResponse.delivery_state,
            zipcode: orderResponse.delivery_zipcode
          },
          customer_info: {
            email: orderResponse.email,
            name: `${orderResponse.first_name} ${orderResponse.last_name}`,
            phone: orderResponse.phone
          }
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
          details: 'Não foi possível conectar com o servidor de pedidos'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erro desconhecido' : undefined
      },
      { status: 500 }
    );
  }
}

// Método GET para buscar pedidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const email = searchParams.get('email');
    
    let endpoint = `${BACKEND_API_URL}/api/v1/orders/`;
    const params = new URLSearchParams();
    
    if (orderId) {
      endpoint += orderId;
    } else if (email) {
      params.append('email', email);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao buscar pedido';
      
      if (response.status === 404) {
        errorMessage = 'Pedido não encontrado';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}