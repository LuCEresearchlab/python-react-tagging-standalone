FROM node:15.14.0-alpine3.10

EXPOSE 8080

WORKDIR /app

COPY . /app

RUN npm ci

CMD ["npm", "start"]
