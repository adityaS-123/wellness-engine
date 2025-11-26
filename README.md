# Wellness Engine

Wellness Engine is a Next.js web application and clinical prescription-generation engine. It provides a UI to collect patient data, run prescription generation logic, and persist chat sessions, prescriptions, protocols, and supplements via Prisma and PostgreSQL.

This repository contains the Next.js app (App Router), server API routes, a small rule-based engine in `src/lib/engine`, and Prisma schema and seeds to populate demo data.

## Key Features

- Interactive UI built with Next.js (App Router) and Tailwind CSS
- Prescription generation engine with validation and scoring
- Chat sessions persisted per user (localStorage + API)
- Prisma ORM for Postgres with migrations and seed data
- Zod validation and react-hook-form for robust input handling

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Prisma (Postgres)
- Zod, react-hook-form
- bcryptjs (authentication helpers)

## Prerequisites

- Node.js 18+ (recommend latest LTS)
- PostgreSQL (local or remote) and a connection URL
- pnpm/yarn/npm work too, examples use `npm` commands

## Quick Start (Development)

1. Clone the repo:

```bash
git clone https://github.com/your-org/wellness-engine.git
cd wellness-engine
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root (copy `.env.example` if present) and set at minimum:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wellness
NEXT_PUBLIC_APP_URL=http://localhost:3000
# (add other values the project expects, e.g. NEXTAUTH_SECRET)
```

4. Generate the Prisma client (and run migrations if needed):

```bash
npx prisma generate
# apply migrations (this will create tables defined in prisma/schema.prisma)
npx prisma migrate dev --name init
```

5. Seed the database (the repo includes a `prisma/seed.ts` script):

```bash
npm run prisma:seed
```

6. Start the Next.js dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database / Prisma Notes

- The project uses Prisma to model `User`, `Protocol`, `Supplement`, `ChatSession`, and other domain tables. Migrations live in `prisma/migrations`.
- If you change `prisma/schema.prisma`, re-run `npx prisma migrate dev` and `npx prisma generate` to update the client.
- If you run into Prisma version warnings about datasource `url` handling or `PrismaClient` options, check the `prisma/` folder and follow the Prisma docs for your installed Prisma version.

## Useful NPM Scripts

- `npm run dev` — run Next.js in development mode
- `npm run build` — build the Next.js app for production
- `npm run start` — start the production server after build
- `npm run prisma:seed` — run the seed script to populate demo data

See `package.json` for the full list of scripts.

## Environment Variables

Document any required environment variables here (example):

- `DATABASE_URL` — Postgres connection URL
- `NEXTAUTH_SECRET` — secret used for authentication/session tokens (if used)
- `NEXT_PUBLIC_APP_URL` — public base URL for the app

Add any additional variables required by your deployment environment.

## Running Tests (if applicable)

If the repo contains tests, run them with your chosen test runner. Example:

```bash
npm test
```

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch
2. Make changes and add tests where appropriate
3. Open a pull request describing your changes

Please follow the existing code style and run linting/tests before submitting.

## Deployment

You can deploy this Next.js app to Vercel, or any Node.js host that supports Next.js. For Vercel, connect the repo, set the environment variables in your Vercel project settings, and deploy.

## Troubleshooting

- If you see runtime errors about Prisma configuration, ensure `DATABASE_URL` is set and that the Prisma client was generated with `npx prisma generate`.
- If Next.js fails to compile after changing TypeScript types, restart the dev server after saving the change.
