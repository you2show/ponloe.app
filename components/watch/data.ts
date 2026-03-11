
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  channelName: string;
  channelAvatar: string;
  subscribers: string;
  views: string;
  date: string;
  youtubeId?: string; // Optional now
  url?: string; // For Facebook or other sources
  source: 'youtube' | 'facebook' | 'drive'; // Source type
  description?: string;
  likes: string;
  comments: number;
}

export const CATEGORIES = [
  { id: 'all', label: 'ទាំងអស់' },
  { id: 'lecture', label: 'ការបង្រៀន' },
  { id: 'quran', label: 'គម្ពីរគួរអាន' },
  { id: 'nasheed', label: 'អាណាស៊ីដ' },
  { id: 'history', label: 'ប្រវត្តិសាស្ត្រ' },
  { id: 'short', label: 'វីដេអូខ្លីៗ' },
];

export const VIDEO_DATA: Video[] = [
  {
    id: '8',
    title: 'Google Drive Video Test',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_Drive_logo.png/600px-Google_Drive_logo.png',
    duration: 'N/A',
    category: 'short',
    channelName: 'Shared Drive',
    channelAvatar: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png',
    subscribers: 'N/A',
    views: 'N/A',
    date: 'Just now',
    source: 'drive',
    url: 'https://drive.google.com/file/d/1fm3dwj2eEnivyQfCuCgHun9iPsT7b-68/view?usp=sharing',
    likes: '0',
    comments: 0,
    description: 'វីដេអូដែលបានចែករំលែកតាមរយៈ Google Drive។'
  },
  {
    id: '7',
    title: 'Dawah Video (Facebook Reel)',
    thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop',
    duration: '01:00',
    category: 'short',
    channelName: 'Facebook Video',
    channelAvatar: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    subscribers: 'N/A',
    views: 'N/A',
    date: 'ថ្មីៗនេះ',
    source: 'facebook',
    url: 'https://www.facebook.com/share/r/14VCtXZ6aHz/',
    likes: '100+',
    comments: 10,
    description: 'វីដេអូខ្លីពី Facebook (Reel)។'
  },
  {
    id: '1',
    title: 'Surah Al-Mulk | ការពារពីទារុណកម្មក្នុងផ្នូរ',
    thumbnail: 'https://i.ytimg.com/vi/znqY2X-M9hI/maxresdefault.jpg',
    duration: '04:30',
    category: 'quran',
    channelName: 'Mishary Alafasy',
    channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_kX4t3X4t3X4t3X4t3X4t3X4t3X4t3X4t3X=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '6M',
    views: '20M',
    date: '3 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: 'znqY2X-M9hI',
    likes: '145K',
    comments: 5200,
    description: 'ការអានស៊ូរ៉ោះ អាល់-មុល (Al-Mulk) ដ៏ពិរោះរណ្តំ ដោយសេក្ខ Mishary Rashid Alafasy ។'
  },
  {
    id: '4',
    title: 'អាណាស៊ីដ៖ Ya Nabi Salam Alayka (Maher Zain)',
    thumbnail: 'https://i.ytimg.com/vi/Vqfy4ScRXFQ/maxresdefault.jpg',
    duration: '05:37',
    category: 'nasheed',
    channelName: 'Maher Zain',
    channelAvatar: 'https://yt3.googleusercontent.com/ytc/AIdro_kX4t3X4t3X4t3X4t3X4t3X4t3X4t3X4t3X=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '15M',
    views: '400M',
    date: '10 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: 'Vqfy4ScRXFQ',
    likes: '2M',
    comments: 120000,
    description: 'បទចម្រៀងសរសើរព្យាការីដ៏ល្បីល្បាញពី Maher Zain ។'
  },
  {
    id: '3',
    title: 'អត្ថន័យនៃជីវិត (The Meaning of Life)',
    thumbnail: 'https://i.ytimg.com/vi/7d16CpWp-ok/maxresdefault.jpg',
    duration: '07:30',
    category: 'lecture',
    channelName: 'Talk Islam',
    channelAvatar: 'https://ui-avatars.com/api/?name=Talk+Islam&background=random',
    subscribers: '1M',
    views: '5M',
    date: '8 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: '7d16CpWp-ok',
    likes: '350K',
    comments: 8900,
    description: 'វីដេអូខ្លីដាស់តឿនស្មារតីអំពីគោលបំណងនៃជីវិត និងការបង្កើតរបស់អល់ឡោះ។'
  },
  {
    id: '5',
    title: 'របៀបសឡាតអោយបានត្រឹមត្រូវ (Step by Step)',
    thumbnail: 'https://i.ytimg.com/vi/kScrL8m1qMs/maxresdefault.jpg',
    duration: '12:00',
    category: 'lecture',
    channelName: 'MercifulServant',
    channelAvatar: 'https://ui-avatars.com/api/?name=Merciful&background=random',
    subscribers: '4M',
    views: '800K',
    date: '2 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: 'kScrL8m1qMs',
    likes: '25K',
    comments: 1500,
    description: 'ការណែនាំមួយជំហានម្តងៗអំពីរបៀបថ្វាយបង្គំសម្រាប់អ្នកចាប់ផ្តើមដំបូង។'
  },
  {
    id: '6',
    title: 'ស៊ូរ៉ោះ អាល់-កះហ្វី (Al-Kahf)',
    thumbnail: 'https://i.ytimg.com/vi/M21x70a3Xcw/maxresdefault.jpg',
    duration: '40:00',
    category: 'quran',
    channelName: 'Mishary Alafasy',
    channelAvatar: 'https://ui-avatars.com/api/?name=Mishary&background=random',
    subscribers: '6M',
    views: '15M',
    date: '4 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: 'M21x70a3Xcw',
    likes: '150K',
    comments: 4000,
    description: 'ការអានស៊ូរ៉ោះអាល់កះហ្វី ដោយសេក្ខ Mishary Rashid Alafasy ។'
  },
  {
    id: '2',
    title: 'ប្រវត្តិព្យាការីមូហាំម៉ាត់ (សង្ខេប)',
    thumbnail: 'https://i.ytimg.com/vi/0O6L_2959iE/maxresdefault.jpg',
    duration: '25:00',
    category: 'history',
    channelName: 'The Deen Show',
    channelAvatar: 'https://ui-avatars.com/api/?name=Deen+Show&background=random',
    subscribers: '850K',
    views: '1.2M',
    date: '5 ឆ្នាំមុន',
    source: 'youtube',
    youtubeId: '0O6L_2959iE',
    likes: '50K',
    comments: 2100,
    description: 'ជីវប្រវត្តិសង្ខេបរបស់ព្យាការីមូហាំម៉ាត់ (ﷺ) និងសារៈសំខាន់របស់លោកចំពោះមនុស្សជាតិ។'
  }
];
