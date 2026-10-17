# ── Etapa 1: compilar con Node ──
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_IMAGES_URL=http://localhost:8080/images
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IMAGES_URL=$VITE_IMAGES_URL

RUN npm run build

# ── Etapa 2: servir los archivos ya compilados con Nginx ──
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80