# Imagem base oficial do Node.js 18 Alpine (leve e segura)
FROM node:18-alpine AS base

# === ESTÁGIO 1: Instalação de Dependências ===
FROM base AS deps
# Instala bibliotecas de compatibilidade necessárias para o Alpine Linux
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os arquivos de dependências para aproveitar o cache do Docker
COPY package.json package-lock.json* ./
# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci && npm cache clean --force

# === ESTÁGIO 2: Build da Aplicação ===
FROM base AS builder
WORKDIR /app
# Copia as dependências já instaladas do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia todo o código fonte da aplicação
COPY . .

# Desabilita a telemetria do Next.js para builds mais rápidos
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build de produção do Next.js
RUN npm run build

# === ESTÁGIO 3: Imagem de Produção ===
FROM base AS runner
WORKDIR /app

# Define ambiente de produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos públicos
COPY --from=builder /app/public ./public

# Copia os arquivos de build do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Muda para usuário não-root (segurança)
USER nextjs

# Expõe a porta 3000
EXPOSE 3000

# Configura porta e hostname
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
