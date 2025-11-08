# 🚀 Vercel Auto-Deploy Setup Guide

## Current Status
✅ Manual deployment works (`vercel --prod`)  
❌ GitHub auto-deploy is NOT configured

## How to Enable Auto-Deploy from GitHub

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/anands-projects-357df534/fire-tracker-personal

2. **Navigate to Settings → Git**
   - Click on "Settings" tab
   - Click on "Git" in the left sidebar

3. **Connect GitHub Repository**
   - If not connected, click "Connect Git Repository"
   - Select your GitHub account
   - Choose repository: `anandof28/firetracker` (or `Ramanandc/firetracker`)
   - Authorize Vercel to access the repository

4. **Configure Auto-Deploy Settings**
   - **Production Branch**: `main` (default)
   - **Install Command**: `npm ci` (already configured)
   - **Build Command**: `npm run build:deploy` (already configured)
   - **Output Directory**: `.next` (auto-detected)
   - **Root Directory**: `.` (default)

5. **Enable Automatic Deployments**
   - Toggle ON: "Automatically deploy from Git repository"
   - Production Deployments: `main` branch
   - Preview Deployments: All branches (optional)

6. **Save Settings**
   - Click "Save"
   - Vercel will now automatically deploy on every `git push` to main branch

### Option 2: Via Vercel CLI

```bash
# Link your local project to Vercel
vercel link

# Follow the prompts:
# ? Set up and deploy "~/Projects/learning/fire-tracker"? [Y/n] Y
# ? Which scope do you want to deploy to? anands-projects-357df534
# ? Link to existing project? [Y/n] Y
# ? What's the name of your existing project? fire-tracker-personal

# Deploy and set up auto-deploy
vercel --prod

# Verify GitHub integration
vercel git
```

### Option 3: GitHub App Integration (Most Reliable)

1. **Install Vercel GitHub App**
   - Visit: https://github.com/apps/vercel
   - Click "Install" or "Configure"
   - Select your GitHub account
   - Choose repositories:
     - Select "Only select repositories"
     - Choose: `firetracker` (or your repo name)
   - Click "Install & Authorize"

2. **Vercel Will Auto-Detect**
   - Once installed, Vercel automatically detects your repository
   - Every push to `main` branch will trigger a deployment
   - Pull requests will get preview deployments

## Verify Auto-Deploy is Working

### Test the Setup

1. **Make a small change**
   ```bash
   # Edit any file (e.g., README.md)
   echo "# Test auto-deploy" >> README.md
   
   # Commit and push
   git add README.md
   git commit -m "Test auto-deploy"
   git push
   ```

2. **Check Vercel Dashboard**
   - Go to: https://vercel.com/anands-projects-357df534/fire-tracker-personal
   - You should see a new deployment starting automatically
   - Status will show "Building..." then "Ready"

3. **Check via CLI**
   ```bash
   vercel ls
   # Should show a new deployment with "Building" or "Ready" status
   ```

## Current Deployment URLs

- **Production**: https://fire-tracker-personal.vercel.app
- **Latest Deploy**: https://fire-tracker-personal-78b224tbf-anands-projects-357df534.vercel.app
- **Inspect**: https://vercel.com/anands-projects-357df534/fire-tracker-personal/FkLp9YicrSqLyvhEfPaNBjyP9y9k

## Troubleshooting Auto-Deploy

### Issue: Deployments Not Triggering

**Check 1: GitHub Webhooks**
```bash
# In your GitHub repository settings
# Settings → Webhooks
# Look for webhook from vercel.com
# Recent Deliveries should show successful payloads
```

**Check 2: Vercel Git Integration**
```bash
# Check if project is linked to Git
vercel git
```

**Check 3: Branch Configuration**
```bash
# Ensure you're pushing to the correct branch
git branch
# Should show * main

# Check remote
git remote -v
# Should show your GitHub repository
```

### Issue: Deployment Fails

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on failed deployment
   - Review build logs for errors

2. **Common Fixes**
   ```bash
   # Ensure all dependencies are in package.json
   npm install
   
   # Test build locally
   npm run build:deploy
   
   # Check environment variables in Vercel dashboard
   ```

### Issue: Wrong Branch Deploying

1. **Update Production Branch**
   - Vercel Dashboard → Settings → Git
   - Change "Production Branch" to `main`
   - Save changes

## Manual Deployment (Backup Method)

If auto-deploy is not working, you can always manually deploy:

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Deploy with environment variables
vercel --prod -e DATABASE_URL=your_url

# Force rebuild
vercel --prod --force
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run start
   ```

2. **Use preview deployments for testing**
   ```bash
   # Create a branch
   git checkout -b feature/new-feature
   
   # Push to GitHub
   git push -u origin feature/new-feature
   
   # Vercel will create a preview deployment
   ```

3. **Monitor deployments**
   ```bash
   # Watch deployment status
   vercel ls
   
   # Check logs
   vercel logs [deployment-url]
   ```

## Environment Variables

Current environment variables are set in `vercel.json`, but they should be moved to Vercel Dashboard for security:

1. **Go to Settings → Environment Variables**
2. **Add each variable:**
   - DATABASE_URL
   - DIRECT_URL
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - etc.
3. **Select environments**: Production, Preview, Development
4. **Save**

5. **Remove from vercel.json** (after adding to dashboard):
   ```json
   {
     "version": 2,
     "framework": "nextjs",
     "buildCommand": "npm run build:deploy",
     "installCommand": "npm ci"
   }
   ```

---

## Quick Commands Reference

```bash
# Check deployment status
vercel ls

# Deploy to production
vercel --prod

# Check which project you're linked to
vercel inspect

# Remove link (to re-link)
vercel unlink

# Link to project
vercel link

# Check Git integration
vercel git

# View logs
vercel logs [deployment-url]

# Open project in browser
vercel open
```

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Vercel Git Integration: https://vercel.com/docs/deployments/git
- Contact: support@vercel.com
