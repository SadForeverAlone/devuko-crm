FROM node:25-alpine
RUN apk add --no-cache bash python3 py3-yaml openssl whois \
  && addgroup -S devuko \
  && adduser -S devuko -G devuko
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN rm -f tsconfig.tsbuildinfo && npm run build && npm prune --omit=dev \
  && chown -R devuko:devuko /app
USER devuko
ENV NODE_ENV=production
EXPOSE 8095
CMD ["node", "dist/main.js"]
