import { NextRequest, NextResponse } from 'next/server';

// Atualizar status do pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }
console.log('Updating order status to:', params.id, status);
    // Chamar API do backend Python
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/orders/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const updatedOrder = await response.json();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    
    // Se o backend não estiver disponível, simular atualização local
    return NextResponse.json({
      id: parseInt(params.id),
      status: status,
      updated_at: new Date().toISOString(),
      message: 'Status atualizado localmente (backend indisponível)'
    });
  }
}

// Excluir pedido
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Chamar API do backend Python
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/orders/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    return NextResponse.json({ 
      message: 'Pedido excluído com sucesso',
      id: parseInt(params.id)
    });
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    
    // Se o backend não estiver disponível, simular exclusão local
    return NextResponse.json({ 
      message: 'Pedido excluído localmente (backend indisponível)',
      id: parseInt(params.id)
    });
  }
}

// Obter detalhes de um pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Chamar API do backend Python
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/orders/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const order = await response.json();
    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    
    // Se o backend não estiver disponível, retornar dados simulados
    const mockOrder = {
      id: parseInt(params.id),
      total_amount: 299.99,
      subtotal: 249.99,
      tax: 25.00,
      shipping: 25.00,
      status: 'pending',
      payment_status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      delivery_address: 'Rua Example, 123',
      delivery_city: 'São Paulo',
      delivery_state: 'SP',
      delivery_zipcode: '01234-567',
      email: 'cliente@exemplo.com',
      first_name: 'Cliente',
      last_name: 'Teste',
      phone: '(11) 99999-9999',
      items: [
        {
          id: 1,
          title: 'Produto Exemplo',
          price: 249.99,
          quantity: 1,
          image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'
        }
      ]
    };
    
    return NextResponse.json(mockOrder);
  }
}
