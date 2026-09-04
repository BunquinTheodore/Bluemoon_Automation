# Bluemoon Automation - Deployment Guide

Complete guide for setting up automated photo deletion and email reports.

## What's Been Implemented

### ✅ Task 1: Password Eye Icon Position
- Password visibility toggle moved to left side of input field
- **Location**: `src/components/LoginScreen.tsx`
- **Status**: Complete - ready to test

### ✅ Task 2: Automatic Photo Deletion
- Client-side filtering: Only shows photos from last 24 hours
- Excludes soft-deleted photos from display
- **Location**: `src/components/PhotoViewerPage.tsx`
- **Vercel Backend**: `vercel-backend/api/cleanup-old-photos.ts`
- **Status**: Client-side complete, backend requires deployment

### ✅ Task 3: Automated Email Reports
- Manual email button added to Owner Sales page
- **Location**: `src/components/OwnerSalesPage.tsx`
- **Vercel Backend**: `vercel-backend/api/send-daily-report.ts`, `send-report-manual.ts`
- **Status**: Frontend complete, backend requires deployment

---

## Prerequisites

Before starting deployment:

1. **Accounts Needed** (all free tier):
   - Vercel account (https://vercel.com/signup)
   - SendGrid account (https://signup.sendgrid.com)
   - Firebase project (already have this)
   - Cloudinary account (already have this)

2. **Tools Needed**:
   - Node.js 18+ installed
   - Terminal/Command Prompt
   - Git (optional but recommended)

---

## Step-by-Step Deployment

### Phase 1: Test Local UI Changes

1. **Start your development server**:
   ```bash
   cd "C:\Blluemoon Automation"
   npm run dev
   ```

2. **Test the changes**:
   - ✅ Login page: Eye icon should be on LEFT side of password field
   - ✅ Owner Dashboard > Sales > Email Report button: Should be visible
   - ✅ Owner/Manager Dashboard > Camera icon > Photo Viewer: Should only show recent photos

### Phase 2: Set Up SendGrid (5 minutes)

1. **Create SendGrid Account**:
   - Go to https://signup.sendgrid.com
   - Sign up with your email
   - Complete verification

2. **Verify Sender Email**:
   - Go to Settings > Sender Authentication
   - Click "Verify a Single Sender"
   - Enter owner's email address
   - Check email and click verification link

3. **Create API Key**:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name: `bluemoon-automation`
   - Permission: `Full Access`
   - Click "Create & View"
   - **IMPORTANT**: Copy the API key immediately (you won't see it again!)

4. **Save for later**:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_SENDER_EMAIL=owner@yourdomain.com
   ```

### Phase 3: Get Firebase Admin Credentials (3 minutes)

1. **Go to Firebase Console**:
   - https://console.firebase.google.com
   - Select your project

2. **Generate Service Account**:
   - Go to Project Settings (gear icon) > Service Accounts
   - Click "Generate New Private Key"
   - Click "Generate Key" - downloads a JSON file

3. **Extract values from JSON**:
   ```json
   {
     "project_id": "your-project-id",          // → FIREBASE_PROJECT_ID
     "client_email": "firebase@...",           // → FIREBASE_CLIENT_EMAIL
     "private_key": "-----BEGIN PRIVATE..."   // → FIREBASE_PRIVATE_KEY
   }
   ```

### Phase 4: Deploy Vercel Backend (10 minutes)

#### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 4.2 Navigate to Backend Directory

```bash
cd "C:\Blluemoon Automation\vercel-backend"
```

#### 4.3 Install Dependencies

```bash
npm install
```

#### 4.4 Login to Vercel

```bash
vercel login
```
Follow prompts to authenticate.

#### 4.5 First Deployment

```bash
vercel
```

Answer the prompts:
- Set up and deploy: **Y**
- Which scope: **[Your account]**
- Link to existing project: **N**
- What's your project's name: **bluemoon-backend**
- In which directory is your code located: **./** (just press Enter)
- Want to override settings: **N**

Wait for deployment to finish. You'll get a URL like:
```
https://bluemoon-backend-xxxxx.vercel.app
```

**Save this URL** - you'll need it!

#### 4.6 Add Environment Variables

**Option A: Via Vercel Dashboard (Easier)**

1. Go to https://vercel.com/dashboard
2. Select `bluemoon-backend` project
3. Go to **Settings** > **Environment Variables**
4. Add each variable for **Production**, **Preview**, and **Development**:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your multi-line private key...
-----END PRIVATE KEY-----"

CLOUDINARY_CLOUD_NAME=dtzxxwzpj
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
SENDGRID_SENDER_EMAIL=owner@yourdomain.com

OWNER_EMAIL=owner@yourdomain.com
```

**Option B: Via CLI**

```bash
vercel env add FIREBASE_PROJECT_ID
# Paste value and select Production, Preview, Development

vercel env add FIREBASE_CLIENT_EMAIL
# Repeat for each variable...
```

#### 4.7 Redeploy to Production

```bash
vercel --prod
```

This creates your production deployment with all environment variables.

**Save your production URL**:
```
https://bluemoon-backend.vercel.app
```

### Phase 5: Update Main App with Vercel URL

1. **Open OwnerSalesPage.tsx**:
   ```typescript
   // Line 153: Replace this URL with your actual Vercel URL
   const vercelUrl = 'https://your-vercel-app.vercel.app';
   ```

2. **Replace with your actual URL**:
   ```typescript
   const vercelUrl = 'https://bluemoon-backend.vercel.app';  // Your actual URL
   ```

3. **Commit and deploy main app**:
   ```bash
   cd "C:\Blluemoon Automation"
   npm run build
   firebase deploy --only hosting
   ```

### Phase 6: Verify Cron Jobs

1. **Go to Vercel Dashboard**:
   - Select `bluemoon-backend` project
   - Go to **Settings** > **Crons**

2. **You should see**:
   ```
   /api/cleanup-old-photos    - Runs daily at 02:00 (2:00 AM)
   /api/send-daily-report     - Runs daily at 23:59 (11:59 PM)
   ```

If you don't see these, make sure `vercel.json` is in your project root.

### Phase 7: Test Everything

#### Test Photo Cleanup

```bash
curl https://bluemoon-backend.vercel.app/api/cleanup-old-photos
```

Expected response:
```json
{
  "success": true,
  "message": "Old photos deleted successfully",
  "deletedCount": 0
}
```

#### Test Daily Email (Today's Report)

```bash
curl https://bluemoon-backend.vercel.app/api/send-daily-report
```

Expected response:
```json
{
  "success": true,
  "message": "Daily report email sent successfully",
  "sentTo": "owner@yourdomain.com",
  "photosIncluded": 5
}
```

#### Test Manual Email Button

1. Log in as Owner
2. Go to Sales & Reports
3. Select a financial report
4. Click "Email Report" button
5. Check owner's email inbox

---

## Monitoring & Maintenance

### Check Vercel Logs

```bash
vercel logs --prod
```

Or via dashboard:
1. Go to https://vercel.com/dashboard
2. Select `bluemoon-backend`
3. Click on latest deployment
4. Go to **Functions** tab
5. Click on any function to see logs

### Check SendGrid Email Activity

1. Go to https://app.sendgrid.com
2. Click **Activity** in sidebar
3. See all sent emails and delivery status

### Check Cloudinary Storage

1. Go to https://cloudinary.com/console
2. View storage usage in dashboard
3. After cleanup runs, you should see storage decrease

---

## Troubleshooting

### Issue: Cron jobs not appearing

**Solution**:
1. Verify `vercel.json` is in project root
2. Redeploy: `vercel --prod`
3. Check Settings > Crons in dashboard

### Issue: Email not sending

**Possible causes**:
1. SendGrid API key invalid
   - Generate new API key
   - Update environment variable: `vercel env add SENDGRID_API_KEY`
   - Redeploy: `vercel --prod`

2. Sender email not verified
   - Go to SendGrid > Settings > Sender Authentication
   - Verify sender email

3. No report for today
   - Email only sends if financial report exists for that date

### Issue: Photos not deleting

**Possible causes**:
1. Cloudinary credentials invalid
   - Verify API key and secret
   - Update environment variables
   - Redeploy

2. No photos older than 24 hours
   - Wait for photos to age
   - Or manually test with older photos

### Issue: "Email Report" button not working

**Possible causes**:
1. Vercel URL not updated in code
   - Update Line 153 in OwnerSalesPage.tsx
   - Rebuild and redeploy main app

2. CORS issues
   - Vercel should handle CORS automatically
   - Check browser console for errors

---

## Cost Breakdown

All services are on **free tiers**:

| Service | Free Tier | Current Usage | Cost |
|---------|-----------|---------------|------|
| Vercel | 100 GB-hours/month | ~1 GB-hour/month | $0 |
| SendGrid | 100 emails/day | 1 email/day | $0 |
| Cloudinary | 25 GB storage | Managed by deletion | $0 |
| Firebase Spark | Generous free tier | Current | $0 |

**Total Monthly Cost**: **$0** ✅

---

## Future Upgrades (When Funded)

When you get funding, consider upgrading:

1. **Firebase Blaze Plan** ($5-10/month)
   - Move cron jobs to Firebase Cloud Functions
   - Tighter integration with Firestore

2. **SendGrid Essentials** ($15/month)
   - 40,000 emails/month
   - Better email analytics

3. **Vercel Pro** ($20/month)
   - Only if exceeding free tier
   - Better performance monitoring

4. **Custom Domain**
   - Professional email addresses
   - Better deliverability

---

## Support

If you encounter issues:

1. **Check Logs**:
   - Vercel: `vercel logs --prod`
   - Browser: Developer Console (F12)
   - SendGrid: Activity dashboard

2. **Common Solutions**:
   - Redeploy: `vercel --prod`
   - Clear browser cache
   - Verify environment variables

3. **Test Endpoints Manually**:
   ```bash
   curl -v https://your-url.vercel.app/api/cleanup-old-photos
   ```

---

## Quick Reference

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **SendGrid Dashboard**: https://app.sendgrid.com
- **Firebase Console**: https://console.firebase.google.com
- **Cloudinary Console**: https://cloudinary.com/console

### Important Commands

```bash
# Deploy to Vercel
cd vercel-backend
vercel --prod

# View logs
vercel logs --prod

# Update environment variable
vercel env add VARIABLE_NAME

# Test main app locally
cd "C:\Blluemoon Automation"
npm run dev

# Deploy main app
npm run build
firebase deploy --only hosting
```

---

## Next Steps

After successful deployment:

1. ✅ Monitor cron job execution for 24 hours
2. ✅ Verify email delivery
3. ✅ Check photo cleanup is working
4. ✅ Test manual email button
5. ✅ Monitor Cloudinary storage usage
6. ✅ Set up alerts (optional)

**Congratulations!** 🎉 Your automated system is now live!
