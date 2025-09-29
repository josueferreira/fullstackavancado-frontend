# API de Checkout - StoreMVP

## 📋 Documentação da API de Pedidos

### 🔗 Endpoint: `/api/order`

Esta API serve como uma ponte entre o frontend Next.js e o backend Python, garantindo validação e formatação adequada dos dados.

---

## 📤 POST `/api/order`

### Descrição
Cria um novo pedido no sistema, integrando com o backend Python.

### Headers Requeridos
```
Content-Type: application/json
Accept: application/json
```

### Body da Requisição
```typescript
{
  items: [
    {
      product_id: number;
      product_title: string;
      product_price: number;
      quantity: number;
    }
  ],
  delivery_address: {
    delivery_address: string;
    delivery_city: string;
    delivery_state: string;
    delivery_zipcode: string;
    delivery_complement?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  },
  payment: {
    method: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'cash';
    amount: number;
    installments?: number;
    card_holder_name?: string;
    card_number?: string;
  }
}
```

### Exemplo de Requisição
```json
{
  "items": [
    {
      "product_id": 1,
      "product_title": "iPhone 13",
      "product_price": 4999.99,
      "quantity": 1
    }
  ],
  "delivery_address": {
    "delivery_address": "Rua das Flores, 123",
    "delivery_city": "São Paulo",
    "delivery_state": "SP",
    "delivery_zipcode": "01234-567",
    "email": "cliente@exemplo.com",
    "first_name": "João",
    "last_name": "Silva",
    "phone": "(11) 99999-9999"
  },
  "payment": {
    "method": "credit_card",
    "amount": 4999.99,
    "installments": 1,
    "card_holder_name": "JOAO SILVA",
    "card_number": "4111111111111111"
  }
}
```

### Respostas

#### ✅ Sucesso (201 Created)
```json
{
  "success": true,
  "message": "Pedido criado com sucesso!",
  "order": {
    "id": 123,
    "total_amount": 4999.99,
    "status": "confirmed",
    "created_at": "2024-01-01T10:00:00Z",
    "delivery_info": {
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01234-567"
    },
    "customer_info": {
      "email": "cliente@exemplo.com",
      "name": "João Silva",
      "phone": "(11) 99999-9999"
    }
  }
}
```

#### ❌ Erro de Validação (400 Bad Request)
```json
{
  "error": "Nome é obrigatório"
}
```

#### ❌ Erro do Backend (500+ Status)
```json
{
  "error": "Serviço temporariamente indisponível",
  "details": "Não foi possível conectar com o servidor de pedidos"
}
```

---

## 📥 GET `/api/order`

### Descrição
Busca pedidos existentes no sistema.

### Parâmetros de Query

#### Buscar por ID
```
GET /api/order?id=123
```

#### Buscar por Email
```
GET /api/order?email=cliente@exemplo.com
```

### Respostas

#### ✅ Sucesso (200 OK)
```json
{
  "id": 123,
  "total_amount": 4999.99,
  "status": "confirmed",
  "created_at": "2024-01-01T10:00:00Z",
  "delivery_address": "Rua das Flores, 123",
  "delivery_city": "São Paulo",
  "delivery_state": "SP",
  "delivery_zipcode": "01234-567",
  "email": "cliente@exemplo.com",
  "first_name": "João",
  "last_name": "Silva",
  "phone": "(11) 99999-9999"
}
```

#### ❌ Pedido Não Encontrado (404)
```json
{
  "error": "Pedido não encontrado"
}
```

---

## 🔧 Configuração de Ambiente

### Variáveis Necessárias

```env
# URL do backend Python
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000

# Para Docker
NEXT_PUBLIC_BACKEND_API_URL=http://host.docker.internal:8000
```

### Docker Compose
```yaml
environment:
  - NEXT_PUBLIC_BACKEND_API_URL=http://host.docker.internal:8000
```

---

## 🚨 Tratamento de Erros

### Tipos de Erro

1. **400 - Bad Request**: Dados inválidos ou ausentes
2. **404 - Not Found**: Pedido não encontrado (GET)
3. **500 - Internal Server Error**: Erro interno da API
4. **503 - Service Unavailable**: Backend indisponível

### Logs de Debug
- Erros são logados no console em modo desenvolvimento
- Informações sensíveis são ocultadas em produção

---

## 🔐 Segurança

### Validações Implementadas

- ✅ Campos obrigatórios verificados
- ✅ Tipos de dados validados
- ✅ Total do pedido recalculado e verificado
- ✅ Quantidade e preços positivos
- ✅ Sanitização de dados sensíveis

### Headers de Segurança
```typescript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

---

## 🧪 Testes

### Testando Localmente
```bash
# Endpoint de teste
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -d @test-order.json
```

### Exemplo de teste com dados válidos
```bash
# Criar arquivo test-order.json com o exemplo acima
npm run dev
# Testar via frontend ou Postman
```

Esta API garante uma integração robusta e segura entre o frontend StoreMVP e o backend Python! 🎉
