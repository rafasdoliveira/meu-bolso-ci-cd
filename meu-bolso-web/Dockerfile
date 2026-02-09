# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# runtime
FROM nginx:alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
