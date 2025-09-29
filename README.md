# StoreMVP - MVP Loja Virtual

## 📖 Descrição do Projeto

O **StoreMVP** é um MVP (Minimum Viable Product) de uma loja virtual moderna desenvolvida com as mais recentes tecnologias web. Esta aplicação oferece uma experiência completa de e-commerce, incluindo catálogo de produtos, carrinho de compras, sistema de busca, checkout completo e dashboards administrativos.

O projeto integra com um backend Python/FastAPI para processamento de pedidos e utiliza a [Fake Store API](https://fakestoreapi.com/) para o catálogo de produtos, permitindo demonstrar todas as funcionalidades de um e-commerce real.

## 🛠️ Tecnologias

### Stack Principal
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI acessíveis
- **[Swiper.js](https://swiperjs.com/)** - Carrossel de produtos com efeitos 3D
- **[Docker](https://www.docker.com/)** - Containerização

### APIs Integradas
- **[Fake Store API](https://fakestoreapi.com/)** - Catálogo de produtos
- **[ViaCEP API](https://viacep.com.br/)** - Preenchimento automático de endereço
- **Backend Python/FastAPI** - Processamento de pedidos

## ✨ Funcionalidades

### 🎯 E-commerce Completo
- ✅ **Catálogo de Produtos** com sistema de avaliações
- ✅ **Carrossel 3D** dos produtos 5 estrelas (efeito Coverflow)
- ✅ **Sistema de Busca** em tempo real
- ✅ **Filtros Avançados** por categoria, preço e ordenação
- ✅ **Carrinho de Compras** com persistência
- ✅ **Checkout Completo** com preenchimento automático via CEP
- ✅ **Integração com Backend** para processamento de pedidos

### 📊 Dashboards
- ✅ **Dashboard do Usuário** - Histórico de pedidos e detalhes
- ✅ **Dashboard Administrativo** - Gerenciamento completo de pedidos
- ✅ **Sistema de Filtros** - Por status, data, cliente
- ✅ **Analytics** - Receita, métricas de negócio
- ✅ **Modais Detalhados** - Visualização completa de informações

### 🎨 Interface Moderna
- ✅ **Design Responsivo** - Mobile-first
- ✅ **Animações Fluidas** - Transições e hover effects
- ✅ **Toast Notifications** - Feedback em tempo real
- ✅ **Estados de Loading** - Skeleton e spinners

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Docker** versão 20.0+ - [Download Docker](https://www.docker.com/)
- **Docker Compose** versão 2.0+ (já incluído no Docker Desktop)

Verifique as instalações:
```bash
docker --version
docker-compose --version
```

## 🚀 Como Executar o Projeto

### 1. Clone o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd frontend-mvp
```

### 2. Execute com Docker Compose (Recomendado)
```bash
# Construa e execute o container
docker-compose up --build -d

# Para acompanhar os logs (opcional)
docker-compose logs -f frontend
```

### 3. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **Dashboard Admin**: http://localhost:3000/dashboard/admin
- **Dashboard Usuário**: http://localhost:3000/dashboard/user

## 🔧 Comandos Docker Úteis

```bash
# Parar o container
docker-compose down

# Reconstruir e executar
docker-compose up --build -d

# Ver logs em tempo real
docker-compose logs -f

# Entrar no container (debug)
docker-compose exec frontend sh

# Limpar containers e volumes
docker-compose down -v
docker system prune -a
```

## 📱 Funcionalidades Principais

### 🏠 Página Inicial
- Carrossel 3D com produtos 5 estrelas
- Seção hero com call-to-actions
- Grid de produtos responsivo
- Sistema de busca no header

### 🛒 Carrinho e Checkout
- Adicionar/remover produtos
- Visualização de resumo
- Preenchimento automático de endereço via CEP
- Integração com backend para processamento

### 📊 Dashboard do Usuário
- Histórico completo de pedidos
- Detalhes de cada pedido
- Status de entrega e pagamento
- Informações de perfil

### 🔧 Dashboard Administrativo
- Gerenciamento de todos os pedidos
- Filtros por status, data e cliente
- Edição de status de pedidos
- Analytics e métricas de negócio
- Visualização detalhada de informações

## 🌐 Responsividade

- **Mobile**: Layout otimizado para dispositivos móveis
- **Tablet**: Grid de 2-3 colunas
- **Desktop**: Grid de 4+ colunas com sidebar
- **Breakpoints**: 320px, 768px, 1024px, 1440px+

## 🐳 Arquitetura Docker

### Dockerfile
- **Base**: Node.js 18 Alpine (produção otimizada)
- **Build Multi-stage**: Separação entre deps, build e runtime
- **Otimizações**: Cache de layers, usuário não-root
- **Health Check**: Verificação de saúde do container

### Docker Compose
- **Serviço Frontend**: Porta 3000 exposta
- **Variáveis de Ambiente**: Configuração automática
- **Restart Policy**: Reinicialização automática
- **Health Check**: Monitoramento de saúde

## 🔧 Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente pelo Docker Compose:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://fakestoreapi.com
NEXT_PUBLIC_BACKEND_API_URL=http://host.docker.internal:8000
NEXT_TELEMETRY_DISABLED=1
```

## 🚨 Troubleshooting

### Porta já está em uso
```bash
# Verificar processos na porta 3000
netstat -ano | findstr :3000

# Parar container conflitante
docker-compose down

# Ou mudar a porta no docker-compose.yml
ports:
  - "3001:3000"
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs frontend

# Reconstruir do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Erro de conexão com APIs
```bash
# Verificar conectividade (Windows)
docker-compose exec frontend wget https://fakestoreapi.com/products

# Verificar variáveis de ambiente
docker-compose exec frontend env | findstr API
```

## 📁 Estrutura do Projeto

```
frontend-mvp/
├── 📂 app/                          # Next.js 14 App Router
│   ├── 🏠 page.tsx                 # Página inicial
│   ├── 🛒 checkout/                # Sistema de checkout
│   ├── 📦 products/[id]/           # Páginas de produto
│   └── 📊 dashboard/               # Dashboards (user/admin)
├── 📂 components/                   # Componentes React
│   ├── 🏗️ layout/                  # Header, Footer, HeroSection
│   ├── 🛍️ products/                # ProductCard, ProductGrid, etc.
│   ├── 🛒 cart/                    # CartDrawer
│   └── 🎨 ui/                      # Componentes shadcn/ui
├── 📂 contexts/                    # Estado global (Cart, Search)
├── 📂 lib/                         # Utils, tipos, API services
├── 🐳 docker-compose.yml           # Orquestração de containers
├── 🐳 Dockerfile                   # Imagem de produção
└── 📦 package.json                 # Dependências
```

## 🤝 Backend Integration

O frontend está preparado para integrar com um backend Python/FastAPI:

- **Endpoint de Pedidos**: `/api/v1/orders/`
- **Variável de Ambiente**: `NEXT_PUBLIC_BACKEND_API_URL`
- **Fallback**: Se o backend não estiver disponível, a aplicação funciona normalmente

## ⚡ Performance

### Otimizações Docker
- **Imagem Multi-stage**: Reduz tamanho final
- **Node Alpine**: Base mínima e segura
- **Build Cache**: Acelera rebuilds
- **Health Checks**: Garantem disponibilidade

### Otimizações Frontend
- **Next.js 14**: App Router otimizado
- **Image Optimization**: Carregamento otimizado
- **Code Splitting**: Chunks menores
- **Static Generation**: Páginas pré-renderizadas

## 🔒 Segurança

- **Usuário não-root**: Container executa com usuário limitado
- **Variáveis de ambiente**: Configuração segura
- **Health checks**: Monitoramento contínuo
- **HTTPS Ready**: Preparado para SSL

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para demonstrar as melhores práticas em e-commerce moderno.

---

<div align="center">
  <p>🛒 <strong>StoreMVP - E-commerce Moderno com Docker</strong> 🛒</p>
  <p><em>Pronto para produção com um único comando</em></p>
</div>
