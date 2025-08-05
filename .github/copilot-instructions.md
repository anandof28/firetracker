<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Fire Tracker - Next.js with Prisma SQLite

This is a Next.js application with React and Prisma ORM connected to a SQLite database.

## Project Structure
- Built with Next.js 15 using App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Prisma ORM for database management
- SQLite as the database

## Development Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use Prisma for all database operations
- Implement proper error handling and validation
- Use Tailwind CSS classes for styling
- Follow React best practices with hooks and components

## Database
- The database schema is defined in `prisma/schema.prisma`
- Models include: Account, FD (Fixed Deposit), Gold, and Transaction
- Use the Prisma client from `src/lib/prisma.ts` for database operations
- Run `npx prisma migrate dev` to apply schema changes
- Run `npx prisma generate` after schema updates

## API Routes
- Create API routes in `src/app/api/` directory
- Available routes: `/accounts`, `/fds`, `/gold`, `/transactions`
- Use proper HTTP methods and status codes
- Implement proper error handling and validation

## Financial Models
- Account: Track multiple financial accounts with balances
- FD: Manage fixed deposits with interest rates and maturity dates
- Gold: Record gold investments by weight and value
- Transaction: Log income and expense transactions with categories
