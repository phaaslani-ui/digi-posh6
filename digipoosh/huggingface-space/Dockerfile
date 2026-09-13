FROM node:18-slim

WORKDIR /app

# کپی فایل‌ها
COPY package*.json ./
RUN npm install

COPY . .

# پورت
EXPOSE 7860

# اجرا
CMD ["node", "server.js"]
