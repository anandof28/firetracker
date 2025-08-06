# Fire Tracker

A modern web application built with **Next.js**, **React**, and **Prisma** ORM connected to a **SQLite** database.

## Features

- 🚀 **Next.js 15** with App Router
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🗄️ **Prisma ORM** for database management
- � **SQLite** database (perfect for development)
- 📝 **ESLint** for code quality

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (18 or later)
- **npm**, **yarn**, **pnpm**, or **bun** package manager

*Note: No separate database server needed - SQLite is file-based!*

## Getting Started

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Database Setup

The SQLite database is automatically created when you run the migration. No additional setup required!

1. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma client (if needed):**
   ```bash
   npx prisma generate
   ```

*The SQLite database file (`dev.db`) will be created automatically in your project root.*

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
fire-tracker/
├── prisma/
│   ├── migrations/            # Database migrations
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── accounts/
│   │   │   │   └── route.ts   # Account management API
│   │   │   ├── fds/
│   │   │   │   └── route.ts   # Fixed deposits API
│   │   │   ├── gold/
│   │   │   │   └── route.ts   # Gold investments API
│   │   │   └── transactions/
│   │   │       └── route.ts   # Transactions API
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main dashboard
│   └── lib/
│       └── prisma.ts          # Prisma client configuration
├── .env                       # Environment variables
├── dev.db                     # SQLite database file
└── package.json
```

## Database Schema

The Fire Tracker includes comprehensive financial tracking models:

- **Account**: Manage multiple financial accounts (savings, checking, etc.)
- **FD (Fixed Deposit)**: Track fixed deposits with amount, interest rate, and maturity dates
- **Gold**: Record gold investments by weight (grams) and current value
- **Transaction**: Log all income and expense transactions with categories

## API Endpoints

- `GET /api/accounts` - Fetch all accounts
- `POST /api/accounts` - Create a new account
- `GET /api/fds` - Fetch all fixed deposits
- `POST /api/fds` - Create a new fixed deposit
- `GET /api/gold` - Fetch all gold records
- `POST /api/gold` - Create a new gold record
- `GET /api/transactions` - Fetch all transactions
- `POST /api/transactions` - Create a new transaction

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma client

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://reactjs.org/docs) - Learn React
- [Prisma Documentation](https://www.prisma.io/docs) - Learn about Prisma ORM
- [Tailwind CSS](https://tailwindcss.com/docs) - Learn Tailwind CSS
- [SQLite Documentation](https://sqlite.org/docs.html) - Learn SQLite

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
