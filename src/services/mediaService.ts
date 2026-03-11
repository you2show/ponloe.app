import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ponloe_media_cache';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;

export interface CachedMedia {
  url: string;
  blob: Blob;
  mimeType: string;
  cachedAt: number;
}

class MediaService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        }
      },
    });
  }

  async getMedia(url: string): Promise<CachedMedia | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, url);
  }

  async saveMedia(url: string, blob: Blob): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, {
      url,
      blob,
      mimeType: blob.type,
      cachedAt: Date.now(),
    });
  }

  async cacheMedia(url: string): Promise<string> {
    if (!url) return '';
    
    // Check if already cached
    const cached = await this.getMedia(url);
    if (cached) {
      return URL.createObjectURL(cached.blob);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch media for caching: ${url} (Status: ${response.status})`);
        return url;
      }
      
      // Validate content type to avoid caching HTML error pages (e.g., from Vercel rewrites)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.warn(`Received HTML instead of media for: ${url}. Skipping cache.`);
        return url;
      }
      
      const blob = await response.blob();
      await this.saveMedia(url, blob);
      return URL.createObjectURL(blob);
    } catch (error) {
      // Silently fallback to original URL for CORS or network errors
      console.warn(`Could not cache media: ${url}`, error);
      return url; // Fallback to original URL
    }
  }

  async isCached(url: string): Promise<boolean> {
    const db = await this.dbPromise;
    const media = await db.get(STORE_NAME, url);
    return !!media;
  }

  async clearCache(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }
}

export const mediaService = new MediaService();
