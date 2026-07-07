FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# บังคับให้ build ด้วย VITE_API_URL=/api เสมอ (ไม่ใช้ค่าจาก .env ที่เป็น localhost:3000)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80