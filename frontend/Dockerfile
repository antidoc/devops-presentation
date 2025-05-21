# Етап збірки
FROM node:18-alpine AS builder

WORKDIR /app

# Встановлення залежностей
COPY package.json package-lock.json ./
RUN npm ci

# Копіювання коду
COPY . .

# Збірка для продакшену
RUN npm run build

# Фінальний образ
FROM nginx:alpine

# Копіювання збірки
COPY --from=builder /app/build /usr/share/nginx/html

# Копіювання конфігурації Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Відкриття порту
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]