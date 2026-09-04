# Bluemoon Backend - Vercel Serverless Functions

This is the backend for Bluemoon Automation system, handling automated photo cleanup and daily email reports.

## Features

- **Automated Photo Deletion**: Deletes employee task photos from Cloudinary after 24 hours
- **Daily Email Reports**: Sends automated daily reports to owner at 11:59 PM
- **Manual Email Trigger**: Owner can manually request reports for specific dates

## Setup Instructions

### 1. Install Dependencies

```bash
cd vercel-backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=dtzxxwzpj
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_SENDER_EMAIL=verified-sender@example.com

# Owner Email (fallback)
OWNER_EMAIL=owner@bluemoon.com

# Shared secret for cron endpoints. Vercel automatically sends it as
# `Authorization: Bearer <CRON_SECRET>` on scheduled invocations.
CRON_SECRET=generate-a-long-random-string
```

> **Note:** The frontend currently uses the Firebase Cloud Functions in `../functions/`
> (`cleanupOldPhotos`, `sendDailyReport`, `sendReportManual`). This Vercel backend is an
> alternative deployment of the same features and is not required when the Firebase
> functions are deployed.

### 3. Get Firebase Admin SDK Credentials

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract `project_id`, `client_email`, and `private_key` to your `.env` file

### 4. Set up SendGrid

1. Create account at https://sendgrid.com (free tier: 100 emails/day)
2. Go to Settings > API Keys
3. Create new API key with "Full Access"
4. Verify sender email in SendGrid dashboard
5. Add API key and sender email to `.env`

### 5. Deploy to Vercel

#### First Time Deployment

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: bluemoon-backend
- Directory: ./
- Override settings: No

#### Add Environment Variables to Vercel

```bash
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_SENDER_EMAIL
vercel env add OWNER_EMAIL
vercel env add CRON_SECRET
```

Or add them via Vercel Dashboard:
1. Go to https://vercel.com
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable for Production, Preview, and Development

#### Production Deployment

```bash
vercel --prod
```

### 6. Verify Cron Jobs

After deployment:
1. Go to Vercel Dashboard > Your Project > Settings > Crons
2. Verify two cron jobs are registered:
   - `/api/cleanup-old-photos` - Daily at 12:00 AM (UTC)
   - `/api/send-daily-report` - Daily at 11:59 PM

## API Endpoints

All endpoints require authentication:
- Cron endpoints (`cleanup-old-photos`, `send-daily-report`): `Authorization: Bearer <CRON_SECRET>`
- `send-report-manual`: `Authorization: Bearer <Firebase ID token>` of a user whose Firestore `users/{uid}.role` is `owner`

### GET/POST /api/cleanup-old-photos
Deletes photos older than 24 hours from Cloudinary and marks them as deleted in Firestore.

**Response:**
```json
{
  "success": true,
  "message": "Old photos deleted successfully",
  "deletedCount": 15
}
```

### GET /api/send-daily-report
Sends the financial report for today (Asia/Manila) to the owner with task photos.

**Response:**
```json
{
  "success": true,
  "message": "Daily report email sent successfully",
  "sentTo": "owner@bluemoon.com",
  "date": "2025-01-15",
  "dailyEarnings": 50000,
  "netSales": 44000,
  "photosIncluded": 12
}
```

### POST /api/send-report-manual
Manually sends report for a specific date.

**Request Body:**
```json
{
  "date": "2025-01-15"
}
```

The date must be in `YYYY-MM-DD` format.

**Response:**
```json
{
  "success": true,
  "message": "Report email sent successfully",
  "sentTo": "owner@bluemoon.com",
  "date": "2025-01-15",
  "photosIncluded": 12
}
```

## Local Development

```bash
vercel dev
```

This starts a local development server at `http://localhost:3000`

## Testing

### Test Photo Cleanup
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-project.vercel.app/api/cleanup-old-photos
```

### Test Daily Email
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-project.vercel.app/api/send-daily-report
```

### Test Manual Email
```bash
curl -X POST https://your-project.vercel.app/api/send-report-manual \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-01-15"}'
```

## Monitoring

- **Vercel Dashboard**: Monitor function invocations and logs
- **SendGrid Dashboard**: Track email delivery rates
- **Cloudinary Dashboard**: Monitor storage usage

## Cost

All services used are on free tiers:
- Vercel: 100 GB-hours/month (free)
- SendGrid: 100 emails/day (free)
- Cloudinary: 25 GB storage (free)

## Troubleshooting

### Cron jobs not running
- Verify cron configuration in `vercel.json`
- Check Vercel Dashboard > Settings > Crons
- View logs in Vercel Dashboard > Deployments > [latest] > Functions

### Email not sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- View SendGrid activity dashboard

### Photos not deleting
- Verify Cloudinary API credentials
- Check Cloudinary dashboard for API usage
- Ensure Firebase has photos older than 24 hours

## Support

For issues, check:
- Vercel logs: `vercel logs`
- Firebase Console: Firestore data
- SendGrid Dashboard: Email activity
