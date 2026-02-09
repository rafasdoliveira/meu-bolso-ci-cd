# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM nginx:1.27-alpine

RUN apk update && apk upgrade --no-cache

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build do Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Usuário não-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 80
