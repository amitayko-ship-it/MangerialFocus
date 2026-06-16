---
name: Production detection on Replit deployments
description: Why NODE_ENV-based prod detection silently breaks Replit autoscale publishes
---

A Node server that branches on `process.env.NODE_ENV === 'production'` (to choose its
listen port and to serve the built SPA) will FAIL to publish on Replit autoscale,
because Replit does NOT automatically set `NODE_ENV=production` in the deployment runtime.

**Symptom:** Build phase succeeds (vite/tsc build fine, layers pushed), but the deploy
fails at the promote/health-check step ("Creating Autoscale service" then failure). The
app is actually running but listening on the dev port (and not serving `dist/`), so the
startup probe to the configured port (localPort 5000 → externalPort 80) never gets 200.

**Why:** `isProduction` was false in prod, so the server used the dev API port (3001)
and skipped static-file serving.

**How to apply:** Make prod detection robust — `NODE_ENV === 'production' || !!process.env.REPLIT_DEPLOYMENT`
(REPLIT_DEPLOYMENT is auto-injected in all Replit deployments, absent in dev). For
belt-and-suspenders, also set it explicitly in the deploy run command:
`["sh","-c","NODE_ENV=production npx tsx server/index.ts"]`. In prod, bind `0.0.0.0` on
the configured port and ensure `GET /` returns 200.
