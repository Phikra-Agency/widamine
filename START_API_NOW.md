# ⚡ START API SERVER NOW

## I've killed the old server. Now you need to start it!

### In your terminal, run:

```bash
cd /home/alae/Documents/repos/widamine/api
npm run dev
```

### Wait for this message:
```
✅ Nest application successfully started
[main.ts] Server started on 0.0.0.0:3000
```

### Then refresh your browser at:
http://localhost:5174/unavailabilities

---

## What to look for in the startup logs:

You should see these new route mappings:
```
[RoutesResolver] UnavailabilityController {/unavailabilities}
[RouterExplorer] Mapped {/unavailabilities, POST} route
[RouterExplorer] Mapped {/unavailabilities, GET} route
[RouterExplorer] Mapped {/unavailabilities/statistics, GET} route
[RouterExplorer] Mapped {/unavailabilities/:id, GET} route
[RouterExplorer] Mapped {/unavailabilities/:id, PUT} route
[RouterExplorer] Mapped {/unavailabilities/:id, DELETE} route
[RouterExplorer] Mapped {/unavailabilities/:id/approve, POST} route
[RouterExplorer] Mapped {/unavailabilities/:id/reject, POST} route
```

If you see these lines, the module is loaded successfully! ✅

---

## Quick Test After Start:

```bash
# Test the endpoint (in another terminal)
curl http://localhost:3000/unavailabilities
```

You should get:
- `401 Unauthorized` = Good! Endpoint exists but needs authentication
- `404 Not Found` = Bad! Module not loaded, check startup logs

---

## Alternative: Screen Session

If you want to start it in background:

```bash
screen -S widamine-api
cd /home/alae/Documents/repos/widamine/api
npm run dev
```

Then press `Ctrl+A` then `D` to detach.

To reattach later: `screen -r widamine-api`

---

## If you get errors about modules not found:

```bash
cd /home/alae/Documents/repos/widamine/api
npm install
npm run dev
```

---

That's it! Once the server starts, go to http://localhost:5174/unavailabilities and test! 🚀
