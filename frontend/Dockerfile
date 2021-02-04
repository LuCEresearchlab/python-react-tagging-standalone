FROM node:latest

EXPOSE 8080

WORKDIR /app

COPY . /app

RUN npm ci

CMD ["npm", "start"]