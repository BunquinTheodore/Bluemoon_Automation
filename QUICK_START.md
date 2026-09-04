# Quick Start Guide - Firebase Cloud Functions

## 🚀 Deploy in 5 Steps

### 1. Configure Environment Variables
```bash
cd "C:\Blluemoon Automation"

# Set all environment variables at once
firebase functions:config:set \
  firebase.project_id="final-bluemoon-automation" \
  firebase.client_email="firebase-adminsdk-fbsvc@final-bluemoon-automation.iam.gserviceaccount.com" \
  firebase.private_key="YOUR_PRIVATE_KEY_HERE" \
  cloudinary.cloud_name="dtzxxwzpj" \
  cloudinary.api_key="YOUR_KEY" \
  cloudinary.api_secret="YOUR_SECRET" \
  postmark.server_token="YOUR_POSTMARK_SERVER_TOKEN" \
  postmark.sender_email="YOUR_EMAIL@domain.com" \
  owner.email="OWNER_EMAIL@domain.com"
```

### 2. Build Functions
```bash
cd functions
npm run build
```

### 3. Deploy
```bash
cd ..
firebase deploy --only functions
```

### 4. Verify
Check [Firebase Console](https://console.firebase.google.com/project/final-bluemoon-automation/functions):
- ✅ cleanupOldPhotos (scheduled)
- ✅ sendDailyReport (scheduled)
- ✅ sendReportManual (callable)

### 5. Test
```bash
# Test photo cleanup
firebase functions:call cleanupOldPhotos

# Test email report
firebase functions:call sendDailyReport

# View logs
firebase functions:log
```

---

## 📋 What You Need

### Required Credentials

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **Firebase** | Service account private key | [Firebase Console](https://console.firebase.google.com/project/final-bluemoon-automation/settings/serviceaccounts) > Generate New Private Key |
| **Cloudinary** | API Key & Secret | [Cloudinary Console](https://cloudinary.com/console) > Settings > API Keys |
| **Postmark** | Already have: `YOUR_POSTMARK_SERVER_TOKEN` | Verify sender email in [Postmark](https://account.postmarkapp.com/servers) |

### Required Accounts

- ✅ Firebase project: `final-bluemoon-automation` (must be on **Blaze Plan**)
- ✅ Postmark account (free tier)
- ✅ Cloudinary account (existing)

---

## 🔑 Getting Your Credentials

### Firebase Admin SDK Private Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/final-bluemoon-automation/settings/serviceaccounts)
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract the `private_key` value (keep the `\n` line breaks)

### Cloudinary API Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Copy "Cloud Name": `dtzxxwzpj`
3. Go to Settings > API Keys
4. Copy API Key and API Secret

### Postmark Sender Email

1. Go to [Postmark](https://account.postmarkapp.com/servers)
2. Click "Sender Signatures"
3. Click "Verify a New Sender"
4. Enter your email and verify

---

## 🧪 Testing Commands

```bash
# Test photo cleanup (manually)
firebase functions:call cleanupOldPhotos

# Test daily email (manually)
firebase functions:call sendDailyReport

# View all logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --only cleanupOldPhotos
```

---

## 📊 Scheduled Functions

| Function | Schedule | Time | Purpose |
|----------|----------|------|---------|
| `cleanupOldPhotos` | Daily | 12:00 AM (midnight) | Delete photos > 24 hours old |
| `sendDailyReport` | Daily | 11:59 PM | Email financial report to owner |

**Timezone**: Asia/Manila

---

## 🐛 Common Issues

### "Billing account not configured"
**Solution**: Upgrade to [Blaze Plan](https://console.firebase.google.com/project/final-bluemoon-automation/overview)

### "Environment variable not set"
**Solution**:
```bash
firebase functions:config:get  # Check what's set
firebase functions:config:set key.name="value"  # Set missing variable
firebase deploy --only functions  # Redeploy
```

### Email not sending
**Solution**:
1. Verify sender email in Postmark
2. Check logs: `firebase functions:log --only sendDailyReport`
3. Verify `postmark.sender_email` is set correctly

### Photos not deleting
**Solution**:
1. Check Cloudinary credentials
2. Test manually: `firebase functions:call cleanupOldPhotos`
3. View logs: `firebase functions:log --only cleanupOldPhotos`

---

## 📱 Frontend Usage

### Manual Email Button (Owner Dashboard)

1. Log in as Owner
2. Go to "Sales & Reports" page
3. Select a financial report
4. Click "📧 Email Report" button
5. Check owner's email inbox

**Behind the scenes**: Calls `sendReportManual` Firebase Cloud Function

---

## 💰 Costs

**Total Monthly Cost**: **$0** (within free tier)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Cloud Functions | 2M invocations | ~60/month | $0 |
| Firestore | 50K reads/day | ~200/day | $0 |
| Postmark | 100 emails/day | 1/day | $0 |
| Cloudinary | 25 GB storage | Managed | $0 |

---

## 📚 Full Documentation

- **Complete Guide**: `FIREBASE_DEPLOYMENT_GUIDE.md`
- **Functions README**: `functions/README.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Get Help

1. **Check logs**: `firebase functions:log`
2. **Check Firebase Console**: [Functions Dashboard](https://console.firebase.google.com/project/final-bluemoon-automation/functions)
3. **Check Postmark**: [Activity Dashboard](https://account.postmarkapp.com/servers)
4. **Check Cloudinary**: [Console](https://cloudinary.com/console)

---

**Last Updated**: 2025-11-28
