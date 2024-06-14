FROM node:20-alpine

RUN apk add python3 make g++\
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173
