# Quoec Admin — The Citadel estate portal

Standalone Next.js app for the three signed-in roles of The Citadel:

- **Admin** — `/admin` (estates, houses, residents, billing, payments, visitors, notices, support, website listings, journal, site content, insights)
- **Security** — `/security` (gate checks, walk-ins)
- **Resident** — `/resident` (bills, payments, visitors, support)
- Visitor passes — `/pass/[code]`

Sign-in is at `/login`. The public marketing website lives in the separate `TheCitadel` project;
both apps talk to the same backend API and Supabase project.

## Develop

```bash
cp .env.example .env.development   # fill in the values
npm ci
npm run dev                        # http://localhost:3001
```

`npm run typecheck`, `npm run lint`, `npm test` and `npm run test:e2e` (after `npm run build:e2e`) work as usual.
