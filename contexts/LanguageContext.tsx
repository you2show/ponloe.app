import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'km' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  km: {
    // Auth
    'auth.loginTitle': 'ចូលគណនី',
    'auth.loginSubtitle': 'ដើម្បីរក្សាទុកការកំណត់ និងចំណាំរបស់អ្នក',
    'auth.telegram': 'ចូលគណនីជាមួយ Telegram',
    'auth.google': 'ចូលគណនីជាមួយ Google',
    'auth.email': 'ចូលគណនីជាមួយ Email',
    'auth.or': 'ឬ',
    'auth.emailLabel': 'អុីមែល (Email)',
    'auth.passwordLabel': 'ពាក្យសម្ងាត់ (Password)',
    'auth.loginButton': 'ចូលគណនី',
    'auth.signupButton': 'ចុះឈ្មោះ',
    'auth.noAccount': 'មិនទាន់មានគណនី? ចុះឈ្មោះនៅទីនេះ',
    'auth.hasAccount': 'មានគណនីរួចហើយ? ចូលគណនី',
    'auth.back': '',
    'auth.checkEmail': 'សូមពិនិត្យមើលអ៊ីមែលរបស់អ្នកដើម្បីបញ្ជាក់គណនី។ (Check your email to verify)',
    'auth.connectionError': 'មានបញ្ហាក្នុងការភ្ជាប់គណនី',
    'auth.googleError': 'មានបញ្ហាក្នុងការភ្ជាប់គណនី Google',
    'auth.telegramError': 'មានបញ្ហាក្នុងការភ្ជាប់គណនី Telegram',
    'auth.telegramSuccess': '✅ ការចូលគណនីទទួលបានជោគជ័យ! សូមស្វាគមន៍មកកាន់ Ponloe។',
    'auth.telegramOpen': 'បើក Telegram Bot',
    'auth.telegramDesc': 'សូមចុចប៊ូតុងខាងក្រោមដើម្បីបើក @PonloeBot រួចចុចពាក្យ START ដើម្បីទទួលបានលេខកូដ ៦ ខ្ទង់។',
    'auth.openTelegram': 'បើក Telegram',
    'auth.waitingStart': 'កំពុងរង់ចាំអ្នកចុច Start...',
    'auth.enterCode': 'បញ្ចូលលេខកូដ ៦ ខ្ទង់',
    'auth.codeSent': 'លេខកូដត្រូវបានផ្ញើទៅកាន់ Telegram របស់អ្នកហើយ។',
    'auth.verifyLogin': 'ផ្ទៀងផ្ទាត់ និងចូលគណនី',
    'auth.invalidCode': 'លេខកូដមិនត្រឹមត្រូវទេ សូមព្យាយាមម្តងទៀត',

    // General
    'app.title': 'ពន្លឺ (Ponloe)',
    'common.seeAll': 'មើលទាំងអស់',
    'common.loading': 'កំពុងដំណើរការ...',
    'common.next': 'បន្ទាប់',
    'common.countdown': '',
    'common.login': 'ចូលគណនី (Login)',
    'common.greeting': 'អាសសាឡាមុអាឡៃគុម',
    'common.guest': 'គណនីភ្ញៀវ',
    'common.back': '',
    'common.settings': 'ការកំណត់',
    'common.getLink': 'យកតំណ',
    'common.menu': 'ម៉ឺនុយ',
    
    // Navigation
    'nav.home': 'ទំព័រដើម',
    'nav.community': 'សហគមន៍',
    'nav.quran': 'គម្ពីរ',
    'nav.library': 'បណ្ណាល័យ',
    'nav.prayer': 'សឡាត',
    'nav.calendar': 'ប្រតិទិន',
    
    // Home Header
    'home.greeting': 'អាសសាឡាមុអាឡៃគុម',
    'home.loginPrompt': 'ចូលគណនី (Login)',
    
    // Smart Prayer Card
    'prayer.nextPrayer': 'ពេលសឡាតបន្ទាប់ (Next)',
    'prayer.fajr': 'ស៊ូបុហ',
    'prayer.sunrise': 'ថ្ងៃរះ',
    'prayer.dhuhr': 'ហ្ស៊ូហ៊ួរ',
    'prayer.asr': 'អាសើរ',
    'prayer.maghrib': 'ម៉ាហ្រ្កឹប',
    'prayer.isha': 'អ៊ីស្ហាក',
    'prayer.jumua': 'ជុំអះ',
    'prayer.qibla': 'ទិសដៅគីបឡាត',
    
    // Daily Inspiration
    'inspiration.title': 'ហាទីសប្រចាំថ្ងៃ',
    'inspiration.quote': '"អ្នកដែលល្អបំផុតក្នុងចំណោមពួកអ្នក គឺអ្នកដែលមានសីលធម៌ល្អបំផុតចំពោះគ្រួសាររបស់គេ។"',
    'inspiration.source': 'Hadith Tirmidhi',
    
    // Services
    'services.title': 'មុខងារ',
    'services.more': 'ផ្សេងៗ',
    'services.quran': 'គម្ពីរ',
    'services.dua': 'ឌូអា',
    'services.hadith': 'ហាទីស',
    'services.faq': 'សំនួរ',
    'services.listen': 'ស្តាប់',
    'services.watch': 'ទស្សនា',
    'services.zakat': 'ហ្សាកាត់',
    'services.tasbih': 'តេសបៀស',
    'services.halal': 'ហាឡាល់',
    'services.qibla': 'គីបឡាត',
    'services.names': 'ឈ្មោះ',
    'services.qada': 'សងសឡាត',
    'services.frames': 'ស៊ុម',
    'services.start_here': 'ចាប់ផ្តើម',
    'services.wudu': 'របៀបយកវូហ្ទុ',
    'services.basic_knowledge': 'មូលដ្ឋានគ្រឹះ',
    'services.allFeatures': 'មុខងារទាំងអស់',
    
    // Discover
    'discover.title': 'ពិសេសសម្រាប់អ្នក',
    'discover.listen.title': 'ស្តាប់ការអានគម្ពីរ និងធម៌រំលឹក',
    'discover.watch.title': 'ទស្សនាវីដេអូអប់រំ និងចំនេះដឹង',
    'discover.faq.title': 'ចម្ងល់និងចម្លើយអំពីសាសនា',
    
    // Religious Events
    'events.title': 'ព្រឹត្តិការណ៍សាសនា',
    'events.ramadan': 'ចូលខែរ៉ម៉ាឌន',
    'events.daysLeft': 'សល់ ១៤ ថ្ងៃទៀត',

    // Profile
    'profile.title': 'គណនី',
    'profile.myPost': 'ការបង្ហោះ',
    'profile.myQuran': 'គម្ពីរគូរអាន',
    'profile.myLibrary': 'បណ្ណាល័យ',
    'profile.settings': 'ការកំណត់',
    'profile.saved': 'រក្សាទុក',
    'profile.recent': 'បន្តការអាន',
    'profile.notes': 'កំណត់ហេតុ',
    'profile.noSaved': 'មិនទាន់មានទិន្នន័យរក្សាទុកទេ',
    'profile.noRecent': 'មិនទាន់មានប្រវត្តិអានទេ',
    'profile.noNotes': 'មិនទាន់មានកំណត់ហេតុទេ',
    'profile.noPosts': 'មិនទាន់មានការបង្ហោះទេ',
    'profile.noLibrary': 'មិនទាន់មានសៀវភៅរក្សាទុកទេ',
    'profile.accountSettings': 'ការកំណត់គណនី',
    'profile.editProfile': 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន',
    'profile.notifications': 'ការជូនដំណឹង',
    'profile.others': 'ផ្សេងៗ',
    'profile.privacySecurity': 'ឯកជនភាព និងសុវត្ថិភាព',
    'profile.helpSupport': 'ជំនួយ និងការគាំទ្រ',
    'profile.logout': 'ចាកចេញពីគណនី',
    'profile.login': 'ចូលគណនី',
    'profile.edit': 'កែប្រែ',
    'profile.guestUser': 'គណនីភ្ញៀវ',
    'profile.user': 'អ្នកប្រើប្រាស់',
    'profile.language': 'ភាសា',
    'profile.khmer': 'ខ្មែរ',
    'profile.english': 'English',
    'profile.viewCover': 'មើលរូបគម្រប',
    'profile.changeCover': 'ប្ដូររូបគម្រប',
    'profile.followers': 'អ្នកតាមដាន',
    'profile.following': 'កំពុងតាមដាន',
    'profile.articles': 'អត្ថបទ',
    'profile.videos': 'វីដេអូ',
    'profile.books': 'សៀវភៅ',
    'profile.audio': 'សំឡេង',
    
    // Telegram Modal
    'telegram.title': 'គណនី Telegram',
    'telegram.desc1': 'អ្នកបានចូលប្រើប្រាស់កម្មវិធីនេះតាមរយៈគណនី Telegram របស់អ្នក។',
    'telegram.desc2': 'ដើម្បីរក្សាសុវត្ថិភាព និងឯកជនភាពរបស់អ្នក យើងបានលាក់អុីមែល (Email) របស់អ្នកមិនឱ្យបង្ហាញជាសាធារណៈឡើយ។',
    'telegram.info': 'មានតែអ្នកប៉ុណ្ណោះដែលអាចមើលឃើញព័ត៌មាននេះនៅលើ Profile ផ្ទាល់ខ្លួនរបស់អ្នក។',
    'telegram.ok': 'យល់ព្រម',
    
    // Quran Reading
    'quran.readFullSurah': 'អានជំពូកពេញ',
    'quran.continueReading': 'បន្តការអាន',
    'quran.ayah': 'អាយ៉ាត់',
  },
  en: {
    // Auth
    'auth.loginTitle': 'Log In',
    'auth.loginSubtitle': 'To save your settings and bookmarks',
    'auth.telegram': 'Log in with Telegram',
    'auth.google': 'Log in with Google',
    'auth.email': 'Log in with Email',
    'auth.or': 'OR',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Password',
    'auth.loginButton': 'Log In',
    'auth.signupButton': 'Sign Up',
    'auth.noAccount': 'No account yet? Sign up here',
    'auth.hasAccount': 'Already have an account? Log in',
    'auth.back': '',
    'auth.checkEmail': 'Please check your email to verify your account.',
    'auth.connectionError': 'Error connecting account',
    'auth.googleError': 'Error connecting Google account',
    'auth.telegramError': 'Error connecting Telegram account',
    'auth.telegramSuccess': '✅ Login successful! Welcome to Ponloe.',
    'auth.telegramOpen': 'Open Telegram Bot',
    'auth.telegramDesc': 'Click the button below to open @PonloeBot and press START to get your 6-digit code.',
    'auth.openTelegram': 'Open Telegram',
    'auth.waitingStart': 'Waiting for you to press Start...',
    'auth.enterCode': 'Enter 6-digit Code',
    'auth.codeSent': 'The code has been sent to your Telegram.',
    'auth.verifyLogin': 'Verify & Login',
    'auth.invalidCode': 'Invalid code, please try again',

    // General
    'app.title': 'Ponloe',
    'common.seeAll': 'See All',
    'common.loading': 'Loading...',
    'common.next': 'Next',
    'common.countdown': 'Countdown',
    'common.login': 'Log In',
    'common.greeting': 'Assalamu Alaykum',
    'common.guest': 'Guest',
    'common.back': '',
    'common.settings': 'Settings',
    'common.getLink': 'Get Link',
    'common.menu': 'Menu',
    
    // Navigation
    'nav.home': 'Home',
    'nav.community': 'Community',
    'nav.quran': 'Quran',
    'nav.library': 'Library',
    'nav.prayer': 'Prayer',
    'nav.calendar': 'Calendar',
    
    // Home Header
    'home.greeting': 'Assalamu Alaykum',
    'home.loginPrompt': 'Log In',
    
    // Smart Prayer Card
    'prayer.nextPrayer': 'Next Prayer',
    'prayer.fajr': 'Fajr',
    'prayer.sunrise': 'Sunrise',
    'prayer.dhuhr': 'Dhuhr',
    'prayer.asr': 'Asr',
    'prayer.maghrib': 'Maghrib',
    'prayer.isha': 'Isha',
    'prayer.jumua': 'Jumu\'ah',
    'prayer.qibla': 'Qibla Direction',
    
    // Daily Inspiration
    'inspiration.title': 'Daily Hadith',
    'inspiration.quote': '"The best of you is the one who is best to his family."',
    'inspiration.source': 'Hadith Tirmidhi',
    
    // Services
    'services.title': 'Services',
    'services.more': 'More',
    'services.quran': 'Quran',
    'services.dua': 'Dua',
    'services.hadith': 'Hadith',
    'services.faq': 'Q&A',
    'services.listen': 'Listen',
    'services.watch': 'Watch',
    'services.zakat': 'Zakat',
    'services.tasbih': 'Tasbih',
    'services.halal': 'Halal',
    'services.qibla': 'Qibla',
    'services.names': 'Names',
    'services.qada': 'Qada',
    'services.frames': 'Frames',
    'services.start_here': 'Start Here',
    'services.wudu': 'Wudu',
    'services.basic_knowledge': 'Basics',
    'services.allFeatures': 'All Features',
    
    // Discover
    'discover.title': 'For You',
    'discover.listen.title': 'Listen to Quran & Reminders',
    'discover.watch.title': 'Watch Educational Videos',
    'discover.faq.title': 'Questions & Answers',
    
    // Religious Events
    'events.title': 'Religious Events',
    'events.ramadan': 'Ramadan Starts',
    'events.daysLeft': '14 Days Left',

    // Profile
    'profile.title': 'Profile',
    'profile.myPost': 'My Posts',
    'profile.myQuran': 'My Quran',
    'profile.myLibrary': 'My Library',
    'profile.settings': 'Settings',
    'profile.saved': 'Saved',
    'profile.recent': 'Recent',
    'profile.notes': 'Notes',
    'profile.noSaved': 'No saved data yet',
    'profile.noRecent': 'No reading history yet',
    'profile.noNotes': 'No notes yet',
    'profile.noPosts': 'No posts yet',
    'profile.noLibrary': 'No saved books yet',
    'profile.accountSettings': 'Account Settings',
    'profile.editProfile': 'Edit Profile',
    'profile.notifications': 'Notifications',
    'profile.others': 'Others',
    'profile.privacySecurity': 'Privacy & Security',
    'profile.helpSupport': 'Help & Support',
    'profile.logout': 'Log Out',
    'profile.login': 'Log In',
    'profile.edit': 'Edit',
    'profile.guestUser': 'Guest User',
    'profile.user': 'User',
    'profile.language': 'Language',
    'profile.khmer': 'ខ្មែរ',
    'profile.english': 'English',
    'profile.viewCover': 'View Cover',
    'profile.changeCover': 'Change Cover',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.articles': 'Articles',
    'profile.videos': 'Videos',
    'profile.books': 'Books',
    'profile.audio': 'Audio',
    
    // Telegram Modal
    'telegram.title': 'Telegram Account',
    'telegram.desc1': 'You have logged in using your Telegram account.',
    'telegram.desc2': 'To protect your privacy and security, we have hidden your email from public view.',
    'telegram.info': 'Only you can see this information on your own profile.',
    'telegram.ok': 'OK',
    
    // Quran Reading
    'quran.readFullSurah': 'Read full surah',
    'quran.continueReading': 'Continue reading',
    'quran.ayah': 'Ayah',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('km');

  useEffect(() => {
    const savedLang = localStorage.getItem('ponloe_language') as Language;
    if (savedLang && (savedLang === 'km' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ponloe_language', lang);
  };

  const t = (key: string): string => {
    // @ts-ignore
    if (translations[language] && translations[language][key]) {
      // @ts-ignore
      return translations[language][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
