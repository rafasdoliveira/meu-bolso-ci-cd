# Build stage
FROM node:22-alpine AS build
WORKDIR /app

ARG APP_VERSION=dev
ENV VITE_APP_VERSION=$APP_VERSION

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM nginx:1.27-alpine

RUN apk update && apk upgrade --no-cache

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
