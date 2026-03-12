import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Environment Variables ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '-1001003526327706';

// --- Proxy Helper ---
async function proxyRequest(req: VercelRequest, res: VercelResponse, targetUrl: string, options: any = {}) {
  try {
    console.log(`[PROXY] Requesting: ${targetUrl}`);
    
    const fetchOptions: RequestInit = {
      method: options.method || req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(options.headers || {}),
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body) {
        fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
        if (typeof req.body === 'object') {
          (fetchOptions.headers as any)['Content-Type'] = 'application/json';
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    // Forward headers
    const headersToForward = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
    headersToForward.forEach(h => {
      const val = response.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    res.status(response.status);

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error: any) {
    console.error(`[PROXY ERROR] ${targetUrl}:`, error.message);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Proxy Error', message: error.message });
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers manually
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const search = parsedUrl.search;
  
  console.log(`[API] Request Path: ${pathname}`);

  // Health check
  if (pathname === '/api/health' || pathname === '/api') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.2.0' });
  }

  // --- Telegram Media Proxy Endpoints ---
  if (pathname.startsWith('/api/image/') || pathname.startsWith('/api/audio/') || pathname.startsWith('/api/video/')) {
    const fileId = pathname.split('/').pop();
    if (!fileId) return res.status(400).json({ error: 'Missing fileId' });
    
    try {
      const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData: any = await fileResponse.json();
      if (!fileData.ok) return res.status(404).json({ error: 'File not found on Telegram', details: fileData });
      const target = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
      return proxyRequest(req, res, target);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- Telegram Send Message ---
  if (pathname === '/api/telegram/send' && req.method === 'POST') {
    const { chatId, text } = req.body;
    const target = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    return proxyRequest(req, res, target, {
      method: 'POST',
      body: { chat_id: chatId || TELEGRAM_CHANNEL_ID, text, parse_mode: 'HTML' }
    });
  }

  // --- External API Proxies ---

  // Prayer Times API
  if (pathname.startsWith('/api/pt/cal')) {
    const target = `https://api.aladhan.com/v1/calendar/${req.query.year}/${req.query.month}${search}`;
    return proxyRequest(req, res, target);
  }

  if (pathname.startsWith('/api/pt/gToH')) {
    const target = `https://api.aladhan.com/v1/gToHCalendar/${req.query.month}/${req.query.year}${search}`;
    return proxyRequest(req, res, target);
  }

  // Nominatim API
  if (pathname.startsWith('/api/nominatim/reverse')) {
    const target = `https://nominatim.openstreetmap.org/reverse${search}`;
    return proxyRequest(req, res, target, {
      headers: { 'User-Agent': 'PonloeApp/1.0 (ponloevideos@gmail.com)' }
    });
  }

  // Quran APIs
  if (pathname.startsWith('/api/quranenc/')) {
    const subPath = pathname.replace('/api/quranenc/', '');
    const target = `https://quranenc.com/api/v1/translation/sura/${subPath}`;
    return proxyRequest(req, res, target);
  }

  if (pathname.startsWith('/api/alquran/')) {
    const subPath = pathname.replace('/api/alquran/', '');
    const target = `https://api.alquran.cloud/v1/${subPath}${search}`;
    return proxyRequest(req, res, target);
  }

  if (pathname.startsWith('/api/quran/')) {
    const subPath = pathname.replace('/api/quran/', '');
    const target = `https://api.quran.com/api/v4/${subPath}${search}`;
    return proxyRequest(req, res, target);
  }

  if (pathname.startsWith('/api/qurancdn/')) {
    const subPath = pathname.replace('/api/qurancdn/', '');
    const target = `https://api.qurancdn.com/api/qdc/${subPath}${search}`;
    return proxyRequest(req, res, target);
  }

  // Audio proxy for direct URLs
  if (pathname.startsWith('/api/proxy-audio')) {
    const target = req.query.url as string;
    if (!target) return res.status(400).json({ error: 'Missing URL' });
    const headers: any = {};
    if (req.headers.range) headers.Range = req.headers.range;
    return proxyRequest(req, res, target, { headers });
  }

  return res.status(404).json({ error: 'Not Found', path: pathname });
}
