# Используем Node.js как базовый образ
FROM node:18-alpine

# Устанавливаем Bun
RUN npm install -g bun

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости через Bun
RUN bun install

# Копируем остальные файлы
COPY . .

# Запускаем бота через Bun
CMD ["bun", "start"] 