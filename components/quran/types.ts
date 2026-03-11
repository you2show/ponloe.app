
export interface Surah {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_khmer?: string;
}

export interface Juz {
  id: number;
  juz_number: number;
  verse_mapping: {
    [key: string]: string; // "1": "1-7" (Surah ID: Range)
  };
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  text_uthmani: string;
  text_indopak: string;
  text_imlaei: string;
  translation?: { text: string };
  transliteration?: { text: string };
}

export interface Ayah {
  id: number;
  verse_key: string;
  verse_number: number;
  text_arabic: string;
  words: Word[];
  translations?: {
    id: number;
    resource_id: number;
    text: string;
    language_name?: string;
  }[];
  audio?: {
    url: string;
    segments: number[][]; // [word_index, start_time, end_time]
  };
  tafsir?: {
      text: string;
      source?: string;
  };
}

export type ArabicScriptType = 'uthmani' | 'indopak' | 'imlaei' | 'uthmani_tajweed';

export interface QuranSettings {
  arabicFontSize: number;
  translationFontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  showTafsirInline: boolean;
  wordHighlighting: boolean;
  showWordByWord: boolean; // New feature
  showTajweed: boolean; // New feature
  reciterId: number;
  autoPlayNext: boolean;
  arabicScript: ArabicScriptType;
  fontClass: string;
  ttsVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  ttsSpeed: number;
}

export const DEFAULT_SETTINGS: QuranSettings = {
  arabicFontSize: 34,
  translationFontSize: 16,
  showTranslation: true,
  showTransliteration: false,
  showTafsirInline: false,
  wordHighlighting: true,
  showWordByWord: false, // Disabled by default to keep it clean
  showTajweed: false, // Disabled by default
  reciterId: 7, 
  autoPlayNext: true,
  arabicScript: 'uthmani',
  fontClass: 'font-me-quran-volt',
  ttsVoice: 'Kore',
  ttsSpeed: 1.0,
};
