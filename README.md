# Devuko CRM

Universal platform CRM for managing workspaces (sites).  
Production: **https://crm.devuko.ru**

## Layout (platform convention)

```txt
/home/<user>/sites/crm.devuko.ru/repo/   # this repository (dev)
/srv/sites/crm.devuko.ru/repo/          # production deploy
/home/<user>/web/crm.devuko.ru           # symlink → sites/.../repo
```

Same pattern as Selfpact (`sites/selfpact.ru/repo`).

## Apps

```txt
apps/web/     @devuko/crm-web — CRM UI
apps/api/     @devuko/crm-api — platform API + workspace proxy
platform/     site registry & provisioning scripts
```

## Dev

```bash
cd ~/sites/crm.devuko.ru/repo/docker && docker compose up -d

cd ~/sites/crm.devuko.ru/repo/apps/api
cp .env.example .env && npm install && npm run start:dev

cd ~/sites/crm.devuko.ru/repo/apps/web
cp .env.example .env && npm install && npm run dev
```

Shortcut via symlink: `~/web/crm.devuko.ru`
