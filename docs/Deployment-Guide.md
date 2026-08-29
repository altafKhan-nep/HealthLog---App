# HealthLog — Complete Deployment Guide

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Build & Configure App](#2-build--configure-app)
3. [Google Play Store Deployment](#3-google-play-store-deployment)
4. [Apple App Store Deployment](#4-apple-app-store-deployment)
5. [Backend API Deployment](#5-backend-api-deployment)
6. [MongoDB Atlas Setup](#6-mongodb-atlas-setup)
7. [Subscription & Monetization](#7-subscription--monetization)
8. [Free Deployment Options](#8-free-deployment-options)
9. [Paid Deployment Options](#9-paid-deployment-options)
10. [Post-Launch Checklist](#10-post-launch-checklist)

---

## 1. Pre-Deployment Checklist

### App Store Assets Required

| Asset | Play Store | App Store |
|-------|-----------|-----------|
| App Icon | 512x512 PNG | 1024x1024 PNG |
| Feature Graphic | 1024x500 PNG | Not required |
| Screenshots (phone) | 2-8 screenshots | 6.7" + 6.5" displays |
| Screenshots (tablet) | Optional | 12.9" display |
| Privacy Policy URL | Required | Required |
| App Description | 4000 chars max | 4000 chars max |
| Keywords | 5 keywords | 100 chars max |
| Support URL | Required | Required |
| Content Rating | IARC questionnaire | Export Compliance |

### Developer Accounts

| Platform | Cost | URL |
|----------|------|-----|
| Google Play Developer | $25 one-time | https://play.google.com/console/signup |
| Apple Developer | $99/year | https://developer.apple.com/programs/ |
| EAS (Expo) | Free tier available | https://expo.dev/signup |

---

## 2. Build & Configure App

### 2.1 Update app.json for Production

```json
{
  "expo": {
    "name": "HealthLog",
    "slug": "healthlog",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "healthlog",
    "icon": "./assets/logo.png",
    "splash": {
      "image": "./assets/logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#F4F8FA"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.healthlog",
      "buildNumber": "1",
      "icon": "./assets/logo.png",
      "infoPlist": {
        "NSCameraUsageDescription": "HealthLog needs camera access to scan medical reports",
        "NSPhotoLibraryUsageDescription": "HealthLog needs photo access to attach medical reports"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/logo.png",
        "backgroundColor": "#F4F8FA"
      },
      "package": "com.yourname.healthlog",
      "versionCode": 1,
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"],
      "usesCleartextTraffic": false
    },
    "plugins": [
      "expo-camera",
      "expo-image-picker",
      "expo-document-picker"
    ]
  }
}
```

### 2.2 Update API URL for Production

```typescript
// apps/mobile/src/api/client.ts
const BASE_URL = Platform.select({
  web: "https://your-api-domain.com",
  default: "https://your-api-domain.com",
});
```

### 2.3 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2.4 Configure EAS Build

```bash
cd apps/mobile
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 3. Google Play Store Deployment

### 3.1 Create App in Play Console

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - App name: **HealthLog**
   - Default language: **English**
   - App or game: **App**
   - Free or paid: **Free** (change later with IAP)
4. Accept declarations → **Create app**

### 3.2 Complete Store Listing

**Main Store Listing:**
- App name: `HealthLog — Medical Records`
- Short description (80 chars): `Secure health records with AI insights. Track, scan, and share medical reports.`
- Full description (4000 chars):

```
HealthLog is your personal health record companion that helps you organize, understand, and share your medical reports with AI-powered insights.

KEY FEATURES:
• Scan & Store — Photograph or upload medical reports, prescriptions, and lab results
• AI-Powered Insights — Get plain-language explanations of your medical data
• Health Trends — Track lab values over time with visual charts
• Care Circle — Share records securely with family members
• QR Code Sharing — Generate temporary QR codes for one-time report access
• Secure Storage — Your health data stays private and protected

PERFECT FOR:
• Tracking chronic conditions
• Managing family health records
• Sharing reports with doctors
• Organizing prescriptions
• Monitoring lab results over time

PRIVACY & SECURITY:
• End-to-end encryption
• One-time share links that auto-expire
• No data sold to third parties
• HIPAA-conscious design

Download HealthLog today and take control of your health history.
```

### 3.3 Upload Screenshots

Required sizes:
- Phone: 16:9 aspect ratio (minimum 320px, maximum 3840px)
- Tablet (optional): 7:10 aspect ratio

Use these screens for screenshots:
1. Welcome/Login screen
2. Home dashboard with stats
3. AI Health Insights
4. Add Report flow
5. Report Viewer with QR code
6. Trends/Analytics
7. Care Circle

### 3.4 Content Rating

1. Go to **Store listing** → **Content rating**
2. Complete the IARC questionnaire
3. For HealthLog: Likely **Everyone** or **Everyone 10+**

### 3.5 Privacy Policy

Create a privacy policy page and host it. Example:

```markdown
# HealthLog Privacy Policy

Last updated: [Date]

## Data Collection
HealthLog collects the following data:
- Account information (name, email)
- Medical reports you upload (images, PDFs)
- Health data you enter (diagnoses, medications)

## Data Storage
- All data is stored securely in encrypted databases
- Medical reports are stored on secure cloud servers
- We never sell your data to third parties

## Data Sharing
- You control who sees your data via Care Circle
- Share links are one-time-use and auto-expire

## Contact
Email: support@healthlog.app
```

Host on: GitHub Pages, Vercel, Netlify, or your website.

### 3.6 Build APK/AAB for Play Store

```bash
cd apps/mobile

# Build Android App Bundle (recommended for Play Store)
eas build --platform android --profile production
```

### 3.7 Submit to Play Store

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload the `.aab` file from EAS
4. Add release notes:
```
Initial release of HealthLog:
- Scan and store medical reports
- AI-powered health insights
- Health trends tracking
- Care circle sharing
- QR code one-time share links
```
5. Review and submit for review

### 3.8 Play Store Review Timeline

- First review: 7-14 days
- Subsequent updates: 1-3 days
- If rejected: Fix issues and resubmit

---

## 4. Apple App Store Deployment

### 4.1 Prerequisites

- Apple Developer account ($99/year)
- Xcode installed (Mac required)
- App Store Connect access

### 4.2 Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: **iOS**
   - Name: **HealthLog**
   - Primary Language: **English**
   - Bundle ID: `com.yourname.healthlog`
   - SKU: `healthlog-ios`
   - User Access: **Full Access**

### 4.3 Build for iOS

```bash
cd apps/mobile

# Build for iOS
eas build --platform ios --profile production
```

**Note:** First iOS build requires:
- Apple Developer certificates
- Provisioning profiles
- EAS can manage these automatically

### 4.4 App Store Connect Configuration

**App Information:**
- Name: `HealthLog — Medical Records`
- Subtitle: `Health Records & AI Insights`
- Category: **Health & Fitness** → **Medical**
- Content Rights: **Does not contain third-party content**

**Privacy Privacy:**
- Data Types collected:
  - Name
  - Email
  - Health & Fitness
  - Photos
  - Documents
- Purpose: App functionality, analytics

**App Review Information:**
- Contact: your@email.com
- Phone: +1-XXX-XXX-XXXX
- Notes for reviewer: "Demo account: altaf@test.com / password123"

### 4.5 iOS Screenshots

Required sizes:
- iPhone 6.7" (iPhone 15 Pro Max): 1290 x 2796
- iPhone 6.5" (iPhone 11 Pro Max): 1242 x 2688
- iPhone 5.5" (iPhone 8 Plus): 1242 x 2208
- iPad 12.9" (iPad Pro 6th gen): 2048 x 2732

### 4.6 Submit for Review

1. In App Store Connect, go to your app
2. Click **+** to create a new version
3. Upload build from EAS
4. Add screenshots, description, keywords
5. Set pricing (Free or Paid)
6. Submit for review

### 4.7 App Store Review Guidelines

Key things Apple checks:
- ✅ App works as described
- ✅ No crashes or bugs
- ✅ Privacy policy link works
- ✅ No placeholder content
- ✅ Appropriate content rating
- ✅ No hidden features

### 4.8 App Store Review Timeline

- First review: 24-48 hours (can be longer)
- Subsequent updates: 24 hours
- If rejected: Fix issues and resubmit

---

## 5. Backend API Deployment

### 5.1 Option A: Railway (Recommended — Free Tier)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your healthlog repo
5. Set environment variables:

```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthlog
JWT_SECRET=<generate-strong-random-string>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_key
```

6. Railway auto-detects and deploys
7. Get your URL: `https://your-app.up.railway.app`

**Free tier:** 500 hours/month, sleeps after 30 min inactivity

### 5.2 Option B: Render (Free Tier)

1. Go to https://render.com
2. Sign up → **New Web Service**
3. Connect GitHub repo
4. Settings:
   - Name: `healthlog-api`
   - Runtime: `Node`
   - Build command: `cd apps/api && npm install`
   - Start command: `cd apps/api && npm start`
5. Add environment variables (same as Railway)
6. Deploy

**Free tier:** 750 hours/month, sleeps after 15 min

### 5.3 Option C: DigitalOcean App Platform (Paid — $5/month)

1. Go to https://cloud.digitalocean.com/apps
2. Create app from GitHub
3. Select repo and branch
4. Configure:
   - Name: `healthlog-api`
   - HTTP port: 4000
5. Add environment variables
6. Deploy

**No sleep, always on**

### 5.4 Option D: AWS EC2 (Paid — ~$5-20/month)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/yourusername/healthlog.git
cd healthlog/apps/api

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start npm --name "healthlog-api" -- start
pm2 save
pm2 startup

# Install nginx for reverse proxy
sudo apt install nginx

# Configure nginx
sudo nano /etc/nginx/sites-available/healthlog
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/healthlog /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5.5 Option E: Vercel Serverless (Free Tier)

Not ideal for always-on APIs, but works for low traffic.

1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory to `apps/api`
4. Add environment variables
5. Deploy

---

## 6. MongoDB Atlas Setup

### 6.1 Create Cluster (Free Tier)

1. Go to https://cloud.mongodb.com
2. Sign up / Log in
3. Click **Build a Database**
4. Choose **M0 Sandbox** (Free)
5. Select cloud provider and region
6. Create cluster

### 6.2 Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Authentication method: **Password**
4. Username: `healthlog_user`
5. Password: Generate strong password
6. Database user privileges: **Read and write to any database**
7. Add user

### 6.3 Whitelist IP Addresses

1. Go to **Network Access**
2. Click **Add IP Address**
3. For development: **Add Current IP Address**
4. For production: **Allow Access from Anywhere** (0.0.0.0/0)

### 6.4 Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Driver: **Node.js**
4. Version: **5.0 or later**
5. Copy connection string:
```
mongodb+srv://healthlog_user:<password>@cluster0.xxxxx.mongodb.net/healthlog?retryWrites=true&w=majority
```

### 6.5 Create .env File

```bash
# apps/api/.env
PORT=4000
MONGODB_URI=mongodb+srv://healthlog_user:your_password@cluster0.xxxxx.mongodb.net/healthlog?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

---

## 7. Subscription & Monetization

### 7.1 Option A: RevenueCat (Recommended)

RevenueCat handles subscriptions for both iOS and Android.

**Setup:**

1. Go to https://app.revenuecat.com
2. Create account → New project: `HealthLog`
3. Add app:
   - iOS: Bundle ID `com.yourname.healthlog`
   - Android: Package `com.yourname.healthlog`

**Configure Products:**

| Product ID | Price | Duration | Features |
|------------|-------|----------|----------|
| `healthlog_monthly` | $2.99/month | Monthly | Unlimited scans, AI insights |
| `healthlog_yearly` | $19.99/year | Yearly | Everything + priority support |
| `healthlog_lifetime` | $49.99 one-time | Lifetime | Everything forever |

**iOS Setup (App Store Connect):**

1. Go to https://appstoreconnect.apple.com
2. **In-App Purchases** → **Manage**
3. Create subscriptions:
   - Subscription Group: `HealthLog Premium`
   - Product ID: `healthlog_monthly`
   - Price: $2.99
   - Duration: 1 month
4. Repeat for yearly

**Android Setup (Google Play Console):**

1. Go to https://play.google.com/console
2. **Monetize** → **Products** → **Subscriptions**
3. Create subscriptions:
   - Product ID: `healthlog_monthly`
   - Price: $2.99
   - Billing period: 1 month
4. Repeat for yearly

**Install RevenueCat SDK:**

```bash
cd apps/mobile
npm install react-native-purchases --legacy-peer-deps
```

**Initialize RevenueCat:**

```typescript
// apps/mobile/src/config/revenuecat.ts
import Purchases from "react-native-purchases";

export async function initializeRevenueCat() {
  Purchases.configure({
    apiKey: Platform.select({
      ios: "your_revenuecat_ios_key",
      android: "your_revenuecat_android_key",
    }),
  });
}
```

**Check Subscription Status:**

```typescript
// In any screen
import Purchases from "react-native-purchases";

async function checkSubscription() {
  const customerInfo = await Purchases.getCustomerInfo();
  const isPremium = "premium" in customerInfo.entitlements.active;
  return isPremium;
}
```

**Offer Paywall:**

```typescript
async function showPaywall() {
  const offerings = await Purchases.getOfferings();
  const currentOffering = offerings.current;
  if (currentOffering) {
    // Display packages to user
    // currentOffering.monthly, currentOffering.yearly, etc.
  }
}
```

### 7.2 Option B: Stripe (Web Only)

If you only need web subscriptions:

1. Go to https://stripe.com
2. Create account
3. Get API keys
4. Create products and prices
5. Implement checkout flow

### 7.3 Option C: Manual In-App Purchases (No RevenueCat)

**iOS:**

```bash
npm install react-native-iap --legacy-peer-deps
```

Follow: https://github.com/dooboolab/react-native-iap

**Android:**

Same library, different setup.

### 7.4 Free vs Premium Features

| Feature | Free | Premium ($2.99/mo) |
|---------|------|-------------------|
| Store reports | 5/month | Unlimited |
| AI insights | Basic | Advanced |
| Health trends | 1 test | All tests |
| Care circle | 1 member | 5 members |
| QR share links | 3/month | Unlimited |
| Cloud storage | 100MB | 10GB |
| Export PDF | ❌ | ✅ |
| Priority support | ❌ | ✅ |

### 7.5 Implementing Feature Gating

```typescript
// apps/mobile/src/utils/subscription.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const FREE_LIMITS = {
  maxReports: 5,
  maxCareMembers: 1,
  maxShareLinks: 3,
};

export async function checkFeatureAccess(feature: string): Promise<boolean> {
  const isPremium = await checkSubscription();
  if (isPremium) return true;

  switch (feature) {
    case "reports":
      const reportCount = await getMonthlyReportCount();
      return reportCount < FREE_LIMITS.maxReports;
    case "shareLinks":
      const shareCount = await getMonthlyShareCount();
      return shareCount < FREE_LIMITS.maxShareLinks;
    default:
      return false;
  }
}
```

---

## 8. Free Deployment Options

### Total Cost: $0

| Component | Free Service | Limitations |
|-----------|-------------|-------------|
| API Server | Render / Railway | Sleeps after 15-30 min |
| Database | MongoDB Atlas M0 | 512MB storage, 100 connections |
| File Storage | Cloudinary Free | 25GB storage, 25K transformations/month |
| Mobile Build | EAS Free | 30 builds/month |
| Domain | Free subdomain | your-app.vercel.app |
| SSL | Let's Encrypt | Free, auto-renewal |

### Steps:

1. **Database:** MongoDB Atlas M0 (free)
2. **API:** Render free tier
3. **Files:** Cloudinary free tier
4. **Build:** EAS free tier
5. **Submit:** Play Store ($25) / App Store ($99)

**Total first year cost:** $25 (Android) or $99 (iOS) or $124 (both)

---

## 9. Paid Deployment Options

### Option A: Starter ($20/month)

| Component | Service | Cost |
|-----------|---------|------|
| API Server | DigitalOcean App Platform | $5/month |
| Database | MongoDB Atlas M10 | $10/month |
| File Storage | Cloudinary Plus | $0 (free tier enough) |
| Domain | Namecheap | $1/year |
| SSL | Included | $0 |

### Option B: Professional ($50/month)

| Component | Service | Cost |
|-----------|---------|------|
| API Server | AWS EC2 t3.small | $15/month |
| Database | MongoDB Atlas M20 | $25/month |
| File Storage | Cloudinary Plus | $0 |
| Domain | Namecheap | $1/year |
| SSL | Let's Encrypt | $0 |
| CDN | Cloudflare Free | $0 |
| Monitoring | Sentry Free | $0 |

### Option C: Enterprise ($200/month)

| Component | Service | Cost |
|-----------|---------|------|
| API Server | AWS ECS Fargate | $50/month |
| Database | MongoDB Atlas M30 | $100/month |
| File Storage | AWS S3 | $10/month |
| Domain | Route 53 | $1/month |
| SSL | AWS Certificate Manager | $0 |
| CDN | CloudFront | $20/month |
| Monitoring | Sentry Team | $20/month |

---

## 10. Post-Launch Checklist

### Immediately After Launch

- [ ] Monitor crash reports (Sentry / Firebase Crashlytics)
- [ ] Check user reviews and respond
- [ ] Verify all features work in production
- [ ] Test subscription flow end-to-end
- [ ] Monitor API server performance

### First Week

- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Optimize based on analytics
- [ ] Respond to all reviews
- [ ] Share on social media

### First Month

- [ ] Analyze user behavior (Mixpanel / Amplitude)
- [ ] A/B test onboarding flow
- [ ] Plan next feature release
- [ ] Consider marketing (Reddit, Twitter, Product Hunt)
- [ ] Set up customer support email

### Ongoing

- [ ] Update dependencies monthly
- [ ] Release updates every 2-4 weeks
- [ ] Monitor server costs
- [ ] Scale infrastructure as needed
- [ ] Maintain privacy policy compliance

---

## Quick Reference Commands

```bash
# Development
cd apps/api && npm run dev          # Start API
cd apps/mobile && npx expo start   # Start mobile

# Production Build
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to Stores
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# Update version
eas version:bump
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check `app.json` config, run `eas build --clear` |
| API not connecting | Verify MONGODB_URI, check IP whitelist |
| Subscription not working | Verify product IDs match in code and store |
| App rejected | Read rejection reason, fix, resubmit |
| QR code not scanning | Ensure share URL is HTTPS, not HTTP |

### Support

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- RevenueCat: https://www.revenuecat.com/docs
- Google Play Console Help: https://support.google.com/googleplay/android-developer
- App Store Connect Help: https://developer.apple.com/help/app-store-connect/
