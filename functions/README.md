# Firebase Cloud Functions - Bluemoon Automation

This directory contains Firebase Cloud Functions for automated backend tasks:
- **Photo Cleanup**: Daily deletion of photos older than 24 hours
- **Email Reports**: Automated and manual financial report emails via Postmark

## Functions Overview

### 1. cleanupOldPhotos (Scheduled)
- **Schedule**: Daily at 12:00 AM (midnight) Asia/Manila
- **Purpose**: Delete photos from Cloudinary and soft-delete in Firestore
- **Triggers**: Pub/Sub cron schedule
- **Region**: asia-southeast1 (Singapore - closest to Manila)

### 2. sendDailyReport (Scheduled)
- **Schedule**: Daily at 11:59 PM Asia/Manila
- **Purpose**: Send automated daily financial report email to owner
- **Triggers**: Pub/Sub cron schedule
- **Region**: asia-southeast1

### 3. sendReportManual (Callable)
- **Purpose**: Manual email sending triggered from Owner Sales page
- **Triggers**: HTTPS callable (called from frontend)
- **Region**: asia-southeast1
- **Authentication**: Caller must be signed in with role `owner` or `manager` (checked against `users/{uid}.role`)

## Project Structure

```
functions/
├── src/
│   ├── config/
│   │   └── firebase-admin.ts       # Firebase Admin SDK initialization
│   ├── services/
│   │   ├── postmark.ts             # Email service with HTML templates
│   │   └── cloudinary.ts           # Photo deletion service
│   ├── functions/
│   │   ├── cleanupPhotos.ts        # Scheduled photo cleanup
│   │   └── sendDailyReport.ts      # Email report functions
│   └── index.ts                    # Main exports
├── package.json
├── tsconfig.json
├── .env.example                    # Environment variables template
├── .gitignore
└── README.md                       # This file
```

## Prerequisites

1. **Firebase Project**
   - Project ID: `final-bluemoon-automation`
   - Upgraded to **Blaze Plan** (required for Cloud Functions)
   - Billing account configured

2. **Required Services**
   - **Postmark Account** (free tier)
     - Server API token (keep it secret; never commit it)
     - Sender email verified
   - **Cloudinary Account**
     - Cloud name: `dtzxxwzpj`
     - API key and secret
   - **Firebase Admin SDK**
     - Service account credentials

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd functions
npm install
```

### Step 2: Configure Environment Variables

You need to set environment variables in Firebase Functions configuration:

```bash
# Navigate to project root
cd ..

# Set Firebase Admin credentials
firebase functions:config:set \
  firebase.project_id="final-bluemoon-automation" \
  firebase.client_email="firebase-adminsdk-fbsvc@final-bluemoon-automation.iam.gserviceaccount.com" \
  firebase.private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Set Cloudinary credentials
firebase functions:config:set \
  cloudinary.cloud_name="dtzxxwzpj" \
  cloudinary.api_key="YOUR_API_KEY" \
  cloudinary.api_secret="YOUR_API_SECRET"

# Set Postmark credentials
firebase functions:config:set \
  postmark.server_token="YOUR_POSTMARK_SERVER_TOKEN" \
  postmark.sender_email="YOUR_SENDER_EMAIL"

# Set owner email
firebase functions:config:set \
  owner.email="owner@yourdomain.com"
```

**Note**: The environment variables must use UPPERCASE with underscores in the code but lowercase with dots in the config. Firebase automatically converts:
- `firebase.project_id` → `process.env.FIREBASE_PROJECT_ID`
- `cloudinary.cloud_name` → `process.env.CLOUDINARY_CLOUD_NAME`

### Step 3: Build TypeScript

```bash
cd functions
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `lib/`.

### Step 4: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:cleanupOldPhotos
firebase deploy --only functions:sendDailyReport
firebase deploy --only functions:sendReportManual
```

### Step 5: Verify Deployment

After deployment, check the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `final-bluemoon-automation`
3. Navigate to **Functions** section
4. Verify all 3 functions are deployed:
   - `cleanupOldPhotos` (scheduled)
   - `sendDailyReport` (scheduled)
   - `sendReportManual` (callable)

## Testing Functions

### Test Photo Cleanup (Manual Trigger)

```bash
# Trigger the cleanup function manually
firebase functions:call cleanupOldPhotos
```

### Test Daily Report (Manual Trigger)

```bash
# Trigger the daily report function manually
firebase functions:call sendDailyReport
```

### Test Manual Email (From UI)

1. Log in as Owner
2. Go to Sales & Reports page
3. Select a financial report
4. Click "Email Report" button
5. Check owner's email inbox

### View Function Logs

```bash
# View all logs
firebase functions:log

# View logs for specific function
firebase functions:log --only cleanupOldPhotos
firebase functions:log --only sendDailyReport
firebase functions:log --only sendReportManual

# Stream logs in real-time
firebase functions:log --follow
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project identifier | `final-bluemoon-automation` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-...@....iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...\n-----END...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dtzxxwzpj` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your API secret |
| `POSTMARK_SERVER_TOKEN` | Postmark server API token | (secret - do not commit) |
| `POSTMARK_SENDER_EMAIL` | Verified sender email | `noreply@yourdomain.com` |
| `OWNER_EMAIL` | Email to receive reports | `owner@yourdomain.com` |

## Costs

### Firebase Blaze Plan Costs

Based on expected usage:

| Resource | Free Tier | Expected Usage | Estimated Cost |
|----------|-----------|----------------|----------------|
| Cloud Functions Invocations | 2M/month | ~60 invocations/month | $0 |
| Cloud Functions Compute Time | 400,000 GB-sec/month | ~10 GB-sec/month | $0 |
| Firestore Reads | 50K/day | ~200/day | $0 |
| Firestore Writes | 20K/day | ~50/day | $0 |
| Outbound Networking | 1 GB/month | ~10 MB/month | $0 |

**Total Estimated Cost**: **$0/month** (well within free tier)

### Third-Party Services

| Service | Plan | Cost |
|---------|------|------|
| Postmark | Free | $0/month (100 emails/day) |
| Cloudinary | Free | $0/month (25 GB storage) |

**Total Monthly Cost**: **$0** ✅

## Troubleshooting

### Issue: Functions not deploying

**Solution**:
```bash
# Clear functions cache
rm -rf functions/lib
rm -rf functions/node_modules

# Reinstall and rebuild
cd functions
npm install
npm run build

# Try deploying again
cd ..
firebase deploy --only functions
```

### Issue: Environment variables not working

**Solution**:
```bash
# Check current configuration
firebase functions:config:get

# If empty, set them again using the commands in Step 2
```

### Issue: Scheduled functions not running

**Possible causes**:
1. Functions not deployed successfully
2. Firebase project not on Blaze plan
3. Scheduler permissions not granted

**Solution**:
```bash
# Redeploy functions
firebase deploy --only functions

# Check Firebase Console > Cloud Scheduler
# Ensure both jobs are listed and enabled
```

### Issue: Email not sending

**Possible causes**:
1. Postmark API token invalid
2. Sender email not verified in Postmark
3. No financial report exists for the date

**Solution**:
1. Verify Postmark API token
2. Check sender email verification in Postmark dashboard
3. Check function logs: `firebase functions:log --only sendDailyReport`

### Issue: Photos not deleting from Cloudinary

**Possible causes**:
1. Cloudinary credentials invalid
2. Public ID extraction failing
3. API signature generation error

**Solution**:
1. Verify Cloudinary API key and secret
2. Check function logs: `firebase functions:log --only cleanupOldPhotos`
3. Test with manual trigger to see detailed logs

## Development

### Local Development with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, run functions
cd functions
npm run serve
```

### Testing Locally

Create a `.env` file in the `functions/` directory (see `.env.example`):

```bash
cd functions
cp .env.example .env
# Edit .env with your actual credentials
```

**Important**: Never commit `.env` to version control!

## Security Notes

1. **Private Keys**: Never commit service account private keys to git
2. **API Secrets**: Store all secrets in Firebase Functions config
3. **Authentication**: Add Firebase Auth token verification to `sendReportManual`
4. **CORS**: Callable functions automatically handle CORS
5. **Rate Limiting**: Handled by Firebase Functions quotas

## Future Enhancements

1. **Add Authentication**: Verify user role before sending manual reports
2. **Error Notifications**: Send alerts to admin if functions fail
3. **Retry Logic**: Implement exponential backoff for API failures
4. **Monitoring**: Set up Cloud Monitoring alerts
5. **Report Scheduling**: Allow owner to customize email schedule
6. **Multiple Recipients**: Support sending reports to multiple emails

## Support

If you encounter issues:

1. **Check logs**: `firebase functions:log`
2. **Check Firebase Console**: [Functions Dashboard](https://console.firebase.google.com/project/final-bluemoon-automation/functions)
3. **Check Postmark**: [Activity Dashboard](https://account.postmarkapp.com/servers)
4. **Check Cloudinary**: [Console](https://cloudinary.com/console)

## Useful Commands

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:cleanupOldPhotos

# View logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --follow

# Check config
firebase functions:config:get

# Delete a function
firebase functions:delete cleanupOldPhotos
```

---

**Last Updated**: 2025-11-28
**Firebase Project**: final-bluemoon-automation
**Region**: asia-southeast1 (Singapore)
