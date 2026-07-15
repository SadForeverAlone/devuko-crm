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
RUN chown -R nginx:nginx /usr/share/nginx/html \
  && mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp \
    /run \
  && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run /run
USER nginx
EXPOSE 80
