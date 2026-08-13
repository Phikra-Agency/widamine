# Widamine — WSL setup

> Legacy doc. The project now lives at `/home/alae/Documents/repos/widamine/` natively on Linux.

## Quick commands

```bash
cd /home/alae/Documents/repos/widamine
./start-mongodb.sh
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
npm run dev
```

## URLs

- **Landing:** http://localhost:5173
- **Admin:** http://localhost:5174
- **API:** http://localhost:3000
- **Login:** `admin@widamine.com` / `admin123`

## Proxy env vars

The system has Tor proxy vars set — unset them before running the API or the chatbot will fail to reach Groq.
