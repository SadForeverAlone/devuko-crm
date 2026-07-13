FROM node:25-alpine AS build
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web/ ./
ARG VITE_PUBLIC_URL=https://crm.devuko.ru
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL
ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
