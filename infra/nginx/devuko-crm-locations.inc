# Included inside server { } for crm.devuko.ru (HTTP/HTTPS).
# Security headers live in devuko-crm-security-headers.inc and must be included
# in every location that also sets add_header (nginx inheritance quirk).

    client_max_body_size 50m;

    location = /index.html {
        include /etc/nginx/sites-available/devuko-crm-security-headers.inc;
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {
        try_files $uri =404;
        include /etc/nginx/sites-available/devuko-crm-security-headers.inc;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /fonts/ {
        try_files $uri =404;
        include /etc/nginx/sites-available/devuko-crm-security-headers.inc;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /assets/ {
        try_files $uri =404;
        include /etc/nginx/sites-available/devuko-crm-security-headers.inc;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~ ^/(crm-auth|admin)(/|$) {
        proxy_pass http://devuko_crm_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 120s;
    }

    location = /health {
        proxy_pass http://devuko_crm_api/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 10s;
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
