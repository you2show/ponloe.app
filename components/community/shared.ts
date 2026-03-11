
// --- Interfaces ---

export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isVerified?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voterIds?: string[];
}

export interface MediaItem {
  url: string;
  caption?: string;
}

export interface Post {
  id: string;
  user: User;
  content: string; // Used as description or main text
  image?: string; // Legacy single image
  images?: string[] | MediaItem[]; // Multiple images (supports simple strings or objects with captions)
  imageLayout?: 'grid' | 'featured' | 'carousel' | 'list'; // Layout type
  timestamp: string;
  likes: number; 
  commentsCount: number;
  shares: number;
  isLiked: boolean;
  type: 'text' | 'image' | 'poll' | 'video' | 'dua' | 'fundraiser' | 'event' | 'quran' | 'hadith' | 'book' | 'qna' | 'market' | 'audio' | 'voice' | 'live' | 'article' | 'bg' | 'tag' | 'feeling' | 'checkin' | 'camera';
  
  // New Feature Fields
  background?: string; // CSS class for background color
  location?: string;
  feeling?: { name: string; emoji: string; type?: string; text?: string };
  taggedUsers?: string[];
  extra_data?: any;
  originalType?: string;

  // Optional data based on type
  pollOptions?: PollOption[];
  totalVotes?: number;
  
  fundraiser?: {
    raised: number;
    target: number;
    currency: string;
    donors: number;
  };
  
  event?: {
    date: string;
    location: string;
    interestedCount: number;
  };

  quranData?: {
    surahName: string;
    ayahNumber: number;
    arabicText: string;
    translation: string;
  };

  hadithData?: {
    source: string; // e.g., Bukhari, Muslim
    number: string;
    text: string;
  };

  bookData?: {
    title: string;
    author: string;
    cover?: any;
    coverPreview?: string;
    pdfFile?: any;
    pdfLink?: string;
    pages?: string;
    publishedDate?: string;
    category?: string;
    textContent?: { title: string; content: string }[];
  };

  audioData?: {
    type?: 'playlist';
    duration: string | number;
    audioUrl?: string; // Optional real URL, mocked for now
    waveform?: number[]; // Array of heights for visual
    title?: string;
    speakerName?: string;
    cover?: string;
    tracks?: Array<{
      id: string;
      fileId: string;
      url: string;
      duration: number | string;
      title: string;
      artist?: string;
      cover?: string;
      waveform?: number[];
    }>;
  };

  qnaData?: {
    question: string;
    isAnswered: boolean;
  };
  
  marketData?: {
    price: string;
    location: string;
    category: string;
  };

  duaData?: {
    arabic: string;
    khmer: string;
    content?: string;
  };
}

export interface Story {
  id: string;
  user: User;
  hasUnseen: boolean;
  image: string;
}

export interface Reel {
  id: string;
  videoUrl: string; 
  user: User;
  likes: string;
  views: string;
}

export interface MarketItem {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  seller: string;
}

// --- Mock Data ---

export const MOCK_USER: User = {
  id: 'me',
  name: 'ភ្ញៀវ (Guest)',
  avatar: 'https://ui-avatars.com/api/?name=Guest&background=059669&color=fff',
};
