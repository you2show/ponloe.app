
export interface Uploader {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isVerified: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
  likes: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverUrl: string;
  type: 'PDF' | 'TEXT';
  content?: string; // HTML content for TEXT type
  pdfUrl?: string; // URL for PDF type
  uploader: Uploader;
  likes: number;
  views: number;
  comments: Comment[];
  publishedDate: string;
  // New fields
  pages: number;
  fileSize: string;
  rating: number; // 0-5
  ratingCount: number;
}

export const LIBRARY_CATEGORIES = [
  { id: 'all', label: 'ទាំងអស់' },
  { id: 'aqidah', label: 'ជំនឿ (Aqidah)' },
  { id: 'fiqh', label: 'ច្បាប់ (Fiqh)' },
  { id: 'history', label: 'ប្រវត្តិសាស្ត្រ' },
  { id: 'ethics', label: 'សីលធម៌' },
];

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'មូលដ្ឋានគ្រឹះនៃសាសនាឥស្លាម',
    author: 'សមាគមអភិវឌ្ឍន៍ឥស្លាម',
    description: 'សៀវភៅនេះពន្យល់អំពីគោលការណ៍គ្រឹះនៃសាសនាឥស្លាម រួមមានសសរស្តម្ភទាំង ៥ និងជំនឿទាំង ៦ ប្រការ សម្រាប់អ្នកចាប់ផ្តើមសិក្សា។',
    category: 'aqidah',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    type: 'TEXT',
    content: `
      <h3>សេចក្តីផ្តើម</h3>
      <p>សាសនាឥស្លាម គឺជាសាសនាដែលអល់ឡោះបានប្រទានមកសម្រាប់មនុស្សជាតិទាំងមូល។ វាត្រូវបានកសាងឡើងលើសសរស្តម្ភចំនួន ៥ យ៉ាងសំខាន់។</p>
      <h3>សសរស្តម្ភទី ១៖ ស្សាហាទ៉ះ</h3>
      <p>គឺការប្រកាសសក្ខីកម្មថា គ្មានព្រះជាម្ចាស់ណាផ្សេងក្រៅពីអល់ឡោះ និងមូហាំម៉ាត់ជាអ្នកនាំសាររបស់ទ្រង់។ នេះគឺជាកូនសោរសម្រាប់ចូលទៅក្នុងសាសនាឥស្លាម។</p>
      <h3>សសរស្តម្ភទី ២៖ សឡាត</h3>
      <p>ការថ្វាយបង្គំ ៥ ដងក្នុងមួយថ្ងៃ គឺជាកាតព្វកិច្ចដែលមិនអាចខ្វះបាន។ វាជាទំនាក់ទំនងផ្ទាល់រវាងអ្នកបម្រើ និងអ្នកបង្កើត។</p>
    `,
    uploader: {
      id: 'u1',
      name: 'Ustaz Musa',
      avatar: 'https://ui-avatars.com/api/?name=Musa&background=0d9488&color=fff',
      role: 'Scholar',
      isVerified: true
    },
    likes: 124,
    views: 1500,
    publishedDate: '12 តុលា 2023',
    comments: [
      { id: 'c1', user: 'Ali', avatar: 'https://ui-avatars.com/api/?name=Ali', text: 'សៀវភៅល្អណាស់ ងាយយល់!', date: '2 ម៉ោងមុន', likes: 5 },
      { id: 'c2', user: 'Fatima', avatar: 'https://ui-avatars.com/api/?name=Fatima', text: 'សូមអល់ឡោះប្រទានរង្វាន់ដល់លោកគ្រូ។', date: '5 ម៉ោងមុន', likes: 12 }
    ],
    pages: 45,
    fileSize: '1.2 MB',
    rating: 4.8,
    ratingCount: 56
  },
  {
    id: '2',
    title: 'ប្រវត្តិព្យាការីមូហាំម៉ាត់ (ស.អ)',
    author: 'Sheikh Safiur Rahman',
    description: 'ជីវប្រវត្តិដ៏លម្អិតរបស់ព្យាការីមូហាំម៉ាត់ (The Sealed Nectar) ចាប់តាំងពីមុនការប្រសូត រហូតដល់មរណភាព។',
    category: 'history',
    coverUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop',
    type: 'PDF',
    pdfUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf', // Valid PDF link
    uploader: {
      id: 'u2',
      name: 'Ponloe Official',
      avatar: 'https://ui-avatars.com/api/?name=Ponloe&background=059669&color=fff',
      role: 'Admin',
      isVerified: true
    },
    likes: 856,
    views: 5200,
    publishedDate: '01 មករា 2024',
    comments: [],
    pages: 520,
    fileSize: '15.4 MB',
    rating: 5.0,
    ratingCount: 120
  },
  {
    id: '3',
    title: 'វិធីសាស្ត្រសឡាតត្រឹមត្រូវ',
    author: 'Imam Al-Bukhari (Extracts)',
    description: 'ការណែនាំអំពីរបៀបថ្វាយបង្គំឲ្យបានត្រឹមត្រូវតាមស៊ុនណាស់របស់ព្យាការី មួយជំហានម្តងៗ។',
    category: 'fiqh',
    coverUrl: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f9?q=80&w=800&auto=format&fit=crop',
    type: 'TEXT',
    content: `
      <h3>ការត្រៀមខ្លួន (វូឌុ)</h3>
      <p>មុនពេលសឡាត យើងត្រូវធានាថាមានភាពស្អាតស្អំ (តាហារ៉ះ)។ ការយកទឹកវូឌុត្រូវធ្វើឡើងដោយមាននីយ៉ាត់ត្រឹមត្រូវ។</p>
      <h3>ការឈរ (Qiyam)</h3>
      <p>ឈរត្រង់បែរទៅរកគីបឡាត់។ លើកដៃទាំងពីរស្មើស្មា ហើយពោលថា "Allahu Akbar"។</p>
      <h3>ការអាន (Recitation)</h3>
      <p>ដាក់ដៃស្តាំលើដៃឆ្វេងនៅលើទ្រូង។ អានស៊ូរ៉ោះអាល់ហ្វាទីហះ។</p>
    `,
    uploader: {
      id: 'u1',
      name: 'Ustaz Musa',
      avatar: 'https://ui-avatars.com/api/?name=Musa&background=0d9488&color=fff',
      role: 'Scholar',
      isVerified: true
    },
    likes: 340,
    views: 2100,
    publishedDate: '15 កុម្ភៈ 2024',
    comments: [],
    pages: 18,
    fileSize: '0.8 MB',
    rating: 4.9,
    ratingCount: 85
  }
];
