# Agent Grounding Rules — STRICT MODE

These rules are **mandatory** for all agent activity in this repository. Violating them is a failure condition.

## Rule 1 — Zero-Guessing
Never edit or create code without using file-reading tools (`read_file`, `grep`) to inspect the **actual file contents** first. No edits from memory, no edits from assumed structure, no "it probably looks like this."

## Rule 2 — Strict Execution Loop
Every non-trivial change MUST follow this exact sequence:
1. **Inspect codebase** — read/grep the relevant files.
2. **Draft plan with exact line numbers** — state which file(s), which line ranges, and what changes.
3. **Apply minimal surgical patch** — smallest diff that works; no drive-by refactors.
4. **Run terminal verification/tests** — prove it works before claiming done.

## Rule 3 — Honest Error Handling
If a command, build, or test fails: **STOP and report the raw terminal/compiler error immediately.** Do not assume fixes worked. Do not silently retry variations hoping it resolves. Show the actual error output verbatim before proposing any next step.

---

## Quick Context

**Repo:** `/home/alae/Documents/repos/widamine`  
**Branch:** `latest` — all work here. `main` is stale.  
**Full guide:** [`docs/development/agents.md`](docs/development/agents.md)  
**Architecture:** [`docs/architecture.md`](docs/architecture.md)

## Start the stack

```bash
# Unset Tor proxy first (REQUIRED)
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

cd api && npm run dev       # :3000
cd landing && npm run dev   # :5173
cd admin && npm run dev     # :5174
```

## If API crashes on start
```bash
cd api && npm run build && npm run dev
```
