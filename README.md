# Gathos Affiliate Dashboard

Standalone Next.js portal for `affiliate.gathos.live`. It uses a same-origin BFF
under `/api/affiliate/*` and the backend's dedicated affiliate session cookie.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The portal provides passwordless onboarding, analytics, referral-link CRUD,
conversion history, payout requests/history, and profile editing.
