
export interface Speaker {
  id: string;
  name: string;
  avatar: string;
  role: string;
  lectureCount: number;
}

export interface Track {
  id: string;
  title: string;
  speakerId: string;
  speakerName: string;
  duration: number; // in seconds
  url: string; // Audio URL
  cover: string;
  category: string;
  date: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  trackCount: number;
  cover: string;
  gradient: string;
  tracks: Track[];
}

export const SPEAKERS: Speaker[] = [
  { id: 's1', name: 'Noman Ali Khan', role: 'Ustad', lectureCount: 15, avatar: 'https://ui-avatars.com/api/?name=Noman+Ali&background=0d9488&color=fff' },
  { id: 's2', name: 'Mishary Alafasy', role: 'Qari', lectureCount: 42, avatar: 'https://ui-avatars.com/api/?name=Mishary&background=059669&color=fff' },
  { id: 's3', name: 'Mufti Menk', role: 'Scholar', lectureCount: 28, avatar: 'https://ui-avatars.com/api/?name=Mufti+Menk&background=0891b2&color=fff' },
  { id: 's4', name: 'Omar Suleiman', role: 'Imam', lectureCount: 10, avatar: 'https://ui-avatars.com/api/?name=Omar+S&background=4f46e5&color=fff' },
  { id: 's5', name: 'Yasir Qadhi', role: 'Dr.', lectureCount: 22, avatar: 'https://ui-avatars.com/api/?name=Yasir+Q&background=be185d&color=fff' },
];

export const TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Surah Al-Mulk (The Sovereignty)',
    speakerId: 's2',
    speakerName: 'Mishary Alafasy',
    duration: 305,
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/067.mp3',
    cover: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1000&auto=format&fit=crop',
    category: 'Quran',
    date: '2023-10-01'
  },
  {
    id: 't2',
    title: 'Surah Ar-Rahman',
    speakerId: 's3',
    speakerName: 'Abdul Basit',
    duration: 1800,
    url: 'https://download.quranicaudio.com/quran/abdul_basit_murattal/055.mp3',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
    category: 'Quran',
    date: '2023-11-15'
  },
  {
    id: 't3',
    title: 'Surah Al-Fatiha',
    speakerId: 's4',
    speakerName: 'Mishary Alafasy',
    duration: 60,
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3',
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    category: 'Quran',
    date: '2023-09-20'
  },
  {
    id: 't4',
    title: 'Surah Yasin (Heart of Quran)',
    speakerId: 's2',
    speakerName: 'Mishary Alafasy',
    duration: 980,
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/036.mp3',
    cover: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f9?q=80&w=1000&auto=format&fit=crop',
    category: 'Quran',
    date: '2023-10-05'
  },
  {
    id: 't5',
    title: 'Surah Al-Ikhlas',
    speakerId: 's1',
    speakerName: 'Mishary Alafasy',
    duration: 30,
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/112.mp3', 
    cover: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    category: 'Quran',
    date: '2023-12-01'
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'គេងលក់ស្រួល (Sleep)',
    description: 'ការអានគម្ពីរ និងហ្ស៊ីកៀរដ៏ស្ងប់ស្ងាត់ ដើម្បីជួយឱ្យអ្នកគេងលក់ស្រួល។',
    trackCount: 12,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop',
    gradient: 'from-indigo-900 to-slate-900',
    tracks: [TRACKS[0], TRACKS[3], TRACKS[1], TRACKS[2]] 
  },
  {
    id: 'p2',
    title: 'រៀនគម្ពីរ (Quran Study)',
    description: 'បណ្តុំស៊ូរ៉ោះសំខាន់ៗដែលគួរចងចាំ និងសិក្សាអត្ថន័យ។',
    trackCount: 30,
    cover: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=1000&auto=format&fit=crop',
    gradient: 'from-emerald-800 to-teal-900',
    tracks: [TRACKS[0], TRACKS[3]]
  },
  {
    id: 'p3',
    title: 'កម្លាំងចិត្ត (Motivation)',
    description: 'បាឋកថាលើកទឹកចិត្តសម្រាប់ថ្ងៃដែលអ្នកត្រូវការកម្លាំង។',
    trackCount: 8,
    cover: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1000&auto=format&fit=crop',
    gradient: 'from-amber-700 to-orange-900',
    tracks: [TRACKS[1], TRACKS[2], TRACKS[4]]
  },
  {
    id: 'p4',
    title: 'ស្តាប់ពេលព្រឹក (Morning)',
    description: 'ចាប់ផ្តើមថ្ងៃថ្មីជាមួយការរំលឹកដល់អល់ឡោះ។',
    trackCount: 15,
    cover: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop',
    gradient: 'from-blue-500 to-cyan-700',
    tracks: [TRACKS[0], TRACKS[1], TRACKS[3]]
  }
];

export const CATEGORIES = ['All', 'Quran', 'Lecture', 'History', 'Motivation', 'Stories'];
