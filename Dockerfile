FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

LABEL org.opencontainers.image.source=https://github.com/abdul-basit780/shop-ease

RUN npm run build
CMD npm run start