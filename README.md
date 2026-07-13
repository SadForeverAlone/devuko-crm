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

## Production

On the server as **root** (first time):

```bash
bash /home/sherli/sites/crm.devuko.ru/repo/infra/deploy/bootstrap-prod.sh
```

Updates:

```bash
cd /srv/sites/crm.devuko.ru/repo
export VITE_PUBLIC_URL=https://crm.devuko.ru
sudo -u sherli bash -lc 'cd /srv/sites/crm.devuko.ru/repo && make deploy'
```

Requires:

- DNS `crm.devuko.ru` → server IP
- `certbot` for HTTPS (bootstrap tries automatically)
- Same `DEVUKO_PROXY_SECRET` in CRM and Selfpact `apps/backend/.env`

Prod ports: API **8095**, web container **8096**, host nginx serves static + proxies API.

Create CRM admin (not in bootstrap):

```bash
bash platform/bin/crm-add-admin.sh you@example.com 'your-password' 'Your Name'
```
