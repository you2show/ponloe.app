import { openDB, IDBPDatabase } from 'idb';

export interface DownloadedBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  file_blob: Blob;
  file_type: string;
  downloaded_at: number;
  size: number;
}

const DB_NAME = 'ponloe_library';
const STORE_NAME = 'downloaded_books';
const DB_VERSION = 1;

class LibraryService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async saveBook(book: DownloadedBook): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, book);
  }

  async getBook(id: string): Promise<DownloadedBook | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  async getAllBooks(): Promise<DownloadedBook[]> {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  async deleteBook(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async isBookDownloaded(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const book = await db.get(STORE_NAME, id);
    return !!book;
  }

  async downloadAndSaveBook(
    id: string, 
    title: string, 
    author: string, 
    cover_url: string, 
    file_url: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const response = await fetch(file_url);
      if (!response.ok) throw new Error('Failed to fetch book file');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      let loaded = 0;
      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0 && onProgress) {
          onProgress(Math.round((loaded / total) * 100));
        }
      }

      const blob = new Blob(chunks, { type: 'application/pdf' });
      
      const downloadedBook: DownloadedBook = {
        id,
        title,
        author,
        cover_url,
        file_blob: blob,
        file_type: 'application/pdf',
        downloaded_at: Date.now(),
        size: blob.size
      };

      await this.saveBook(downloadedBook);
    } catch (error) {
      console.error('Error downloading book:', error);
      throw error;
    }
  }
}

export const libraryService = new LibraryService();
