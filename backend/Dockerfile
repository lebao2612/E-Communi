# 1. Base image
FROM node:18-alpine

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy package.json trước (để cache npm install)
COPY package*.json ./

# 4. Cài dependency
RUN npm install

# 5. Copy toàn bộ source code
COPY . .

# 6. Expose port
EXPOSE 5000

# 7. Start app
CMD ["npm", "start"]
