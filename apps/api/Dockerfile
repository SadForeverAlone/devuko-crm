FROM node:25-alpine
RUN apk add --no-cache bash python3 py3-yaml docker-cli docker-cli-compose openssl whois
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -f tsconfig.tsbuildinfo && npm run build
EXPOSE 8095
CMD ["npm", "run", "start"]
