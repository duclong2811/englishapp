# Accounts, roles and AI limits

## Roles

| Who | AI features | Progress |
|---|---|---|
| Guest (not signed in) | Off: AI chat, session feedback, writing/speaking grading, speech recognition, natural voice (device voice is used) | Kept in this browser only |
| Member (signed up with email + password) | On, within the daily limits in `src/lib/ai/policy.ts` (`AI_RULES[...].daily`, `TRANSCRIBE_DAILY`) | Synced to the account |
| Administrator | On, no limits; sees `/admin` | Synced |

Everything that does not call AI (lessons, vocabulary, flashcards, tests with answer keys) is open to everyone.

Without a database bound (local `next dev`, or before D1 is set up) the site runs in **open mode**: no sign-in, AI not gated.

## Setup on Cloudflare

1. Workers & Pages → D1 → Create database, name `englishapp`. Copy its **database ID**.
2. Add to `wrangler.jsonc`:
   ```jsonc
   "d1_databases": [{ "binding": "DB", "database_name": "englishapp", "database_id": "<id>" }]
   ```
   Tables are created automatically on first request (`src/lib/server/db.ts`).
3. Worker → Settings → Variables: add `ADMIN_EMAILS` (plain text, comma-separated). Those addresses become administrators when they sign up or next sign in.

## Code map

- `src/lib/server/db.ts`: D1 schema, `getDb()`.
- `src/lib/server/auth.ts`: password hashing (PBKDF2-SHA256), sessions (httpOnly cookie `vta_session`, 30 days, only a hash stored), `getViewer()`.
- `src/lib/server/quota.ts`: `aiGate(feature, level)`; every AI route calls it before spending money.
- `src/lib/sync/merge.ts`: how progress from two devices is merged (used by browser and server).
- API: `/api/auth/{register,login,logout,me,password}`, `/api/progress`, `/api/admin/{users,users/[id],stats}`.
- Pages: `/login`, `/account`, `/admin`.

Limits: 10 failed sign-ins per email per hour; 5 sign-ups per IP per hour; passwords at least 8 characters.
