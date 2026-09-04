# Firebase Cloud Functions - Complete Deployment Guide

## Overview

This guide will help you deploy Firebase Cloud Functions for:
1. **Automatic Photo Deletion** - Removes photos older than 24 hours (daily at 12:00 AM (midnight))
2. **Automated Email Reports** - Sends financial reports via Postmark (daily at 11:59 PM)
3. **Manual Email Reports** - Owner can trigger emails from the UI

## What's Been Implemented

### ✅ Frontend Changes
- `LoginScreen.tsx` - Password eye icon on RIGHT side
- `PhotoViewerPage.tsx` - 24-hour photo filter + soft-delete filter
- `OwnerSalesPage.tsx` - Email button using Firebase callable functions

### ✅ Backend (Firebase Cloud Functions)
- `functions/src/config/firebase-admin.ts` - Admin SDK initialization
- `functions/src/services/postmark.ts` - Email service with HTML templates
- `functions/src/services/cloudinary.ts` - Photo deletion service
- `functions/src/functions/cleanupPhotos.ts` - Scheduled cleanup (12:00 AM (midnight))
- `functions/src/functions/sendDailyReport.ts` - Scheduled & callable email functions
- `functions/src/index.ts` - Main exports

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Firebase project: `final-bluemoon-automation`
- [ ] Firebase **Blaze Plan** enabled (required for Cloud Functions)
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Postmark account created
- [ ] Postmark sender email verified
- [ ] Cloudinary API credentials ready
- [ ] Owner email address for reports

## Step-by-Step Deployment

### Phase 1: Verify Firebase Project Setup

1. **Check Firebase Plan**:
   ```bash
   firebase projects:list
   ```
   Verify `final-bluemoon-automation` appears in the list.

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set Active Project**:
   ```bash
   cd "C:\Blluemoon Automation"
   firebase use final-bluemoon-automation
   ```

4. **Verify Blaze Plan**:
   - Go to [Firebase Console](https://console.firebase.google.com/project/final-bluemoon-automation/overview)
   - Check that billing is enabled
   - If not, click "Upgrade to Blaze Plan"

### Phase 2: Configure Environment Variables

Firebase Cloud Functions use `firebase functions:config:set` to store environment variables.

**Important**: Replace `YOUR_*` placeholders with actual values!

```bash
# Set Firebase Admin SDK credentials
firebase functions:config:set \
  firebase.project_id="final-bluemoon-automation" \
  firebase.client_email="firebase-adminsdk-fbsvc@final-bluemoon-automation.iam.gserviceaccount.com"

# Set private key (replace with actual key from service account JSON)
firebase functions:config:set \
  firebase.private_key="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8qzF1PfoqR8Aq
[YOUR FULL PRIVATE KEY HERE - KEEP THE LINE BREAKS]
-----END PRIVATE KEY-----"

# Set Cloudinary credentials
firebase functions:config:set \
  cloudinary.cloud_name="dtzxxwzpj" \
  cloudinary.api_key="YOUR_CLOUDINARY_API_KEY" \
  cloudinary.api_secret="YOUR_CLOUDINARY_API_SECRET"

# Set Postmark credentials
firebase functions:config:set \
  postmark.server_token="YOUR_POSTMARK_SERVER_TOKEN" \
  postmark.sender_email="YOUR_VERIFIED_SENDER_EMAIL@yourdomain.com"

# Set owner email (who will receive reports)
firebase functions:config:set \
  owner.email="YOUR_OWNER_EMAIL@yourdomain.com"
```

**Verify configuration**:
```bash
firebase functions:config:get
```

Expected output:
```json
{
  "firebase": {
    "project_id": "final-bluemoon-automation",
    "client_email": "firebase-adminsdk-fbsvc@...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n..."
  },
  "cloudinary": {
    "cloud_name": "dtzxxwzpj",
    "api_key": "...",
    "api_secret": "..."
  },
  "postmark": {
    "server_token": "YOUR_POSTMARK_SERVER_TOKEN",
    "sender_email": "..."
  },
  "owner": {
    "email": "..."
  }
}
```

### Phase 3: Build and Deploy Functions

1. **Navigate to functions directory**:
   ```bash
   cd functions
   ```

2. **Build TypeScript**:
   ```bash
   npm run build
   ```

   This compiles `src/` to `lib/`. Check for any TypeScript errors.

3. **Deploy functions**:
   ```bash
   cd ..
   firebase deploy --only functions
   ```

   You should see:
   ```
   ✔  functions[cleanupOldPhotos(asia-southeast1)] Successfully created schedule job
   ✔  functions[sendDailyReport(asia-southeast1)] Successfully created schedule job
   ✔  functions[sendReportManual(asia-southeast1)] Successful create operation
   ```

### Phase 4: Verify Deployment

1. **Check Firebase Console**:
   - Go to [Functions Dashboard](https://console.firebase.google.com/project/final-bluemoon-automation/functions)
   - Verify all 3 functions are listed:
     - `cleanupOldPhotos` (scheduled)
     - `sendDailyReport` (scheduled)
     - `sendReportManual` (callable)

2. **Check Cloud Scheduler**:
   - Go to [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler?project=final-bluemoon-automation)
   - Verify 2 cron jobs:
     - `firebase-schedule-cleanupOldPhotos-asia-southeast1` (0 2 * * *)
     - `firebase-schedule-sendDailyReport-asia-southeast1` (59 23 * * *)

3. **View function logs**:
   ```bash
   firebase functions:log
   ```

### Phase 5: Deploy Frontend

1. **Build frontend**:
   ```bash
   cd "C:\Blluemoon Automation"
   npm run build
   ```

2. **Deploy to Firebase Hosting** (if configured):
   ```bash
   firebase deploy --only hosting
   ```

   Or deploy however you currently host the app.

### Phase 6: Test All Features

#### Test 1: Password Eye Icon Position
1. Open login page
2. Verify eye icon is on the RIGHT side of password field
3. Click to toggle password visibility

**Expected**: Eye icon appears on right, toggles between Eye/EyeOff icons

---

#### Test 2: Photo Viewer 24-Hour Filter
1. Log in as Owner or Manager
2. Click Camera icon in top bar
3. View task completion photos

**Expected**: Only photos from last 24 hours are visible

---

#### Test 3: Manual Email Report
1. Log in as Owner
2. Go to Sales & Reports page
3. Select a financial report from the list
4. Click "Email Report" button
5. Check owner's email inbox

**Expected**:
- Button shows "Sending..." while processing
- Success toast: "Report emailed successfully to [email]"
- Email arrives with financial data and task photos

---

#### Test 4: Automatic Photo Cleanup (Manual Trigger)
```bash
firebase functions:call cleanupOldPhotos
```

**Expected output**:
```json
{
  "success": true,
  "message": "Old photos deleted successfully",
  "deletedCount": 5,
  "cloudinaryDeletedCount": 5
}
```

Check function logs:
```bash
firebase functions:log --only cleanupOldPhotos
```

---

#### Test 5: Automatic Daily Report (Manual Trigger)
```bash
firebase functions:call sendDailyReport
```

**Expected output**:
```json
{
  "success": true,
  "message": "Daily report email sent successfully",
  "sentTo": "owner@yourdomain.com",
  "photosIncluded": 3
}
```

Check owner's email for the report.

---

## Troubleshooting

### Issue: "Billing account not configured"

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/project/final-bluemoon-automation/overview)
2. Click "Upgrade" to Blaze Plan
3. Add billing information
4. Try deploying again

---

### Issue: "PERMISSION_DENIED: Missing or insufficient permissions"

**Solution**:
```bash
# Ensure you're logged in with correct account
firebase logout
firebase login

# Set correct project
firebase use final-bluemoon-automation

# Try deploying again
firebase deploy --only functions
```

---

### Issue: Functions deploy but scheduled jobs not created

**Solution**:
1. Enable Cloud Scheduler API:
   - Go to [Cloud Scheduler API](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=final-bluemoon-automation)
   - Click "Enable"

2. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```

---

### Issue: Email not sending - "POSTMARK_SERVER_TOKEN not set"

**Solution**:
```bash
# Verify config
firebase functions:config:get

# If postmark.server_token is missing, set it
firebase functions:config:set postmark.server_token="YOUR_POSTMARK_SERVER_TOKEN"

# Redeploy
firebase deploy --only functions
```

---

### Issue: Photos not deleting from Cloudinary

**Possible causes**:
1. Cloudinary credentials invalid
2. Public ID extraction failing
3. No photos older than 24 hours

**Solution**:
```bash
# Check logs for errors
firebase functions:log --only cleanupOldPhotos

# Verify Cloudinary config
firebase functions:config:get

# Test manually
firebase functions:call cleanupOldPhotos
```

---

### Issue: "Error: No financial report found for date"

**Cause**: No financial report exists in Firestore for the requested date.

**Solution**:
- Ensure manager has submitted a financial report for that date
- Check Firestore collection `financialReports`
- Date format must be `YYYY-MM-DD`

---

## Monitoring & Maintenance

### View Real-Time Logs

```bash
# Stream all logs
firebase functions:log --follow

# Stream specific function
firebase functions:log --only sendDailyReport --follow
```

### Check Scheduled Job Status

Go to [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler?project=final-bluemoon-automation):
- Check "Last Run" and "Next Run" times
- Verify "State" is "Enabled"
- Click job name to see execution history

### Monitor Costs

Go to [Firebase Console > Usage](https://console.firebase.google.com/project/final-bluemoon-automation/usage):
- Check Cloud Functions invocations
- Check Firestore reads/writes
- All should be well within free tier

**Expected costs**: $0/month (within free tier)

---

## Email Template Preview

The automated emails include:

**Header Section**:
- 📊 Daily Financial Report
- Date in long format

**Statistics**:
- 💰 Daily Earnings (total of opening + closing)
- 📈 Net Sales (88% after 12% tax)

**Funds Breakdown**:
- Opening Shift (amount + photo)
- Closing Shift (amount + photo)
- Manager Fund (amount + photo)

**Expenses**:
- Itemized list with categories and amounts
- Total expenses

**Task Photos**:
- Grid of employee task completion photos
- Employee name and timestamp
- Only photos from last 24 hours

**Footer**:
- Generated by Bluemoon Automation System
- Copyright notice

---

## Security Best Practices

1. **Never commit secrets to git**:
   - ✅ `.gitignore` already configured
   - ✅ Use Firebase Functions config for secrets

2. **Verify Postmark sender**:
   - Prevents emails going to spam
   - Required by Postmark

3. **TODO: Add authentication to sendReportManual**:
   ```typescript
   // In functions/src/functions/sendDailyReport.ts
   if (!context.auth) {
     throw new functions.https.HttpsError(
       'unauthenticated',
       'User must be authenticated'
     );
   }

   // Verify user role is 'owner'
   const userDoc = await db.collection('users').doc(context.auth.uid).get();
   if (userDoc.data()?.role !== 'owner') {
     throw new functions.https.HttpsError(
       'permission-denied',
       'Only owners can send reports'
     );
   }
   ```

---

## Next Steps After Deployment

1. **Monitor for 24 hours**:
   - Check logs daily: `firebase functions:log`
   - Verify cron jobs run successfully
   - Confirm emails arrive on schedule

2. **Test with real data**:
   - Wait for photos to age > 24 hours
   - Verify they disappear from UI
   - Check they're deleted from Cloudinary

3. **Set up monitoring alerts** (optional):
   - Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring?project=final-bluemoon-automation)
   - Create alerts for function failures
   - Get notified via email

4. **Document for team**:
   - Share this guide with team members
   - Document any custom configurations
   - Keep credentials secure

---

## Useful Commands Reference

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:cleanupOldPhotos

# View logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --follow

# Test function manually
firebase functions:call cleanupOldPhotos

# Check configuration
firebase functions:config:get

# Update configuration
firebase functions:config:set key.subkey="value"

# Delete function
firebase functions:delete functionName

# Check Firebase project
firebase projects:list
firebase use final-bluemoon-automation
```

---

## Summary

**Implementation Complete** ✅

- ✅ Password eye icon repositioned to right
- ✅ Firebase Cloud Functions created
- ✅ Photo deletion automated (12:00 AM (midnight) daily)
- ✅ Email reports automated (11:59 PM daily)
- ✅ Manual email trigger from UI
- ✅ Postmark integration
- ✅ Cloudinary cleanup
- ✅ Zero recurring costs (free tier)

**Ready for deployment!** Follow the steps above to deploy to production.

**Questions?** Check the logs first:
```bash
firebase functions:log
```

---

**Last Updated**: 2025-11-28
**Firebase Project**: final-bluemoon-automation
**Region**: asia-southeast1 (Singapore)
**Postmark Token**: YOUR_POSTMARK_SERVER_TOKEN
