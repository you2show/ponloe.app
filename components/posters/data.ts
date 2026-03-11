
export interface Poster {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  author: string;
  likes: number;
  downloads: number;
  date: string;
  dimensions?: 'portrait' | 'square' | 'landscape';
}

export const POSTER_CATEGORIES = [
  { id: 'all', label: 'ទាំងអស់' },
  { id: 'quran', label: 'អាយ៉ាត់គម្ពីរ' },
  { id: 'hadith', label: 'ហាទីស' },
  { id: 'dua', label: 'ឌូអា' },
  { id: 'quote', label: 'ពាក្យដាស់តឿន' },
  { id: 'friday', label: 'ថ្ងៃសុក្រ' },
];

export const MOCK_POSTERS: Poster[] = [
  {
    id: '1',
    title: 'ការអត់ធ្មត់គឺជាកូនសោរ',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop',
    category: 'quote',
    author: 'Ponloe Design',
    likes: 1240,
    downloads: 450,
    date: '2024-03-10',
    dimensions: 'portrait'
  },
  {
    id: '2',
    title: 'Surah Al-Ikhlas',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    category: 'quran',
    author: 'Islamic Art',
    likes: 3500,
    downloads: 1200,
    date: '2024-02-15',
    dimensions: 'square'
  },
  {
    id: '3',
    title: 'Dua for Parents',
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop',
    category: 'dua',
    author: 'Ponloe Design',
    likes: 890,
    downloads: 230,
    date: '2024-03-01',
    dimensions: 'portrait'
  },
  {
    id: '4',
    title: 'Jumuah Mubarak',
    imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=800&auto=format&fit=crop',
    category: 'friday',
    author: 'Creative Muslim',
    likes: 2100,
    downloads: 800,
    date: '2024-03-08',
    dimensions: 'landscape'
  },
  {
    id: '5',
    title: 'Hadith on Kindness',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    category: 'hadith',
    author: 'Sunnah Reminders',
    likes: 1500,
    downloads: 600,
    date: '2024-01-20',
    dimensions: 'portrait'
  },
  {
    id: '6',
    title: 'Nature & Reflection',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=800&auto=format&fit=crop',
    category: 'quote',
    author: 'Ponloe Design',
    likes: 900,
    downloads: 300,
    date: '2024-03-12',
    dimensions: 'square'
  },
  {
    id: '7',
    title: 'Ramadan Karim',
    imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?q=80&w=800&auto=format&fit=crop',
    category: 'quote',
    author: 'Islamic Art',
    likes: 5000,
    downloads: 2000,
    date: '2024-03-05',
    dimensions: 'portrait'
  }
];
