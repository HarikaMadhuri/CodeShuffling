# Code Shuffling Round

Full-stack React + Express + Prisma/MySQL event platform for one assigned code-shuffling challenge per participant.

## Run locally

1. Copy `server/.env.example` to `server/.env`.
2. Start MySQL: `docker compose up -d`.
3. Install dependencies: `npm install`.
4. Generate and seed Prisma: `npm run db:generate`, `npm run db:push`, `npm run db:seed`.
5. Start both apps: `npm run dev`.

Participant demo credentials: `P001` through `P005` and `P051` through `P055`, password `pass123`.
Admin demo credentials: `admin` / `admin123`.

The browser is not a trust boundary: timers, assignment, shuffle order, validation, completion status, disqualification and leaderboard eligibility are controlled by the API and persisted in MySQL. Browser anti-cheat events are signals that the API records and disqualifies during an active attempt.
