
import { Surah, Ayah, Juz, ArabicScriptType } from './types';

export const KHMER_SURAH_NAMES: Record<number, string> = {
  1: "អាល់ ហ្វាទីហះ", 2: "អាល់ហ្ពាករ៉ោះ", 3: "អាលីអុីមរ៉ន", 4: "អាន់នីសាក", 5: "អាល់ម៉ាអុីដះ",
  6: "អាល់អាន់អាម", 7: "អាល់អាក់រ៉ហ្វ", 8: "អាល់អាន់ហ្វាល", 9: "អាត់តាវហ្ពះ", 10: "យូនូស",
  11: "ហ៊ូទ", 12: "យូសុហ្វ", 13: "អើររ៉ក់ទ៍", 14: "អុីព្រហុីម", 15: "អាល់ហុិជរ៍",
  16: "អាន់ណះល៍", 17: "អាល់អុីសរ៉ក", 18: "អាល់កះហ្វី", 19: "ម៉ារយុំា", 20: "តហា",
  21: "អាល់អាំពីយ៉ាក", 22: "អាល់ហាជ្ជ", 23: "អាល់មុមីនូន", 24: "អាន់នូរ", 25: "អាល់ហ្វួរកន",
  26: "អាស្ហស៊្ហូអារ៉ក", 27: "អាន់ណាំល៍", 28: "អាល់កសស", 29: "អាល់អាំងកាពូត", 30: "អើររ៉ូម",
  31: "លុកម៉ាន", 32: "អាស់សាជដះ", 33: "អាល់អះហ្សាប", 34: "សាហ្ពាក", 35: "ហ្វាតៀរ",
  36: "យ៉ាសុីន", 37: "អាស់សហ្វហ្វាត", 38: "សទ", 39: "អាស់ហ្សូមើរ", 40: "ហ្គហ្វៀរ",
  41: "ហ្វូសសុីឡាត់", 42: "អាស្ហ់ស្ហ៊ូរ៉", 43: "អាហ្សហ្សុខរ៉ហ្វ", 44: "អាត់ទូខន", 45: "អាល់ហ្ជាសុីយ៉ះ",
  46: "អាល់អះកហ្វ", 47: "មូះហាំម៉ាត់", 48: "អាល់ហ្វាត់ហ៍", 49: "អាល់ហ៊ូជូរ៉ត", 50: "កហ្វ",
  51: "អាស់ហ្សារីយ៉ាត", 52: "អាត់តួរ", 53: "អាន់ណាច់ម៍", 54: "អាល់កមើរ", 55: "អើររ៉ោះម៉ាន",
  56: "អាល់វ៉ាគីអះ", 57: "អាល់ហាទីត", 58: "អាល់មូជើទើឡះ", 59: "អាល់ហាស្ហរ៍", 60: "អាល់មុមតាហុីណះ",
  61: "អាសសហ្វ", 62: "អាល់ជូមូអះ", 63: "អាល់មូណាហ្វុីគូន", 64: "អាត់តាហ្គពុន", 65: "អាត់តឡាគ",
  66: "អាត់តះរីម", 67: "អាល់មុលក៍", 68: "អាល់កឡាំ", 69: "អាល់ហាគកោះ", 70: "អាល់ម៉ាអារិច",
  71: "នួហ", 72: "អាល់ជិន", 73: "អាល់មូសហ្សាំមិល", 74: "អាល់មុដដាសសៀរ", 75: "អាល់គីយ៉ាម៉ះ",
  76: "អាល់អុិនសាន", 77: "អាល់មូរសុីឡាត", 78: "អាន់ណាហ្ពាក", 79: "អាន់ណាហ្សុីអាត", 80: "អាហ្ពាស",
  81: "អាត់តឹកវៀរ", 82: "អាល់អុីមហ្វុីត័រ", 83: "អាល់មូតហ្វហ្វុីហ្វុីន", 84: "អាល់អុិនស្ហុីកក", 85: "អាល់ពូរូជ",
  86: "អាត់តរិក", 87: "អាល់អាក់ឡា", 88: "អាល់ហ្ពាកស្ហុីយ៉ះ", 89: "អាល់ហ្វាច់រ៍", 90: "អាល់ហ្ពាឡាត់",
  91: "អាស្ហ់ស្ហាំ", 92: "អាល់ឡៃល៍", 93: "អាត់ទូហា", 94: "អាស្ហស្ហើរហ៍", 95: "អាត់ទីន",
  96: "អាល់អាឡឹក", 97: "អាល់កដរ៍", 98: "អាល់ហ្ពៃយីណះ", 99: "អាល់ហ្សាល់ហ្សាឡះ", 100: "អាល់អាទីយ៉ាត",
  101: "អាល់ករីអះ", 102: "អាត់តាកាស៊ួរ", 103: "អាល់អោសរ៍", 104: "អាល់ហ៊ូម៉ាហ្សះ", 105: "អាល់ហ្វុីល",
  106: "គូរ៉ស្ហ", 107: "អាល់ម៉ាអូន", 108: "អាល់កាវសើរ", 109: "អាល់កាហ្វុីរ៉ូន", 110: "អាន់ណោសរ៍",
  111: "អាល់ម៉ាសាដ", 112: "អាល់អៀខឡោស", 113: "អាល់ហ្វាឡឹក", 114: "អាន់ណាស"
};

const QURAN_API_BASE = "/api/quran";
const QURANENC_API_BASE = "https://quranenc.com/api/v1";

// --- 2. Quran.com (QDC) API ---
const QDC_API_BASE_URL = '/api/qurancdn';

/**
 * Fetches available translations from Quran.com API.
 * @param {string} language - The language to get translated names for (e.g., 'en' for English).
 * @returns {Promise<Object>}
 */
export async function getQdcTranslations(language = 'en', retryCount = 0) {
  try {
    const response = await fetch(`${QDC_API_BASE_URL}/resources/translations?language=${language}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getQdcTranslations(language, retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }
    const data = await response.json();
    return data.translations;
  } catch (error) {
    console.error('Error fetching QDC translations:', error);
    return null;
  }
}

/**
 * Fetches available reciters from Quran.com API.
 * @param {string} locale - The locale for reciter names (e.g., 'en').
 * @returns {Promise<Object>}
 */
export async function getQdcReciters(locale = 'en', retryCount = 0) {
  try {
    const response = await fetch(`${QDC_API_BASE_URL}/audio/reciters?language=${locale}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getQdcReciters(locale, retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }
    const data = await response.json();
    return data.reciters;
  } catch (error) {
    console.error('Error fetching QDC reciters:', error);
    return null;
  }
}

/**
 * Fetches audio data for a specific chapter and reciter from Quran.com API.
 * @param {number} reciterId - The ID of the reciter.
 * @param {number} chapterNumber - The chapter number (Surah).
 * @param {boolean} segments - Whether to include verse-by-verse timestamps.
 * @returns {Promise<Object>}
 */
export async function getQdcChapterAudioData(reciterId: number, chapterNumber: number, segments = false, retryCount = 0) {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/chapter_recitations/${reciterId}/${chapterNumber}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getQdcChapterAudioData(reciterId, chapterNumber, segments, retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }
    const data = await response.json();
    return data.audio_file;
  } catch (error) {
    console.error('Error fetching QDC chapter audio data:', error);
    return null;
  }
}

// --- 3. Alquran.cloud API ---
const ALQURAN_CLOUD_API_BASE_URL = '/api/alquran';

/**
 * Fetches a specific Surah with Khmer translation from Alquran.cloud API.
 * @param {number} surahNumber - The Surah number.
 * @returns {Promise<Object>}
 */
export async function getAlquranCloudKhmerTranslation(surahNumber: number, retryCount = 0) {
  try {
    // Using 'km.khmer' for Khmer translation
    const response = await fetch(`${ALQURAN_CLOUD_API_BASE_URL}/surah/${surahNumber}/km.khmer`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getAlquranCloudKhmerTranslation(surahNumber, retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Alquran.cloud Khmer translation:', error);
    return null;
  }
}

/**
 * Fetches audio for a specific Ayah from Alquran.cloud API.
 * @param {number} surahNumber - The Surah number.
 * @param {number} ayahNumber - The Ayah number.
 * @param {string} reciterIdentifier - Identifier for the reciter (e.g., 'ar.alafasy').
 * @returns {Promise<Object>}
 */
export async function getAlquranCloudAyahAudio(surahNumber: number, ayahNumber: number, reciterIdentifier = 'ar.alafasy', retryCount = 0) {
  try {
    const response = await fetch(
      `${ALQURAN_CLOUD_API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${reciterIdentifier}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getAlquranCloudAyahAudio(surahNumber, ayahNumber, reciterIdentifier, retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }
    const data = await response.json();
    return data.data.audio;
  } catch (error) {
    console.error('Error fetching Alquran.cloud Ayah audio:', error);
    return null;
  }
}

// --- 4. QuranEnc.com API ---
// Base URL for QuranEnc.com API:
// const QURANENC_API_BASE_URL = 'https://quranenc.com/api/v1'; // Already defined above

/**
 * Fetches a specific Surah with Khmer translation from QuranEnc.com API.
 * @param {number} surahNumber - The Surah number.
 * @param {string} translationKey - The translation key (e.g., 'khmer_cambodia' or 'khmer_rwwad').
 * @returns {Promise<Object>}
 */
export async function getQuranEncKhmerTranslation(surahNumber: number, translationKey = 'khmer_cambodia', retryCount = 0): Promise<any> {
  try {
    const baseUrl = '';
    const response = await fetch(
      `${baseUrl}/api/quranenc/${translationKey}/${surahNumber}`
    );
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(getQuranEncKhmerTranslation(surahNumber, translationKey, retryCount + 1)), 2000));
      }
      console.error('Non-JSON response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching QuranEnc Khmer translation:', error);
    return null;
  }
}

// Helper for safer fetching
const safeFetch = async (url: string, retryCount = 0): Promise<any> => {
  try {
    const res = await fetch(url);
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(safeFetch(url, retryCount + 1)), 2000));
      }
      console.error('Non-JSON response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    return await res.json();
  } catch (e) {
    console.warn(`Fetch failed for ${url}`, e);
    return null;
  }
};

export const fetchSurahs = async (retryCount = 0): Promise<Surah[]> => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/chapters?language=en`);
    if (!response.ok) throw new Error(`Failed to fetch surahs: ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(fetchSurahs(retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }

    const data = await response.json();
    return data.chapters.map((ch: any) => ({
      ...ch,
      name_khmer: KHMER_SURAH_NAMES[ch.id] || ch.name_simple
    }));
  } catch (error) {
    console.error("Failed to fetch surahs", error);
    return [];
  }
};

export const fetchJuzs = async (retryCount = 0): Promise<Juz[]> => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/juzs`);
    if (!response.ok) throw new Error("Failed to fetch juzs");
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
        return new Promise(resolve => setTimeout(() => resolve(fetchJuzs(retryCount + 1)), 2000));
      }
      console.error('Non-JSON success response:', text.substring(0, 200));
      if (text.includes('Rate exceeded.')) {
        throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
      }
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }

    const data = await response.json();
    
    // The API might return duplicate juzs (e.g. id 1 and 61 both for juz 1)
    // We only want 30 unique juzs
    const uniqueJuzs = data.juzs.filter((juz: Juz, index: number, self: Juz[]) => 
      index === self.findIndex((t) => t.juz_number === juz.juz_number)
    );
    
    return uniqueJuzs.sort((a: Juz, b: Juz) => a.juz_number - b.juz_number);
  } catch (error) {
    console.error("Failed to fetch juzs", error);
    // Return mock data for 30 Juz if API fails
    return Array.from({length: 30}, (_, i) => ({
        id: i+1,
        juz_number: i+1,
        verse_mapping: {},
        first_verse_id: 0,
        last_verse_id: 0,
        verses_count: 0
    }));
  }
};

export const fetchVerses = async (chapterId: number, reciterId: number = 7, script: ArabicScriptType = 'uthmani'): Promise<Ayah[]> => {
  try {
    const scriptField = `text_${script}`;

    // 1. Fetch Arabic Text, Audio and WORDS with segments (CRITICAL)
    // ADDED: word_fields=${scriptField} to ensure the specific script is returned for each word
    // ADDED: word_translation_language=en to get word-by-word translation
    const arabicUrl = `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?language=en&words=true&audio=${reciterId}&fields=${scriptField}&word_fields=${scriptField},translation&word_translation_language=en&per_page=300`;
    const arabicRes = await fetch(arabicUrl);
    
    if (!arabicRes.ok) {
        throw new Error(`Failed to fetch verses from Quran API: ${arabicRes.statusText}`);
    }
    
    const contentType = arabicRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response.');
    }
    
    const arabicData = await arabicRes.json();

    if (!arabicData || !arabicData.verses) {
        throw new Error("Invalid API response structure");
    }

    // 2 & 3. Fetch Translations & Tafsir in parallel (OPTIONAL - Fail safe)
    const baseUrl = '';
    const [translationData, tafsirData] = await Promise.all([
        safeFetch(`${baseUrl}/api/quranenc/khmer_cambodia/${chapterId}`),
        safeFetch(`${baseUrl}/api/quranenc/khmer_mokhtasar/${chapterId}`)
    ]);

    const translationMap = new Map();
    if (translationData?.result) {
        translationData.result.forEach((item: any) => translationMap.set(parseInt(item.aya), item.translation));
    }

    const tafsirMap = new Map();
    if (tafsirData?.result) {
        tafsirData.result.forEach((item: any) => tafsirMap.set(parseInt(item.aya), item.translation));
    }

    const cleanText = (text: string) => text ? text.replace(/<[^>]*>?/gm, '') : '';

    return arabicData.verses.map((v: any) => {
        const verseNumInt = v.verse_number;
        
        return {
            id: v.id,
            verse_key: v.verse_key,
            verse_number: v.verse_number,
            text_arabic: v[scriptField],
            words: v.words || [],
            translations: [{
                id: 0, 
                resource_id: 0,
                text: cleanText(translationMap.get(verseNumInt)) || "មិនមានការបកប្រែ (No translation)",
                language_name: 'Khmer'
            }],
            audio: v.audio,
            tafsir: {
                text: cleanText(tafsirMap.get(verseNumInt)) || "មិនមានការអធិប្បាយ (No Tafsir available)",
                source: "Tafsir Al-Mokhtasar (Khmer)"
            }
        };
    });

  } catch (error) {
    console.error("Critical error in fetchVerses", error);
    // Return empty array to trigger error UI in component instead of crashing
    return [];
  }
};

// NEW: Helper to fetch specific Ayah details for the Quote feature
export const fetchAyahDetails = async (surahId: number, ayahNum: number): Promise<{ arabic: string, translation: string } | null> => {
    try {
        // 1. Fetch Arabic (Using Uthmani by default for quotes)
        const arabicUrl = `${QURAN_API_BASE}/verses/by_key/${surahId}:${ayahNum}?fields=text_uthmani`;
        const arabicRes = await fetch(arabicUrl);
        
        if (!arabicRes.ok) {
            throw new Error(`Failed to fetch verse from Quran API: ${arabicRes.statusText}`);
        }
        
        const contentType = arabicRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned an invalid response.');
        }

        const arabicData = await arabicRes.json();
        
        if (!arabicData || !arabicData.verse) {
            return null;
        }

        const arabicText = arabicData.verse.text_uthmani;

        // 2. Fetch Translation (From QuranEnc - Cambodia)
        const baseUrl = '';
        const translationRes = await safeFetch(`${baseUrl}/api/quranenc/khmer_cambodia/${surahId}`);
        
        let translationText = "មិនមានការបកប្រែ";
        if (translationRes?.result) {
            const verseObj = translationRes.result.find((v: any) => parseInt(v.aya) === ayahNum);
            if (verseObj) {
                translationText = verseObj.translation.replace(/<[^>]*>?/gm, ''); // Clean HTML tags
            }
        }

        return {
            arabic: arabicText,
            translation: translationText
        };

    } catch (error) {
        console.error("Error fetching specific ayah:", error);
        return null;
    }
};

export const RECITERS = [
  { id: 7, name: "Mishary Rashid Alafasy", image: "https://static.qurancdn.com/images/reciters/7/mishari-rashid-al-afasy-profile.jpeg" },
  { id: 3, name: "Abdur-Rahman as-Sudais", image: "https://static.qurancdn.com/images/reciters/3/abdur-rahman-as-sudais-profile.jpeg" },
  { id: 2, name: "AbdulBaset AbdulSamad", image: "https://static.qurancdn.com/images/reciters/2/abdulbaset-abdulsamad-profile.jpeg" },
  { id: 4, name: "Abu Bakr Al-Shatri", image: "https://static.qurancdn.com/images/reciters/4/abu-bakr-al-shatri-profile.jpeg" },
  { id: 10, name: "Saud Al-Shuraim", image: "https://static.qurancdn.com/images/reciters/10/saud-al-shuraim-profile.jpeg" },
  { id: 5, name: "Hani Ar-Rifai", image: "https://static.qurancdn.com/images/reciters/5/hani-ar-rifai-profile.jpeg" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi", image: "https://static.qurancdn.com/images/reciters/9/mohamed-siddiq-al-minshawi-profile.jpeg" },
  { id: 6, name: "Mahmoud Khalil Al-Husary", image: "https://static.qurancdn.com/images/reciters/6/mahmoud-khalil-al-husary-profile.jpeg" },
  { id: 97, name: "Yasser Ad-Dussary", image: "https://static.qurancdn.com/images/reciters/97/yasser-ad-dussary-profile.jpeg" },
  { id: 161, name: "Khalifah Al Tunaiji", image: "https://static.qurancdn.com/images/reciters/161/khalifah-al-tunaiji-profile.jpeg" },
  { id: 11, name: "Mohamed al-Tablawi", image: "https://static.qurancdn.com/images/reciters/11/mohamed-al-tablawi-profile.jpeg" },
  { id: 54, name: "Nasser Al Qatami", image: "https://static.qurancdn.com/images/reciters/54/nasser-al-qatami-profile.jpeg" },
  { id: 51, name: "Maher Al Muaiqly", image: "https://static.qurancdn.com/images/reciters/51/maher-al-muaiqly-profile.jpeg" },
  { id: 111, name: "Bandar Baleela", image: "https://static.qurancdn.com/images/reciters/111/bandar-baleela-profile.jpeg" },
  { id: 112, name: "Abdullah Awad al-Juhani", image: "https://static.qurancdn.com/images/reciters/112/abdullah-awad-al-juhani-profile.jpeg" },
  { id: 113, name: "Salah Al Budair", image: "https://static.qurancdn.com/images/reciters/113/salah-al-budair-profile.jpeg" },
  { id: 114, name: "Ali Jaber", image: "https://static.qurancdn.com/images/reciters/114/ali-jaber-profile.jpeg" },
  { id: 115, name: "Muhammad Ayyub", image: "https://static.qurancdn.com/images/reciters/115/muhammad-ayyub-profile.jpeg" },
  { id: 116, name: "Fares Abbad", image: "https://static.qurancdn.com/images/reciters/116/fares-abbad-profile.jpeg" },
  { id: 12, name: "Mahmoud Khalil Al-Husary (Muallim)", image: "https://static.qurancdn.com/images/reciters/12/mahmoud-khalil-al-husary-profile.jpeg" },
];
