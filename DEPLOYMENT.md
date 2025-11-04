# 🚀 Fire Tracker - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Clerk Account**: Sign up at [clerk.com](https://clerk.com) for authentication
3. **GitHub Repository**: Code should be pushed to GitHub

## Step-by-Step Deployment

### 1. Set up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Get your API keys from the API Keys section:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 2. Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Link to GitHub? Yes
# - Project name: fire-tracker
# - Deploy? Yes
```

#### Option B: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure as follows:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:
```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (PostgreSQL for production)
# Both URLs required for connection pooling (Neon/Vercel)
DATABASE_URL=postgresql://username:password@pooled-host:port/database?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://username:password@direct-host:port/database?sslmode=require

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=your-email@example.com

# Feature Request Admin
ADMIN_EMAIL=your-admin-email@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 4. Database Considerations

#### For Development/Demo (SQLite):
- Current setup uses SQLite which works on Vercel
- Database resets on each deployment (serverless limitation)
- Good for testing and demonstration

#### For Production (PostgreSQL):
```bash
# Update Prisma schema
# Change provider from "sqlite" to "postgresql"

# Update DATABASE_URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Run migrations on production database
npx prisma migrate deploy
```

**Recommended PostgreSQL providers:**
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [PlanetScale](https://planetscale.com) - Free tier available

### 5. Configure Clerk Domains

In Clerk Dashboard:
1. Go to **Domains** section
2. Add your Vercel domain (e.g., `fire-tracker.vercel.app`)
3. Update redirect URLs if needed

### 6. Build and Deploy

```bash
# Test build locally
npm run build
npm run start

# Deploy to Vercel
vercel --prod
```

## 🔧 Deployment Configuration Files

### vercel.json
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

### Environment Variables (.env.example)
Copy `.env.example` to `.env.local` for local development and configure the variables in Vercel dashboard for production.

## 🚀 Quick Deploy Commands

```bash
# Clone and deploy in one go
git clone <your-repo>
cd fire-tracker
npm install
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... add other variables

# Deploy to production
vercel --prod
```

## ✅ Post-Deployment Checklist

### Core Features:
- [ ] Authentication working (sign in/up)
- [ ] Database connections established
- [ ] Dashboard loading with financial data
- [ ] All API routes responding correctly
- [ ] Mobile responsiveness verified

### New Feature Request System:
- [ ] Feature requests page accessible at `/support/feature-requests`
- [ ] Users can submit feature requests (requires authentication)
- [ ] Admin receives email notifications for new requests
- [ ] Admin panel accessible at `/admin/feature-requests` (admin email only)
- [ ] Admin can approve/decline and manage feature requests

### Communication Features:
- [ ] Contact form sending emails (`/support/contact`)
- [ ] Feedback form working (`/support/feedback`)
- [ ] Email notifications configured and working

## 🐛 Common Issues & Solutions

### Build Failures:
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Prisma Issues:
```bash
# Regenerate Prisma client
npx prisma generate
npm run build
```

### Environment Variables:
- Ensure all variables are set in Vercel dashboard
- Check variable names match exactly
- Restart deployment after adding variables

## 📊 Production Considerations

### Performance:
- ✅ Next.js automatic optimizations
- ✅ Vercel Edge Network (CDN)
- ✅ API route caching
- ✅ Image optimization

### Security:
- ✅ Clerk authentication
- ✅ HTTPS by default
- ✅ Environment variable encryption
- ✅ SQL injection protection (Prisma)

### Monitoring:
- Vercel Analytics (built-in)
- Error tracking via Vercel dashboard
- Performance monitoring

## 🎯 Success!

Once deployed, your Fire Tracker will be available at:
`https://fire-tracker-<random>.vercel.app`

You can also configure a custom domain in Vercel settings.

---

**Need Help?** 
- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
