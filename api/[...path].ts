import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import helmet from 'helmet';

// --- Environment Variables ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '-1001003526327706';
const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jposixqotpxzaafnmsjx.supabase.co';
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';

const app = express();

// --- Security Middlewares ---
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

let s3Client: S3Client | null = null;
function getS3Client() {
  if (s3Client !== null) return s3Client;
  const isR2Configured = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);
  if (isR2Configured) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Proxy Helper with improved error handling ---
async function proxyRequest(req: express.Request, res: express.Response, targetUrl: string, options: any = {}) {
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
      const bodyData = options.body || req.body;
      if (bodyData) {
        if (typeof bodyData === 'object' && !Buffer.isBuffer(bodyData)) {
          fetchOptions.body = JSON.stringify(bodyData);
          (fetchOptions.headers as any)['Content-Type'] = 'application/json';
        } else {
          fetchOptions.body = bodyData;
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    // Handle streaming responses
    if (options.responseType === 'stream' || contentType?.includes('audio') || contentType?.includes('video')) {
      res.status(response.status);
      
      // Forward relevant headers
      const headers = ['content-length', 'content-range', 'accept-ranges', 'cache-control'];
      for (const header of headers) {
        const value = response.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      
      if (response.body) {
        // @ts-ignore
        for await (const chunk of response.body) {
          res.write(chunk);
        }
      }
      res.end();
      return;
    }

    // Handle JSON/text responses
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error: any) {
    console.error(`[PROXY ERROR] ${targetUrl}:`, error.message);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Gateway Timeout', 
        message: 'The external API took too long to respond. Please try again.' 
      });
    }

    res.status(500).json({ 
      error: 'Proxy Error', 
      status: 500,
      message: error.message?.substring(0, 500) || 'Unknown error'
    });
  }
}

// --- Telegram API Routes ---
const CHAT_ID = TELEGRAM_CHANNEL_ID;
const TOPICS = {
  images: 2,
  audios: 3,
  videos: 4,
  voice: 5,
  reels: 6,
  market: 7,
  book: 8
};

// Lazy multer initialization
let uploadAudio: any = null;
function getUploadAudio() {
  if (!uploadAudio) {
    const m = (multer as any).default || multer;
    uploadAudio = m({ storage: m.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  }
  return uploadAudio;
}

const handleUpload = (getUploadMiddleware: () => any) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const uploadMiddleware = getUploadMiddleware();
      uploadMiddleware.single('audio')(req, res, (err: any) => {
        if (err && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'ឯកសារធំពេក សូមជ្រើសរើសទំហំតូចជាងនេះ (អតិបរមា: រូបភាព/សំឡេង 10MB, វីដេអូ 600MB)។' });
        } else if (err) {
          return res.status(500).json({ error: err.message });
        }
        next();
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Multer initialization failed: ' + error.message });
    }
  };
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/upload', handleUpload(getUploadAudio), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No audio file uploaded' });
    const isVoice = req.body.type === 'voice';
    const topicId = isVoice ? TOPICS.voice : TOPICS.audios;
    
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('message_thread_id', topicId.toString());
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append(isVoice ? 'voice' : 'audio', blob, file.originalname);
    
    const endpoint = isVoice ? 'sendVoice' : 'sendAudio';
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData as any
    });
    
    const data = await response.json();
    if (!data.ok) return res.status(502).json({ error: `Telegram API Error: ${data.description}` });
    const fileId = isVoice ? data.result.voice.file_id : data.result.audio.file_id;
    res.json({ success: true, fileId, messageId: data.result.message_id, chatId: CHAT_ID, topicId });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Prayer Times API
app.get('/api/pt/cal', async (req, res) => {
  try {
    const { year, month, latitude, longitude, method, school, adjustment } = req.query;
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&adjustment=${adjustment}`;
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pt/gToH', async (req, res) => {
  try {
    const { month, year, method } = req.query;
    const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?method=${method}`;
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Nominatim API
app.get('/api/nominatim/reverse', async (req, res) => {
  try {
    const { lat, lon, zoom, 'accept-language': acceptLanguage } = req.query;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=${acceptLanguage}`;
    await proxyRequest(req, res, url, {
      headers: { 'User-Agent': 'PonloeApp/1.0 (ponloevideos@gmail.com)' }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quran APIs - QuranEnc
app.get('/api/quranenc/:translationKey/:surahNumber', async (req, res) => {
  try {
    const { translationKey, surahNumber } = req.params;
    const url = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${surahNumber}`;
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quran APIs - Alquran.cloud
app.get('/api/alquran/*', async (req, res) => {
  try {
    let endpoint = req.params[0] || '';
    
    // Extract path from URL if params[0] is not set
    if (!endpoint) {
      const urlPath = req.url.split('/api/alquran/')[1];
      endpoint = urlPath?.split('?')[0] || '';
    }
    
    const queryParams = new URLSearchParams(req.query as any).toString();
    const url = `https://api.alquran.cloud/v1/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    console.log(`[ALQURAN] Endpoint: ${endpoint}, Full URL: ${url}`);
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quran APIs - Quran.com
app.get('/api/quran/*', async (req, res) => {
  try {
    let endpoint = req.params[0] || '';
    
    // Extract path from URL if params[0] is not set
    if (!endpoint) {
      const urlPath = req.url.split('/api/quran/')[1];
      endpoint = urlPath?.split('?')[0] || '';
    }
    
    const queryParams = new URLSearchParams(req.query as any).toString();
    const url = `https://api.quran.com/api/v4/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    console.log(`[QURAN] Endpoint: ${endpoint}, Full URL: ${url}`);
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quran APIs - QuranCDN
app.get('/api/qurancdn/*', async (req, res) => {
  try {
    let endpoint = req.params[0] || '';
    
    // Extract path from URL if params[0] is not set
    if (!endpoint) {
      const urlPath = req.url.split('/api/qurancdn/')[1];
      endpoint = urlPath?.split('?')[0] || '';
    }
    
    const queryParams = new URLSearchParams(req.query as any).toString();
    const url = `https://api.qurancdn.com/api/qdc/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    console.log(`[QURANCDN] Endpoint: ${endpoint}, Full URL: ${url}`);
    await proxyRequest(req, res, url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audio proxy
app.get('/api/proxy-audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing or invalid URL' });
    
    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
    }

    const response = await fetch(url, { headers });

    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    
    const contentRange = response.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    
    if (response.body) {
      // @ts-ignore
      for await (const chunk of response.body) {
        res.write(chunk);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Proxy audio error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Root API handler
app.get('/api', (req, res) => {
  res.json({ status: 'API is running', version: '1.2.0', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

export default function (req: any, res: any) {
  return app(req, res);
}
