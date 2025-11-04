# 🔧 Database Connection Issues - Troubleshooting Guide

## Common Production Database Connection Errors

### Error: "Can't reach database server"
### Error: "Connection pool timeout"
### Error: "P1001: Can't reach database server at..."

## Quick Fix Checklist

### 1. ✅ Verify Environment Variables in Vercel

**Both variables are REQUIRED:**

```bash
DATABASE_URL=postgresql://username:password@ep-xxx-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
```

**Key differences:**
- `DATABASE_URL`: Uses `-pooler` subdomain + `?pgbouncer=true`
- `DIRECT_URL`: No `-pooler`, no `pgbouncer` parameter

### 2. 🔍 Check Your Database Provider Setup

#### For Neon (Recommended for Vercel):

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Navigate to **Connection Details**
4. You'll see TWO connection strings:
   - **Pooled connection** → Use for `DATABASE_URL`
   - **Direct connection** → Use for `DIRECT_URL`

#### For Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Project Settings → Database
3. **Connection Pooling** section:
   - **Connection pooling string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`
4. Change mode from "Transaction" to **"Session"** for better compatibility

#### For PlanetScale:

1. PlanetScale uses connection pooling by default
2. Get connection string from dashboard
3. Use the SAME string for both:
   ```bash
   DATABASE_URL="mysql://..."
   DIRECT_URL="mysql://..."
   ```

### 3. 🔄 Update Vercel Environment Variables

```bash
# Via Vercel CLI
vercel env add DATABASE_URL
# Paste your pooled connection string

vercel env add DIRECT_URL
# Paste your direct connection string

# Redeploy
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add/Update `DATABASE_URL` (Production)
3. Add/Update `DIRECT_URL` (Production)
4. **IMPORTANT**: Redeploy from Deployments tab

### 4. 🏗️ Run Database Migrations

If tables are missing or schema is outdated:

```bash
# Using direct connection for migrations
DATABASE_URL="your-direct-url" npx prisma migrate deploy

# Or set DIRECT_URL and run
npx prisma migrate deploy
```

### 5. 🧪 Test Connection Locally

```bash
# Test with your production database
DATABASE_URL="your-pooled-url" DIRECT_URL="your-direct-url" npx prisma db pull

# Should see: "Introspected X models and wrote them into..."
```

## Detailed Solutions

### Solution 1: Missing DIRECT_URL

**Symptom:** Migrations fail, or intermittent connection errors

**Fix:**
1. Get direct connection string from your database provider
2. Add to Vercel: Settings → Environment Variables → Add
3. Name: `DIRECT_URL`
4. Value: Your direct connection string (no `-pooler`, no `?pgbouncer=true`)
5. Environments: **Production** ✅
6. Save and redeploy

### Solution 2: Wrong Connection String Format

**Common mistakes:**

❌ **WRONG:**
```bash
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_URL=postgresql://user:pass@host/db  # Same as DATABASE_URL!
```

✅ **CORRECT (Neon):**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://user:pass@ep-xxx.region.neon.tech/db?sslmode=require
```

### Solution 3: Connection Pooling Settings

For Prisma with Neon/Vercel, update `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Solution 4: Database Not Migrated

If you see "Table doesn't exist" errors:

```bash
# Option A: Deploy migrations from local
DATABASE_URL="your-direct-url" npx prisma migrate deploy

# Option B: Use Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Option C: Generate client only (if migrations are already applied)
npx prisma generate
```

### Solution 5: SSL/TLS Issues

Ensure your connection strings include SSL:

```bash
# Add these parameters
?sslmode=require
# or for some providers
?ssl=true
```

## Verification Steps

### Step 1: Test Environment Variables

```bash
# In Vercel project
vercel env ls

# Should show:
# DATABASE_URL (Production)
# DIRECT_URL (Production)
```

### Step 2: Check Prisma Client Generation

```bash
# In your deployment logs, look for:
✓ Generated Prisma Client
```

### Step 3: Test API Endpoint

After deployment, visit:
```
https://your-app.vercel.app/api/accounts
```

Should return JSON (even if empty array), not an error.

## Still Having Issues?

### Check Vercel Deployment Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. Check **Build Logs** and **Function Logs**
5. Look for database connection errors

### Common Log Messages

**"Can't reach database server"**
- Check DATABASE_URL is correct
- Verify database is running and accessible
- Check firewall rules (whitelist Vercel IPs if needed)

**"Too many connections"**
- Using pooled connection (DATABASE_URL with -pooler)?
- Connection limit reached (upgrade database plan)

**"Authentication failed"**
- Wrong username/password
- Database credentials changed
- Check for special characters (URL encode them)

### Get Detailed Error Info

Add to `src/lib/prisma.ts` temporarily:

```typescript
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'], // Enable all logs
  errorFormat: 'pretty',
})
```

## Prevention

### Use Connection String Validator

Create `.env.production.example`:

```bash
# Template for production environment variables
# Copy this to Vercel environment variables

# Database (Neon with Pooling)
DATABASE_URL=postgresql://[user]:[password]@[host]-pooler.[region].neon.tech/[database]?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://[user]:[password]@[host].[region].neon.tech/[database]?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Other required variables...
```

### Deployment Checklist

Before deploying:
- [ ] DATABASE_URL set in Vercel (Production)
- [ ] DIRECT_URL set in Vercel (Production)
- [ ] Database migrations deployed
- [ ] Prisma client generated in build
- [ ] Connection strings tested locally
- [ ] SSL mode enabled in connection strings

## Quick Deploy Command

After fixing environment variables:

```bash
# Redeploy to production
git add -A
git commit -m "Fix database connection configuration"
git push

# Or force redeploy on Vercel
vercel --prod --force
```

---

**Need more help?**
- Check [Neon Docs](https://neon.tech/docs/guides/vercel)
- Check [Prisma Docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- Check [Vercel Docs](https://vercel.com/docs/storage/vercel-postgres)
