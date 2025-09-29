# Docker Setup - StoreMVP Frontend

## 🐳 Configuração Simplificada

Este docker-compose foi otimizado para trabalhar **apenas com o frontend**, pois o backend possui sua própria configuração Docker separada.

## 🚀 Como Usar

### Iniciar a Aplicação
```bash
# Build e iniciar o container
docker-compose up --build -d

# Ou apenas iniciar (se já foi buildado)
docker-compose up -d
```

### Parar a Aplicação
```bash
# Parar o container
docker-compose down

# Parar e remover volumes (se necessário)
docker-compose down -v
```

### Ver Logs
```bash
# Logs em tempo real
docker-compose logs -f

# Logs específicos do frontend
docker logs storemvp-frontend
```

## 📋 Configuração Atual

- **Container**: `storemvp-frontend`
- **Porta**: `3000:3000`
- **Rede**: `storemvp-frontend-network`
- **Health Check**: Configurado para verificar disponibilidade
- **Restart**: `unless-stopped`

## 🔧 Variáveis de Ambiente

- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://fakestoreapi.com`
- `NEXT_TELEMETRY_DISABLED=1`

## 📱 Acesso

Após iniciar, a aplicação estará disponível em:
- **URL**: http://localhost:3000

## 🔗 Integração com Backend

Este frontend está configurado para trabalhar com a **Fake Store API** externamente. Quando o backend Python estiver pronto, você pode:

1. Atualizar a variável `NEXT_PUBLIC_API_URL` no docker-compose.yml
2. Conectar ambos os containers na mesma rede Docker (se necessário)

## 🚨 Troubleshooting

### Porta já em uso
```bash
# Verificar o que está usando a porta 3000
lsof -i :3000

# Parar container existente
docker-compose down
```

### Problemas de Build
```bash
# Rebuild completo
docker-compose build --no-cache

# Limpar tudo e rebuild
docker system prune -a
docker-compose up --build -d
```

### Verificar Status
```bash
# Status dos containers
docker-compose ps

# Informações detalhadas
docker inspect storemvp-frontend
```
