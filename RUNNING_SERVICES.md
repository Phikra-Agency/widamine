# 🚀 Widamine Services Running

**Started:** August 13, 2026 at 9:35 AM

---

## ✅ All Services Active

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **API** | 3000 | http://localhost:3000 | ✅ Running |
| **Admin** | 5174 | http://localhost:5174 | ✅ Running |
| **Landing** | 5173 | http://localhost:5173 | ✅ Running |

---

## 📺 Tmux Sessions

All services are running in separate tmux sessions:

```bash
# List all sessions
tmux ls

# Output:
# widamine-api: 1 windows (created Thu Aug 13 09:35:19 2026)
# widamine-admin: 1 windows (created Thu Aug 13 09:35:30 2026)
# widamine-landing: 1 windows (created Thu Aug 13 09:35:40 2026)
```

---

## 🔍 View Logs

### API Logs
```bash
tmux attach -t widamine-api
# Press Ctrl+B then D to detach
```

### Admin Logs
```bash
tmux attach -t widamine-admin
# Press Ctrl+B then D to detach
```

### Landing Logs
```bash
tmux attach -t widamine-landing
# Press Ctrl+B then D to detach
```

---

## 🛑 Stop Services

### Stop Individual Service
```bash
# Stop API
tmux kill-session -t widamine-api

# Stop Admin
tmux kill-session -t widamine-admin

# Stop Landing
tmux kill-session -t widamine-landing
```

### Stop All Services
```bash
tmux kill-session -t widamine-api
tmux kill-session -t widamine-admin
tmux kill-session -t widamine-landing
```

Or use this one-liner:
```bash
tmux kill-session -t widamine-api && tmux kill-session -t widamine-admin && tmux kill-session -t widamine-landing
```

---

## 🔄 Restart a Service

### Restart API
```bash
tmux kill-session -t widamine-api
cd /home/alae/Documents/repos/widamine/api
tmux new-session -d -s widamine-api 'npm run dev'
```

### Restart Admin
```bash
tmux kill-session -t widamine-admin
cd /home/alae/Documents/repos/widamine/admin
tmux new-session -d -s widamine-admin 'npm run dev'
```

### Restart Landing
```bash
tmux kill-session -t widamine-landing
cd /home/alae/Documents/repos/widamine/landing
tmux new-session -d -s widamine-landing 'npm run dev'
```

---

## 🧪 Quick Tests

### Test API
```bash
curl http://localhost:3000/motifs/public
# Should return JSON array of treatments
```

### Test Admin
```bash
curl -s http://localhost:5174 | grep -o '<title>.*</title>'
# Should output: <title>Widamine — Back Office</title>
```

### Test Landing
```bash
curl -s http://localhost:5173 | grep -o '<title>.*</title>'
# Should output: <title>Widamine Aesthetic Center</title>
```

---

## 🔐 Login Credentials

**Admin Dashboard:** http://localhost:5174

- **Email:** admin@widamine.com
- **Password:** admin123

---

## 📊 Process IDs

Check running processes:
```bash
lsof -i :3000 -i :5173 -i :5174 | grep LISTEN
```

---

## 🔧 Tmux Cheat Sheet

| Command | Description |
|---------|-------------|
| `tmux ls` | List all sessions |
| `tmux attach -t SESSION_NAME` | Attach to session |
| `Ctrl+B then D` | Detach from session (while attached) |
| `tmux kill-session -t SESSION_NAME` | Kill a session |
| `Ctrl+B then [` | Scroll mode (arrow keys, Q to exit) |
| `Ctrl+B then C` | Create new window (if attached) |
| `Ctrl+B then N` | Next window (if attached) |

---

## 🔥 Features Verified

### API (Port 3000)
- ✅ NestJS server running
- ✅ WhatsApp client initialized (212773531420)
- ✅ Database connected (PostgreSQL)
- ✅ REST API endpoints active

### Admin (Port 5174)
- ✅ Vite dev server running
- ✅ React app loaded
- ✅ Title: "Widamine — Back Office"

### Landing (Port 5173)
- ✅ Vite dev server running
- ✅ React app loaded
- ✅ Title: "Widamine Aesthetic Center"

---

## 📱 WhatsApp Integration

The API has initialized a WhatsApp client:
- **Phone:** 212773531420
- **Status:** ✅ Connected and ready
- **Session:** Persistent (stored in API)

---

## 🎯 Next Steps

1. **Access Admin Dashboard:**
   - Open http://localhost:5174
   - Login with admin@widamine.com / admin123
   - Explore calendar, patients, settings

2. **Access Public Site:**
   - Open http://localhost:5173
   - Browse services
   - Test booking flow
   - Try the AI chatbot

3. **Test API:**
   - Use Postman/Thunder Client
   - Import endpoints from `api/src/` controllers
   - Test authentication flow

4. **Monitor Logs:**
   - Attach to any tmux session
   - Watch real-time logs
   - Debug any issues

---

**All systems operational! Ready for development and testing.** 🎉
