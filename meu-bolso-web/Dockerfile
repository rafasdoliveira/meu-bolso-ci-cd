# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Atualiza npm
RUN npm install -g npm@latest

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Segurança básica
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 80
