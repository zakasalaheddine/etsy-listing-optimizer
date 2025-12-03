This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Rate Limiting Configuration
# Maximum number of optimizations allowed per email per day
# Default: 5
MAX_OPTIMIZATIONS_PER_DAY=5

# Contact email for users to request more access when rate limit is reached
# Default: support@example.com
CONTACT_EMAIL=support@example.com
```

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string
- `GEMINI_API_KEY` - Google Gemini API key for AI optimization

### Optional Environment Variables

- `MAX_OPTIMIZATIONS_PER_DAY` - Maximum optimizations per email per day (default: 5)
- `CONTACT_EMAIL` - Email address for users to contact when rate limit is reached (default: support@example.com)

## Database Setup

After setting up your database, run the migrations:

```bash
bun run db:push
```

This will create the necessary tables (`emails` and `optimizations`) in your database.
