# Build stage
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_ENV=production

# Dependencias del sistema necesarias para compilación
RUN apk add --no-cache libc6-compat

# Copiar package.json y package-lock para cachear instalaciones
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copiar el resto y construir
COPY . .
RUN npm run build

# Stage final: nginx para servir los archivos estáticos
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración nginx para SPA (fallback a index.html)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
