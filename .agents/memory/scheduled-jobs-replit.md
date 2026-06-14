---
name: Scheduled jobs on Replit
description: How to run recurring/cron-style jobs in a Replit project without breaking the main app deployment
---

Recurring jobs (cron-style) must run as a **separate Replit Scheduled Deployment**, not as an in-process timer inside an autoscale web app.

**Why:** Autoscale deployments scale to zero and spin up per-request, so in-process `setInterval`/cron never fires reliably. Also, a repl's `deployConfig` sets ONE deployment config — calling `deployConfig({deploymentTarget:"scheduled"})` would overwrite the main app's autoscale config.

**How to apply:** Write a standalone one-shot runner script (does work, then exits). Tell the user to create a new Scheduled Deployment in the Replit UI pointing at that script (e.g. `npx tsx server/sendReminders.ts`) on the desired cadence. Make the job idempotent (guard against double-runs) since scheduled runs can overlap or retry. Secrets are shared repl-wide, so the scheduled deployment gets the same env automatically.
