FROM node:16.13

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run start"]