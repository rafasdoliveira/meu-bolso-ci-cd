# Build stage
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production deps stage
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Runtime stage
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Segurança: usuário não-root
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

USER app

EXPOSE 8080
CMD ["node", "dist/main.js"]
