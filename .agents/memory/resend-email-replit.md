---
name: Resend email on Replit
description: Constraints when sending transactional email via Resend in a Replit project
---

Resend will only deliver to arbitrary recipient addresses once a sending **domain is verified** in the Resend dashboard.

**Why:** The default `onboarding@resend.dev` sender is test-only — it silently/explicitly restricts delivery to the Resend account owner's own email, so real users won't get messages.

**How to apply:** Keep the sender configurable via env (e.g. `RESEND_SENDER_EMAIL`). Tell the user they must (1) verify a domain in Resend and (2) set `RESEND_SENDER_EMAIL` to an address on that domain before real delivery works.
