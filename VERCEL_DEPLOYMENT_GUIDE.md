# Ponloe App - Vercel Deployment Guide

## Overview

This guide explains how to deploy the Ponloe app to Vercel with all features working correctly, including Quran APIs, Prayer Times, and media uploads.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository with the Ponloe app code
- Environment variables configured (see below)

## Key Issues Fixed

### 1. **API Routes Not Working**
**Problem:** The Express server in `server.ts` was not being executed on Vercel.
**Solution:** Implemented proper Vercel serverless functions in the `/api` directory with correct routing.

### 2. **Proxy Requests Failing**
**Problem:** API requests to external services (Quran APIs, Prayer Times) were failing due to CORS and URL parsing issues.
**Solution:** Created improved proxy handlers with proper error handling and timeout management.

### 3. **Environment Variables Not Configured**
**Problem:** Telegram and Supabase credentials were hardcoded in the source code.
**Solution:** Moved all sensitive data to environment variables that can be configured in Vercel dashboard.

## Deployment Steps

### Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Ensure the following files are present:
   - `/api/[...path].ts` - Main API handler
   - `/api/index.ts` - API entry point
   - `vercel.json` - Vercel configuration
   - `.env.example` - Environment variables template

### Step 2: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional Variables:

```
GEMINI_API_KEY=your_gemini_api_key
R2_ENDPOINT=your_r2_endpoint
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_url
APP_URL=https://yourdomain.com
```

### Step 4: Configure Build Settings

1. Go to **Settings** → **Build & Development Settings**
2. Ensure:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete
3. Your app will be available at `https://your-project.vercel.app`

## Testing After Deployment

### Test API Endpoints

1. **Health Check:**
   ```
   https://your-project.vercel.app/api/health
   ```
   Expected response: `{"status":"ok","timestamp":"..."}`

2. **Prayer Times API:**
   ```
   https://your-project.vercel.app/api/pt/cal?year=2024&month=3&latitude=11.5564&longitude=104.9282&method=3&school=0&adjustment=0
   ```

3. **Quran API:**
   ```
   https://your-project.vercel.app/api/quran/chapters
   ```

4. **Quran CDN:**
   ```
   https://your-project.vercel.app/api/qurancdn/resources/translations?language=en
   ```

### Test Frontend Features

1. **Prayer Times Display:** Should show prayer times for your location
2. **Quran Reading:** Should load surahs and translations
3. **Audio Playback:** Should play Quran recitations
4. **Media Upload:** Should upload files to Telegram

## Troubleshooting

### Issue: "API is not responding"

**Solution:**
1. Check Vercel logs: `vercel logs`
2. Verify environment variables are set correctly
3. Check that API routes are deployed: Visit `/api/health`

### Issue: "Prayer Times not loading"

**Solution:**
1. Verify the `/api/pt/cal` endpoint is working
2. Check browser console for CORS errors
3. Ensure latitude/longitude are being sent correctly

### Issue: "Quran content not displaying"

**Solution:**
1. Test the proxy: `https://your-project.vercel.app/api/quran/chapters`
2. Check if external APIs are accessible
3. Verify no rate limiting is occurring

### Issue: "File uploads failing"

**Solution:**
1. Verify `TELEGRAM_BOT_TOKEN` is correct
2. Check Telegram bot is active and has permissions
3. Ensure file size is within limits (10MB for audio/images, 600MB for videos)

## API Endpoints Reference

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/api/health` | Health check | GET |
| `/api/pt/cal` | Prayer times calendar | GET with query params |
| `/api/pt/gToH` | Gregorian to Hijri conversion | GET with query params |
| `/api/quran/*` | Quran.com API proxy | GET |
| `/api/qurancdn/*` | QuranCDN API proxy | GET |
| `/api/alquran/*` | Alquran.cloud API proxy | GET |
| `/api/quranenc/*` | QuranEnc API proxy | GET |
| `/api/nominatim/reverse` | Location reverse geocoding | GET |
| `/api/proxy-audio` | Audio file proxy | GET with URL param |
| `/api/upload` | Upload audio to Telegram | POST |

## Performance Optimization

1. **Function Duration:** Set to 30 seconds (sufficient for API calls)
2. **Memory:** Set to 1024MB (handles file uploads)
3. **Caching:** Configured in `vite.config.ts` for offline support

## Security Considerations

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Rotate Telegram bot token** if compromised
3. **Use environment variables** for all sensitive data
4. **Enable HTTPS** (automatic with Vercel)
5. **Set up rate limiting** for production (optional)

## Monitoring

1. **Vercel Analytics:** Available in dashboard
2. **Error Tracking:** Check Vercel logs for errors
3. **Performance:** Monitor function duration and memory usage

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

## Support

For issues or questions:
1. Check Vercel logs: `vercel logs`
2. Review this guide's troubleshooting section
3. Check GitHub issues for similar problems
4. Contact support at ponloevideos@gmail.com

---

**Last Updated:** March 2024
**Version:** 1.2.0
