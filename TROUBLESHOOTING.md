# Ponloe App - Troubleshooting Guide

## Common Issues and Solutions

### 1. Quran API Not Loading

#### Symptoms:
- Quran content shows as blank or loading forever
- Console shows 404 or 500 errors for `/api/quran/*` requests
- "Failed to fetch Quran data" message

#### Root Causes:
1. API proxy not working on Vercel
2. External API (api.quran.com) is down or rate-limited
3. CORS issues (unlikely with proxy)
4. Incorrect URL path parsing

#### Solutions:

**Step 1: Verify API Endpoint**
```bash
# Test directly
curl "https://your-project.vercel.app/api/quran/chapters"

# Should return JSON with chapters list
```

**Step 2: Check Vercel Logs**
```bash
vercel logs
# Look for errors related to /api/quran
```

**Step 3: Verify External API**
```bash
# Test external API directly
curl "https://api.quran.com/api/v4/chapters"
# Should return data
```

**Step 4: Check Frontend Code**
- Open browser DevTools → Network tab
- Look for failed requests to `/api/quran/`
- Check the response status and body

**Step 5: Restart Deployment**
```bash
vercel redeploy
```

---

### 2. Prayer Times Not Displaying

#### Symptoms:
- Prayer times show as "Loading..." indefinitely
- Location selector works but times don't load
- Console shows errors for `/api/pt/cal` requests

#### Root Causes:
1. Aladhan API is down or rate-limited
2. Location coordinates (latitude/longitude) not being sent
3. Invalid query parameters
4. Timeout on API request

#### Solutions:

**Step 1: Verify Location Data**
- Open browser DevTools → Console
- Check if location is being detected
- Verify latitude/longitude values are numbers

**Step 2: Test Prayer Times API**
```bash
# Replace with actual coordinates
curl "https://your-project.vercel.app/api/pt/cal?year=2024&month=3&latitude=11.5564&longitude=104.9282&method=3&school=0&adjustment=0"

# Should return prayer times data
```

**Step 3: Check Browser Storage**
- Open DevTools → Application → Local Storage
- Look for `prayerTimeOffsets` and `prayerHijriAdjustment`
- These should be valid JSON

**Step 4: Clear Cache and Reload**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

**Step 5: Verify Aladhan API**
```bash
# Test external API directly
curl "https://api.aladhan.com/v1/calendar/2024/3?latitude=11.5564&longitude=104.9282&method=3&school=0"
```

---

### 3. Audio/Media Upload Failing

#### Symptoms:
- Upload button doesn't work or shows error
- "Telegram credentials not configured" message
- File uploads but doesn't appear in app

#### Root Causes:
1. `TELEGRAM_BOT_TOKEN` not set or incorrect
2. `TELEGRAM_CHANNEL_ID` not set or incorrect
3. Telegram bot doesn't have permissions
4. File size exceeds limits

#### Solutions:

**Step 1: Verify Environment Variables**
```bash
# In Vercel dashboard
Settings → Environment Variables

# Check:
- TELEGRAM_BOT_TOKEN is set
- TELEGRAM_CHANNEL_ID is set
- Both values are correct (no extra spaces)
```

**Step 2: Test Telegram Bot**
```bash
# Send test message to bot
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/sendMessage" \
  -d "chat_id=YOUR_CHANNEL_ID&text=Test"

# Should return success
```

**Step 3: Check File Size**
- Audio/Images: Maximum 10MB
- Videos: Maximum 600MB
- Ensure file is within limits

**Step 4: Verify Telegram Permissions**
- Bot must be admin in the channel
- Channel must have topics enabled (if using topics)
- Bot must have permission to post messages

**Step 5: Redeploy with New Variables**
```bash
# After updating environment variables
vercel redeploy
```

---

### 4. CORS Errors in Browser

#### Symptoms:
- Console shows "CORS policy" errors
- Requests to `/api/*` are blocked
- Frontend can't communicate with backend

#### Root Causes:
1. CORS middleware not configured
2. Request headers not allowed
3. Origin not whitelisted

#### Solutions:

**Step 1: Verify CORS Configuration**
- Check `/api/[...path].ts` has `app.use(cors())`
- Should allow all origins in development

**Step 2: Check Request Headers**
- Open DevTools → Network tab
- Look at request headers
- Verify `Origin` header is present

**Step 3: Test CORS**
```bash
curl -H "Origin: https://your-project.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "https://your-project.vercel.app/api/health"
```

---

### 5. Build Failing on Vercel

#### Symptoms:
- Deployment fails with build error
- "npm run build" fails
- TypeScript compilation errors

#### Root Causes:
1. Missing dependencies
2. TypeScript errors
3. Incompatible package versions
4. Environment variables missing during build

#### Solutions:

**Step 1: Check Build Logs**
```bash
vercel logs --tail
# Watch for specific error messages
```

**Step 2: Test Build Locally**
```bash
npm install
npm run build
# Should complete without errors
```

**Step 3: Clear Vercel Cache**
```bash
vercel env pull  # Get current env vars
vercel build --prod  # Rebuild
```

**Step 4: Check Dependencies**
```bash
npm list
# Look for conflicting versions
```

**Step 5: Update package.json**
```bash
npm update
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

### 6. Slow API Response Times

#### Symptoms:
- API requests take 10+ seconds
- Timeout errors (504 Gateway Timeout)
- "The external API took too long to respond"

#### Root Causes:
1. External APIs are slow
2. Vercel function timeout too short
3. Network latency
4. Rate limiting

#### Solutions:

**Step 1: Increase Function Timeout**
- Edit `vercel.json`
- Increase `maxDuration` from 30 to 60 seconds
- Redeploy

```json
"functions": {
  "api/[...path].ts": {
    "maxDuration": 60,
    "memory": 1024
  }
}
```

**Step 2: Implement Caching**
- Already configured in `vite.config.ts`
- Service Worker caches API responses
- Should improve subsequent requests

**Step 3: Check External APIs**
```bash
# Test response time
time curl "https://api.quran.com/api/v4/chapters"
```

**Step 4: Monitor Vercel Metrics**
- Go to Vercel dashboard
- Check function duration and memory usage
- Look for patterns in slow requests

---

### 7. Frontend Not Loading

#### Symptoms:
- Blank white page
- "Cannot GET /" error
- 404 Not Found

#### Root Causes:
1. Build output directory incorrect
2. `vercel.json` rewrites not working
3. `index.html` not built
4. Vite configuration issue

#### Solutions:

**Step 1: Verify Build Output**
```bash
npm run build
ls -la dist/
# Should contain index.html and other files
```

**Step 2: Check vercel.json Rewrites**
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  },
  {
    "source": "/((?!api(?:/.*)?).*)",
    "destination": "/index.html"
  }
]
```

**Step 3: Test Locally**
```bash
npm run build
npm run preview
# Visit http://localhost:4173
```

**Step 4: Check Vite Configuration**
- Verify `outDir: 'dist'` in `vite.config.ts`
- Check build plugins are correct

---

### 8. Database Connection Issues

#### Symptoms:
- "Supabase connection failed" errors
- User authentication not working
- Data not syncing

#### Root Causes:
1. `VITE_SUPABASE_URL` not set
2. `VITE_SUPABASE_ANON_KEY` not set or incorrect
3. Supabase project is down
4. Network connectivity issue

#### Solutions:

**Step 1: Verify Supabase Variables**
```bash
# In Vercel dashboard
Settings → Environment Variables

# Check:
- VITE_SUPABASE_URL is correct
- VITE_SUPABASE_ANON_KEY is correct
- No extra spaces or characters
```

**Step 2: Test Supabase Connection**
```bash
# Visit Supabase dashboard
# Check project status
# Verify API is responding
```

**Step 3: Check Network Connectivity**
```bash
# In browser console
fetch('https://your-supabase-url/rest/v1/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Debug Mode

### Enable Verbose Logging

**In browser console:**
```javascript
// Enable debug logging
localStorage.setItem('DEBUG', 'ponloe:*');
location.reload();
```

**In Vercel:**
```bash
# View real-time logs
vercel logs --tail

# Filter by function
vercel logs --tail api
```

---

## Performance Diagnostics

### Check Function Performance

```bash
# View function metrics
vercel analytics

# Check specific function
vercel logs --function api
```

### Browser Performance

```javascript
// In browser console
// Check API response times
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/'))
  .forEach(r => console.log(r.name, r.duration + 'ms'))
```

---

## Getting Help

1. **Check Vercel Logs:** `vercel logs --tail`
2. **Review This Guide:** Search for your symptom
3. **Check Browser Console:** DevTools → Console tab
4. **Test Endpoints:** Use curl or Postman
5. **Contact Support:** ponloevideos@gmail.com

---

**Last Updated:** March 2024
**Version:** 1.2.0
