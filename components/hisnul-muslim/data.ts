import { HugeiconsIcon } from '@hugeicons/react';
import { Activity01Icon, BankIcon, Car01Icon, Coffee01Icon, FavouriteIcon, HappyIcon, Home01Icon, Layers01Icon, Moon01Icon, RainIcon, Sun01Icon, ThumbsUpIcon } from '@hugeicons/core-free-icons';




export interface Category {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  icon: any;
  color: string;
}

export interface Chapter {
  id: string;
  number: number;
  titleKhmer: string;
  titleEnglish: string;
  categoryIds: string[]; // Array of category IDs this chapter belongs to
  duas: Dua[];
}

export interface Dua {
  id: string;
  number: number; // Global number e.g. 1 to 267
  arabic: string;
  translation: string;
  reference: string;
  audioSrc?: string;
  note?: string;
}

// Helper to convert number to Khmer digits
export const toKhmerNum = (num: number): string => {
  const khmerNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().split('').map(d => khmerNums[parseInt(d)]).join('');
};

export const HISNUL_CATEGORIES: Category[] = [
  { id: 'all', titleKhmer: 'ទាំងអស់', titleEnglish: 'All Chapters', icon: Layers01Icon, color: 'bg-slate-100 text-slate-600' },
  { id: 'morning_evening', titleKhmer: 'ព្រឹក និងល្ងាច', titleEnglish: 'Morning & Evening', icon: Sun01Icon, color: 'bg-orange-100 text-orange-600' },
  { id: 'prayer', titleKhmer: 'សឡាត', titleEnglish: 'Prayer', icon: Moon01Icon, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'praising', titleKhmer: 'ការតេះស្ពេស', titleEnglish: 'Praising Allah', icon: FavouriteIcon, color: 'bg-pink-100 text-pink-600' },
  { id: 'hajj', titleKhmer: 'ហាជ្ជី និងអុំរ៉ោះ', titleEnglish: 'Hajj & Umrah', icon: BankIcon, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'travel', titleKhmer: 'ការធ្វើដំណើរ', titleEnglish: 'Travel', icon: Car01Icon, color: 'bg-blue-100 text-blue-600' },
  { id: 'joy_distress', titleKhmer: 'រីករាយ និងទុក្ខព្រួយ', titleEnglish: 'Joy & Distress', icon: HappyIcon, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'nature', titleKhmer: 'ធម្មជាតិ', titleEnglish: 'Nature', icon: RainIcon, color: 'bg-teal-100 text-teal-600' },
  { id: 'gratitude', titleKhmer: 'ការដឹងគុណ', titleEnglish: 'Good Etiquette', icon: ThumbsUpIcon, color: 'bg-purple-100 text-purple-600' },
  { id: 'family', titleKhmer: 'គ្រួសារ', titleEnglish: 'Family', icon: Home01Icon, color: 'bg-rose-100 text-rose-600' },
  { id: 'food', titleKhmer: 'ហូប និងផឹក', titleEnglish: 'Food & Drink', icon: Coffee01Icon, color: 'bg-amber-100 text-amber-600' },
  { id: 'sickness', titleKhmer: 'ឈឺ និងស្លាប់', titleEnglish: 'Sickness & Death', icon: Activity01Icon, color: 'bg-red-100 text-red-600' },
];

export const HISNUL_CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    number: 1,
    titleKhmer: 'សូត្រពេលភ្ញាក់ពីដំណេក',
    titleEnglish: 'Waking Up',
    categoryIds: ['all', 'morning_evening'],
    duas: [
      {
        id: '1',
        number: 1,
        arabic: 'الْـحَمْدُ للَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا ، وَإِلَيْهِ النُّشُورُ',
        translation: 'ការសរសើរទាំងឡាយ ចំពោះអល់ឡោះជាម្ចាស់ ដែល បានផ្ដល់ឲ្យយើង នូវជីវិតរស់រានឡើងវិញ ក្រោយពីការដក យកវា (ជីវិតនៅពេលដេកលក់) ពីយើង ហើយអ្វីៗ នឹងវិលទៅ រកទ្រង់វិញ ។',
        reference: 'البخاري مع الفتح، 11/ 113، برقم 6314، ومسلم، 4/ 2083، برقم 2711',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1dmNJUdwyhnBAXGVr2cenxZTWUynTS6MG'
      },
      {
        id: '2',
        number: 2,
        arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ ، لهُ الْمُلْكُ وَلَهُ الـحَمْدُ ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ، سُبْحَانَ اللَّهِ ، وَالـحَمْدُ للَّهِ ، وَلاَ إِلَهَ إِلاَّ اللَّهُ ، وَاللَّهُ أَكبَرُ ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ ، رَبِّ اغْفرْ لِي',
        translation: 'គ្មានទេម្ចាស់ផ្សេង ដែលត្រូវគេគោរព យ៉ាងពិតប្រាកដ គឺមានតែអល់ឡោះមួយគត់ ដោយគ្មានស្ហ៊ីរិកនឹងទ្រង់ឡើយ។ គឺការគ្រប់គ្រង និងការសរសើរទាំងឡាយសម្រាប់អល់ឡោះ។ អល់ឡោះ ជាម្ចាស់ខ្លាំងពូកែ លើសអ្វីៗទាំងអស់ ។  សេចក្ដី ស្អាតស្អំ និងការកោតសរសើរ គឺសម្រាប់អល់ឡោះ ហើយ គ្មានទេម្ចាស់ផ្សេង ដែលត្រូវគេគោរពដ៏ពិតនោះ គឺ មានតែ អល់ឡោះ។ អល់ឡោះដ៏មហាធំធេង ហើយគ្មានកំលាំងពលំ និងអំណាចអ្វីមួយ ដែលពូកែ គឺមានតែអល់ឡោះមួយគត់ ដ៏មហាខ្ពង់ខ្ពស់ និងមហាធំ។ ឱម្ចាស់របស់ខ្ញុំ! សូមទ្រង់ប្រណី ទោស ដល់រូបខ្ញុំផងចុះ។',
        reference: 'البخاري مع الفتح، 3/ 39، برقم 1154، وغيره، واللفظ لابن ماجه، انظر: صحيح ابن ماجه، 2/ 335',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1dkIv78n25T2K_iW7FtinOwPNkBI-BvTG'
      },
      {
        id: '3',
        number: 3,
        arabic: 'الْـحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِـي، وَأَذِنَ لِـي بِذِكْرِهِ',
        translation: 'ការសរសើរទាំងឡាយ គឺចំពោះ អល់ឡោះ ជាម្ចាស់ ដែលបានផ្ដល់ឲ្យខ្ញុំ នូវសុខភាពល្អ និងឲ្យមកខ្ញុំវិញនូវជីវិត។ បានអនុញ្ញាតឲ្យរូបខ្ញុំ នូវការនឹកគិតចំពោះទ្រង់ ។',
        reference: 'الترمذي، 5/ 473، برقم 3401، وانظر: صحيح الترمذي، 3/ 144',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1dmNJUdwyhnBAXGVr2cenxZTWUynTS6MG'
      },
      {
        id: '4',
        number: 4,
        arabic: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ ... (الآيات)',
        translation: '(អាយ៉ាត់ពីស៊ូរ៉ោះ អាល-អ៊ីមរ៉ន ១៩០-២០០) ...ឱម្ចាស់របស់ពួកយើងទាំងអស់គ្នា! ទ្រង់ពិតជាមិនបង្កើតរបស់ទាំងនេះ ដោយគ្មានប្រយោជន៍អ្វី នោះឡើយ...',
        reference: 'البخاري مع الفتح، 8/ 337، برقم 4569، ومسلم، 1/ 530، برقم 256',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1dp3cJB7m5QwsAuhEblL9VsV3OUqzqcoR'
      }
    ]
  },
  {
    id: 'ch2',
    number: 2,
    titleKhmer: 'ការសូត្រនៅពេលស្លៀកពាក់',
    titleEnglish: 'Wearing Clothes',
    categoryIds: ['all', 'morning_evening', 'gratitude'],
    duas: [
      {
        id: '5',
        number: 5,
        arabic: 'الْـحَمْدُ للَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّة',
        translation: 'ការសរសើរទាំងឡាយសម្រាប់អល់ឡោះ ជាម្ចាស់ ដែល បានផ្ដល់សំលៀកបំពាក់ឲ្យរូបខ្ញុំ និងការផ្ដល់វានេះឲ្យមកខ្ញុំ ដោយរូបខ្ញុំគ្មានកំលាំង ឬអំណាចអ្វីឡើយ ។',
        reference: 'أبو داود، برقم 4023',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1drQxpNKQsWR2TDeHESltp33U2GmdYZ32'
      }
    ]
  },
  {
    id: 'ch3',
    number: 3,
    titleKhmer: 'ការសូត្រនៅពេលស្លៀកពាក់ថ្មី',
    titleEnglish: 'Wearing New Clothes',
    categoryIds: ['all', 'gratitude'],
    duas: [
      {
        id: '6',
        number: 6,
        arabic: 'اللَّهُمَّ لَكَ الْـحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! ការសរសើរទាំងឡាយ គឺសម្រាប់ ទ្រង់។ ទ្រង់បានផ្ដល់សំលៀកបំពាក់នេះឲ្យខ្ញុំ។ ដោយសារ សំលៀកបំពាក់នេះ ខ្ញុំសុំពីទ្រង់នូវផលល្អ និងផលល្អពីអ្វី ដែលទ្រង់បានបង្កើតវាមក ហើយខ្ញុំសុំពីទ្រង់ បញ្ចៀសខ្ញុំ ពីប្រការអាក្រក់ដោយសារវា និងប្រការអាក្រក់ពីអ្វី ដែលទ្រង់ បានបង្កើតវាមក។',
        reference: 'أبو داود، 4/ 41، برقم 4020',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1dtem2CMEDY7YcBdQ9fzHfPcgrHTG8kB3'
      }
    ]
  },
  {
    id: 'ch4',
    number: 4,
    titleKhmer: 'ការហ្ទូអាចំពោះនរណាម្នាក់ដែលស្លៀកពាក់ថ្មី',
    titleEnglish: 'For Someone Wearing New Clothes',
    categoryIds: ['all', 'family', 'gratitude'],
    duas: [
      {
        id: '7',
        number: 7,
        arabic: 'تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالى',
        translation: 'សូមអល់ឡោះ ផ្ដល់ឲ្យអ្នក បានពាក់វា រហូតដល់ខូច ហើយសូមអល់ឡោះប្ដូរនឹងរបស់មួយផ្សេងទៀត ។',
        reference: 'أبو داود، 4/ 41، برقم 4020',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1e3cl6d-x8erptacimJqQ2A1IVZh1e0FI'
      },
      {
        id: '8',
        number: 8,
        arabic: 'اِلْبَسْ جَدِيداً وَعِشْ حَمِيداً وَمُتْ شَهِيداً',
        translation: 'សូមបានពាក់របស់ថ្មី និងសូមបានរស់ដោយសុខសាន្ដ ហើយសូមបានស្លាប់ ក្នុងនាមជាស្ហាហ៊ីដ (អ្នកធ្វើជាសាក្សី)។',
        reference: 'ابن ماجه، 2/ 1178، برقم 3558',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1e7N3-5zyQt5vQ4Tq1WYqqTA-adj4JQkr'
      }
    ]
  },
  {
    id: 'ch5',
    number: 5,
    titleKhmer: 'ការសូត្រនៅពេលដោះសំលៀកបំពាក់',
    titleEnglish: 'Undressing',
    categoryIds: ['all', 'morning_evening'],
    duas: [
      {
        id: '9',
        number: 9,
        arabic: 'بِسْمِ اللهِ',
        translation: 'ដោយនាម របស់អល់ឡោះ ។',
        reference: 'الترمذي، 2/ 505، برقم 606',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1e8GA5wMqvedsoPZHYKeqsUbMUyQUgfQk'
      }
    ]
  },
  {
    id: 'ch6',
    number: 6,
    titleKhmer: 'សូត្រមុនពេលចូលបន្ទប់ទឹក',
    titleEnglish: 'Entering the Toilet',
    categoryIds: ['all'],
    duas: [
      {
        id: '10',
        number: 10,
        arabic: '[ بِسْـمِ اللَّهِ ] ، اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْـخُبْثِ وَالْـخَبائِثِ',
        translation: 'ដោយនាមរបស់អល់ឡោះ។ ឱអល់ឡោះជាម្ចាស់! ខ្ញុំសុំពី ទ្រង់បញ្ចៀសរូបខ្ញុំ ពីអំពើអាក្រក់នៃបណ្ដា ស្ហៃតនប្រុស និង ស្ហៃតនស្រី ។',
        reference: 'البخاري، 1/ 45، برقم 142، ومسلم، 1/ 283، برقم 375',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eBW2jRfWoi2Zi2SMCsp-1hOM5K1vrTwg'
      }
    ]
  },
  {
    id: 'ch7',
    number: 7,
    titleKhmer: 'សូត្រពេលចេញពីបន្ទប់ទឹក',
    titleEnglish: 'Leaving the Toilet',
    categoryIds: ['all'],
    duas: [
      {
        id: '11',
        number: 11,
        arabic: 'غُفْرَانَكَ',
        translation: 'ខ្ញុំសុំពីទ្រង់ (អល់ឡោះ) នូវការ សណ្តោសប្រណី។',
        reference: 'أبو داود، برقم 30، والترمذي، برقم 7',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eCEGq-pYzi9ggFMnHdOPa155PwTvCkoH'
      }
    ]
  },
  {
    id: 'ch8',
    number: 8,
    titleKhmer: 'សូត្រពេលមុនយកវូហ្ទុ',
    titleEnglish: 'Before Wudu',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '12',
        number: 12,
        arabic: 'بِسْمِ اللهِ',
        translation: 'ដោយនាម របស់អល់ឡោះ',
        reference: 'أبو داود، برقم 101',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eKXqQO8gcGhQDhSTtidsIRPge9Kj1_Nj'
      }
    ]
  },
  {
    id: 'ch9',
    number: 9,
    titleKhmer: 'សូត្រក្រោយពេលបញ្ចប់ការយកវូហ្ទុ',
    titleEnglish: 'After Wudu',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '13',
        number: 13,
        arabic: 'أَشْهَدُ أَنْ لاَ إِلٰهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّداً عَبْدُهُ وَرَسُولُهُ',
        translation: 'ខ្ញុំសូមធ្វើសាក្សីថា គ្មានទេម្ចាស់ផ្សេង ដែលត្រូវគោរពយ៉ាង ពិតប្រាកដ គឺមានតែអល់ឡោះមួយគត់ ដោយគ្មានស្ហ៊ីរិក ជា មួយទ្រង់ឡើយ ហើយខ្ញុំសូមធ្វើសាក្សីទៀតថា ប្រាកដណាស់ មូហាំម៉ាត់ ជាបម្រើរបស់អល់ឡោះ និងជារ៉សូលរបស់ ទ្រង់ ផងដែរ ។',
        reference: 'مسلم، 1/ 209، برقم 234',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eQvHCiI-IAnRDJT1i2bh3s3Eo0Id3BmI'
      },
      {
        id: '14',
        number: 14,
        arabic: 'اللَّهُمَّ اجْـعَـلْنِي مِنَ التَّـوَّابِيـنَ وَاجْعَـلْنِي مِنَ الْمُتَـطَـهّـِرِيـنَ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមបញ្ចូលរូបខ្ញុំ ក្នុងចំណោមអ្នកដែល ទទូចសុំការអភ័យទោស ចំពោះកំហុសកន្លងមក និងសូម បញ្ចូលរូបខ្ញុំ ក្នុងចំណោមអ្នកដែលស្អាតស្អំផងចុះ ។',
        reference: 'الترمذي، 1/ 78، برقم 55',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eRzV6pYiDA7YvYijhutyPH5K3ewKjmgk'
      },
      {
        id: '15',
        number: 15,
        arabic: 'سُبْحانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتوبُ إِلَيْكَ',
        translation: 'អល់ឡោះដ៏មហាស្អាតស្អំ និងដោយការសរសើរចំពោះទ្រង់ ខ្ញុំសូមធ្វើសាក្សីថា គ្មានទេម្ចាស់ផ្សេង ដែលត្រូវបានគេគោរព យ៉ាងពិតប្រាកដ គឺមានតែទ្រង់។ ខ្ញុំសូមអភ័យទោសពីទ្រង់។ ខ្ញុំសូមសារភាពកំហុសចំពោះទ្រង់ ។',
        reference: 'النسائي في عمل اليوم والليلة، ص173',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1ed8pJWKpYp9tx0_topunyV11UFS4OZIM'
      }
    ]
  },
  {
    id: 'ch10',
    number: 10,
    titleKhmer: 'សូត្រពេលចាកចេញពីលំនៅដ្ឋាន',
    titleEnglish: 'Leaving Home',
    categoryIds: ['all', 'home', 'travel'],
    duas: [
      {
        id: '16',
        number: 16,
        arabic: 'بِسْمِ اللَّهِ ، تَوَكَّلْتُ عَلى اللَّهِ ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلاَّ بِاللَّهِ',
        translation: 'ដោយនាមរបស់អល់ឡោះ រូបខ្ញុំសូមប្រគល់ខ្លួនចំពោះទ្រង់។ គ្មានអំណាចឬឥទ្ធិពលអ្វីមួយឡើយ គឺមានតែអល់ឡោះ។',
        reference: 'أبو داود، 4/ 325، برقم 5095',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1eiYJVsHejvRktjGfo2_XpM2U9-otVGif'
      },
      {
        id: '17',
        number: 17,
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ، أَوْ أُضَلَّ، أَوْ أَزِلَّ، أَوْ أُزَلَّ، أَوْ أَظْلِمَ، أَوْ أُظْلَمَ، أَوْ أَجْهَلَ، أَوْ يُجْهَلَ عَلَيَّ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមទ្រង់បញ្ចៀសកុំឲ្យរូបខ្ញុំវង្វេង ឬក៏ ត្រូវគេធ្វើឲ្យវង្វេង។ សូមកុំឲ្យរូបខ្ញុំជ្រុលច្រឡំលើផ្លូវខុស ឬត្រូវ គេធ្វើឲ្យជ្រុលច្រឡំលើផ្លូវខុស។ សូមកុំឲ្យរូបខ្ញុំ ធ្វើនូវអំពើ អយុត្ដិធម៌ ឬក៏ត្រូវគេធ្វើអំពើអយុត្ដិធម៌មកលើ និងសូមកុំឲ្យ រូបខ្ញុំប្រព្រឹត្ដអំពើល្ងង់ខ្លៅ ឬក៏ត្រូវគេធ្វើ ប្រការល្ងង់ខ្លៅមកលើ ឲ្យសោះ ។',
        reference: 'أبو داود، برقم 5094',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1evjnyBFWPeyRW7wmXEjml9C_rylMry4J'
      }
    ]
  },
  {
    id: 'ch11',
    number: 11,
    titleKhmer: 'សូត្រនៅពេលចូលលំនៅដ្ឋាន',
    titleEnglish: 'Entering Home',
    categoryIds: ['all', 'home'],
    duas: [
      {
        id: '18',
        number: 18,
        arabic: 'بِسْمِ اللَّهِ وَلَـجْنَا ، وَبِسْمِ اللَّهِ خَرَجْنَا ، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
        translation: 'ដោយនាមរបស់អល់ឡោះ យើងបានចូល (ផ្ទះ) ហើយដោយ នាមរបស់អល់ឡោះផងដែរ យើងបានចេញ និងលើម្ចាស់ យើងខ្ញុំ (អល់ឡោះ) ដែលយើងខ្ញុំសូមប្រគល់ខ្លួន។',
        reference: 'أبو داود، 4/ 325، برقم 5096',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1ezYMf9I5Nc6oVpRfLywmv0dovEWWCPkU'
      }
    ]
  },
  {
    id: 'ch12',
    number: 12,
    titleKhmer: 'សូត្រពេលធ្វើដំណើរទៅម៉ាស្ជិត',
    titleEnglish: 'Going to Mosque',
    categoryIds: ['all', 'prayer', 'travel'],
    duas: [
      {
        id: '19',
        number: 19,
        arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُوراً، وَفِي لِسَانِي نُوراً، وَفِي سَمْعِي نُوراً، وَفِي بَصَرِي نُوراً...',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមឲ្យមានរស្មីក្នុងចិត្ដរបស់ខ្ញុំ រស្មីក្នុង អណ្ដាតរបស់ខ្ញុំ រស្មីក្នុងត្រចៀករបស់ខ្ញុំ រស្មីក្នុងភ្នែករបស់ខ្ញុំ រស្មីខាងលើខ្ញុំ រស្មីខាងក្រោមខ្ញុំ រស្មីខាងស្តាំខ្ញុំ រស្មីខាងឆ្វេងខ្ញុំ រស្មីខាងមុខខ្ញុំ រស្មីខាងក្រោយខ្ញុំ រស្មីក្នុងខ្លួនខ្ញុំ មានរស្មីធំធេង សម្រាប់រូបខ្ញុំ សូមធ្វើឲ្យរស្មី សម្រាប់រូបខ្ញុំ និងធ្វើឲ្យរូបខ្ញុំជារស្មី...',
        reference: 'البخاري 6316, Muslim 763',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1f2HXOmJTmEHtuGMGF9FFrq0qqZODkgkT'
      }
    ]
  },
  {
    id: 'ch13',
    number: 13,
    titleKhmer: 'សូត្រពេលចូលម៉ាស្ជិត',
    titleEnglish: 'Entering Mosque',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '20',
        number: 20,
        arabic: 'أَعُوذُ بِاللَّهِ العَظِيمِ، وَبِوَجْهِهِ الكَرِيمِ، وَسُلْطَانِهِ القَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ... بِسْمِ اللَّهِ، وَالصَّلَاةُ... وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ... اللَّهُمَّ اغْفِرْ لِيْ ذُنُوْبِيْ... وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        translation: 'ខ្ញុំសុំពីអល់ឡោះដ៏មហាធំ ដោយវង់ភ័ក្ដ្រាដ៏មហាថ្កុំថ្កើង និងអំណាចជាអមតៈ សូមបញ្ចៀសរូបខ្ញុំ ពីស្ហៃតន ដែលត្រូវ គេដាក់ផ្ដាសា... ឱអល់ឡោះជាម្ចាស់! សូមអភ័យទោស ដល់រូបខ្ញុំផង និងសូម បើកបណ្ដាទ្វារ រ៉ស់ម៉ាត់ របស់ទ្រង់ សម្រាប់រូបខ្ញុំផងចុះ ។',
        reference: 'Abu Dawud 466, Muslim 713',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fD1CWtDDzLDPJoaFutKoZAM7BuM133Wr'
      }
    ]
  },
  {
    id: 'ch14',
    number: 14,
    titleKhmer: 'សូត្រពេលចេញពីម៉ាស្ជិត',
    titleEnglish: 'Leaving Mosque',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '21',
        number: 21,
        arabic: 'بِسْـمِ اللهِ ، وَالصّـلَاةُ وَالسَّـلَامُ عَـلَى رَسُـولِ اللهِ... اللهم اغْفِرْ لِـيْ ذُنُوْبِي... اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِك... اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ',
        translation: 'ដោយនាមរបស់អល់ឡោះ និងពរជ័យ ព្រមទាំងសេចកី្ដ សុខក្សេមក្សាន្ដ សូមមានដល់រ៉ស៊ូលុលឡោះ។ ឱអល់ឡោះ ជាម្ចាស់! សូមអភ័យទោស ដល់រូបខ្ញុំផង និងខ្ញុំសុំពរជ័យ អំពីទ្រង់។ ឱអល់ឡោះជាម្ចាស់! សូមការពាររូបខ្ញុំ ពីស្ហៃតន ដែលត្រូវគេដាក់ផ្ដាសាផងចុះ។',
        reference: 'Ibn Majah, Muslim',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fJLsgykzQvlrHbMoGsnaEzXvieUpN4fl'
      }
    ]
  },
  {
    id: 'ch15',
    number: 15,
    titleKhmer: 'សូត្រពេលឮអាហ្សាន',
    titleEnglish: 'Adhan',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '22',
        number: 22,
        arabic: 'لاَ حَوْلاَ وَ لاَ قُوَّةَ إَلاَّ بِاللهِ',
        translation: '(ពេលឮៈ حَيَّ عَلَى الصَّلاَةِ ، حَيَّ عَلَى اْلفَلاَحِ ) មានន័យថាៈ គ្មានអំណាចឬកំលាំងពលំអ្វីឡើយ គឺ មានតែអល់ឡោះមួយគត់។',
        reference: 'Al-Bukhari 611',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fPfTSfT23y1KCem20_KuQpagInlb_1Qs'
      },
      {
        id: '23',
        number: 23,
        arabic: 'وَ أَنَا أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ وَ أَنَّ مُحَمَّدًا عَبْدُهُ وَ رَسُوْلُهُ ، رَضِيْتُ بِاللهِ رَبًّا، وَ بِمُحَمّدٍ رَسُوْلاً، وَ بِاْلإِسْلاَمِ دِيْنًا',
        translation: 'ខ្ញុំសូមធ្វើសាក្សីថា គ្មានទេម្ចាស់ ដែលត្រូវគេគោរពយ៉ាង ពិតប្រាកដ គឺមានតែអល់ឡោះមួយគត់ ពុំមានស្ហ៊ីរិកជាមួយ នឹងទ្រង់ឡើយ ហើយមូហាំម៉ាត់ជាខ្ញុំបម្រើ របស់អល់ឡោះ និងជារ៉សូលរបស់ទ្រង់ផងដែរ។ ខ្ញុំយល់ព្រមថា អល់ឡោះជា ម្ចាស់ មូហាំម៉ាត់ជារ៉សូល និងអ៊ីស្លាមជាសាសនាពិត ។',
        reference: 'Muslim 386',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fTP7GvkM35e1dh0XnxbAtveGxIDz9PPv'
      },
      {
        id: '25',
        number: 25,
        arabic: 'اللَّهُمَّ رَبَّ هِذِهِ الدَّعْوَةِ التّاَمَّةِ ، وَالصَّلاَةِ اْلقَائِمَةِ ، آتِ مُحَمَّداً الْوَسِيْلَةَ وَاْلفَضِيْلَةَ ، وَ ابــْعَثْ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ ، [ إِنَّكَ لاَ تُخْلِفَ الِميْعَادَ ]',
        translation: 'ឱអល់ឡោះជាម្ចាស់នៃការអំពាវនាវ ដ៏សកិ្ដសិទ្ធឥតខ្ចោះ និងជាម្ចាស់នៃការសឡាត ដែលគេបាន បពា្ឈរឡើង។ សូមផ្ដល់ដល់មូហាំម៉ាត់ នូវកន្លែងដ៏ល្អ (នៅក្នុង ឋានសួគ៌ា) និងឋានៈដ៏ខ្ពង់ខ្ពស់ផងចុះ។ សូមបញ្ជូនមូហាំម៉ាត់ ទៅកន្លែងដ៏អស្ចារ្យ ដែលគេកោតសរសើរ តាមការដែលទ្រង់ ធ្លាប់បានសន្យាផ្ដល់ដល់មូហាំម៉ាត់នោះ។ ប្រាកដណាស់ទ្រង់ មិនដែលភ្លេចពាក្យសន្យាឡើយ។',
        reference: 'Al-Bukhari 614',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fXADnfrLs2Ckn4IoBNauHzY_pQ3uzpvE'
      }
    ]
  },
  {
    id: 'ch16',
    number: 16,
    titleKhmer: 'ការហ្ទូអាពេលចាប់ផ្តើមសឡាត',
    titleEnglish: 'Start Prayer',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '27',
        number: 27,
        arabic: 'اَللَّهُمَّ بَاعِدْ بَيْنِيْ وَ بَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَ الْمَغْرِبِ ، الَلَّهُمَّ نَقِّنِيْ مِنْ خَطَايَايَ ، كَمَا يُنَقَّى الثَوْبُ اْلأَبْيَضُ مِنَ الدَّنـَسِ ، اَللَّهُمَّ اغْسِلْنِيْ مِنْ خَطَايَايَ بِالثَّلْجِ وَ الْمَاءِ وَ الْبَرَدِ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមទ្រង់ ធ្វើឲ្យឃ្លាតឆ្ងាយផងចុះ រវាងរូបខ្ញុំ និងបណ្ដាកំហុសរបស់ខ្ញុំ ដូចដែលអល់ឡោះ បានធ្វើឲ្យឃ្លាតឆ្ងាយពីគ្នា រវាងទិសខាងកើត និងខាងលិច...',
        reference: 'Al-Bukhari 744, Muslim 598',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fafRj5YyL6UU5NetH7LXf4HLAA83btzC'
      },
      {
        id: '28',
        number: 28,
        arabic: 'سُبْحَانَكَ اللَّهُمَّ وَ بِحَمْدِكَ ، وَ تَبَارَكَ اسْمُكَ ، وَ تــَعَالىَ جَدُّكَ ، وَ لاَ إِلَهَ غَيْرُكَ',
        translation: 'ទ្រង់ដ៏មហាស្អាតស្អំ និងការសរសើរ ចំពោះទ្រង់។ មហា កិត្ដស័ព្ទថ្កុំថ្កើង និងឋានៈដ៏មហាខ្ពង់ខ្ពស់។ គ្មានម្ចាស់ណា ដែលត្រូវគេគោរពយ៉ាងពិតប្រាកដ ក្រៅពីទ្រង់ឡើយ។',
        reference: 'Muslim 399',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fbKNcT8ySxIWoH1DfZeJ8W5lWOrOfsil'
      },
      {
        id: '29',
        number: 29,
        arabic: 'وَجَّهْتُ وَجْهِيَ للِـَّذِيْ فَطَرَ السَّمَاوَاتِ وَ اْلأَرْضَ حَنِيْفًا وَ مَا أَنــَا مِنَ اْلمُشْرِكِيْنَ...',
        translation: 'ខ្ញុំសូមបំបែរមុខរបស់ខ្ញុំសំដៅ អ្នកដែលបានបង្កើតមេឃ និងផែនដី ដោយកាន់ សាសនាដ៏ស្អាតស្អំ...',
        reference: 'Muslim 771',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1feyLJBKOIOQHQIw3J8npkBhrZfiHX9Em'
      }
    ]
  },
  {
    id: 'ch17',
    number: 17,
    titleKhmer: 'សូត្រពេលរូកុ',
    titleEnglish: 'Ruku',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '32',
        number: 32,
        arabic: 'سُبْحانَ رَبِّيَ الْعَظِيمِ',
        translation: '«ម្ចាស់របស់ខ្ញុំ ដ៏មហាស្អាតស្អំបំផុត» (សូត្របីដង)។',
        reference: 'Abu Dawud 870',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fwI08a8gDoE8QT-c9Kr4p_xbqBWneagc'
      },
      {
        id: '33',
        number: 33,
        arabic: 'سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ ، اللَّهُمَّ اغْـفِرْ لِي',
        translation: 'ឱអស់ឡោះមា្ចស់របស់យើងដ៏ មហាស្អាតស្អំ! ខ្ញុំសូម កោតសរសើរចំពោះទ្រង់ ។ ឱអល់ឡោះ! សូមអធ្យាស្រ័យ ដល់រូបខ្ញុំផងចុះ។',
        reference: 'Al-Bukhari 794',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1fw_zlHX20f1L7XEhiyNUe2eesFDgRP87'
      }
    ]
  },
  {
    id: 'ch18',
    number: 18,
    titleKhmer: 'ការសូត្រពេលងើបពីរូកុ',
    titleEnglish: 'Rising from Ruku',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '37',
        number: 37,
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
        translation: 'អល់ឡោះបានឮហើយ សម្រាប់ជនណា ដែលបានលើក សរសើរ ទ្រង់ ។',
        reference: 'Al-Bukhari 796',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1gEQwdzaZxQyztJSCubdkN2kRM5ZHvpHn'
      },
      {
        id: '38',
        number: 38,
        arabic: 'رَبَّنَا وَلَكَ الْـحَمْدُ ، حَـمْداً كَثيراً طَيِّباً مُبارَكاً فِيهِ',
        translation: 'ឱម្ចាស់របស់យើងខ្ញុំ! ការសរសើរទាំងឡាយចំពោះទ្រង់ ។ ទាំងនេះ ជាការសរសើរ ដ៏ស័កិ្ដសម ប្រកបដោយពរជ័យ ដ៏ លើសលប់ ។',
        reference: 'Al-Bukhari 796',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1gEW-5jzl708wxggiwhqqorEqiwjh6xGn'
      }
    ]
  },
  {
    id: 'ch19',
    number: 19,
    titleKhmer: 'ការសូត្រពេលស៊ូជូត',
    titleEnglish: 'Sujood',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '40',
        number: 40,
        arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
        translation: 'ម្ចាស់ដ៏ស្អាតស្អំ មហាខ្ពង់ខ្ពស់ ។ (សូត្របីងដង)',
        reference: 'Abu Dawud 870',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1gGntEgYsIaVV1N5vIFZo_zIpateh5c5G'
      },
      {
        id: '41',
        number: 41,
        arabic: 'سُبْحَـانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ ، اللَّهُمَّ اغْفِرْ لِي',
        translation: 'ឱអល់ឡោះ! មា្ចស់ដ៏មហាស្អាតស្អំរបស់យើងខ្ញុំ និងការ កោតសរសើរចំពោះទ្រង់ ។ ឱអល់ឡោះ! សូមអធ្យាស្រ័យ ដល់រូបខ្ញុំផងចុះ ។',
        reference: 'Al-Bukhari 794',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1gMC4FgrBkn0e4M1yECNZFAS5SCrIR_vA'
      }
    ]
  },
  {
    id: 'ch20',
    number: 20,
    titleKhmer: 'សូត្រពេលអង្គុយ ចន្លោះរវាងស៊ូជូតទាំងពីរ',
    titleEnglish: 'Between Sujood',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '47',
        number: 47,
        arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
        translation: 'ឱម្ចាស់របស់ខ្ញុំ! សូមប្រណីទោស ដល់រូបខ្ញុំផងចុះ។',
        reference: 'Abu Dawud 874',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1go_7M0FKOkypu48Q9rswo9OpcZx73Gv1'
      },
      {
        id: '48',
        number: 48,
        arabic: 'اللَّهُمَّ اغْفِرْ لِي ، وَارْحَمْنِي ، وَاهْدِنِي ، وَاجْبُرْنِي ، وَعَافِنِي ، وَارْزُقْنِي ، وَارْفَعْنِي',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមប្រណី ទោសដល់រូបខ្ញុំផង ផ្ដល់រ៉ស់ម៉ាត់ដល់រូបខ្ញុំផង បំភ្លឺបង្ហាញដល់រូបខ្ញុំផង ផ្ដល់ ប្រយោជន៍ដល់រូបខ្ញុំផង ផ្ដល់សុខភាពល្អដល់រូបខ្ញុំផង ផ្ដល់ លាភសក្ការៈដល់រូបខ្ញុំផង និងលើកដំកើងដល់រូបខ្ញុំផង ។',
        reference: 'Abu Dawud 850',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1gu4UpPVceo1-Vyf0RcW2NCzAT5bI-Vb-'
      }
    ]
  },
  {
    id: 'ch22',
    number: 22,
    titleKhmer: 'ការសូត្រ តាស្ហះហ៊ុត',
    titleEnglish: 'Tashahhud',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '51',
        number: 51,
        arabic: 'التَّحِيَّاتُ لِلَّهِ، وَالصَّلَواتُ ، وَالطَّيِّباتُ ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ...',
        translation: 'ឱអល់ឡោះដ៏អស្ចារ្យ! រាល់ការគោរព និងបណ្ដាអំពើល្អ សម្រាប់អល់ឡោះ ។ សូមសេចក្ដីសុខ ការអាណិតស្រឡាញ់ និងពរជ័យកើតមានដល់ ណាហ្ពីមូហាំម៉ាត់...',
        reference: 'Al-Bukhari 831, Muslim 402',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1h-MimJg6KD-0nuetfPjgOBQRMobk4LuP'
      }
    ]
  },
  {
    id: 'ch23',
    number: 23,
    titleKhmer: 'សឡើវ៉ាតលើណាហ្ពីបន្ទាប់ពី «តាស្ហះហ៊ុត»',
    titleEnglish: 'Salawat',
    categoryIds: ['all', 'prayer', 'praising'],
    duas: [
      {
        id: '52',
        number: 52,
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ ، وَعَلَى آلِ مُحَمَّدٍ ، كَمَا صَلَّيتَ عَلَى إِبْرَاهِيمَ ، وَعَلَى آلِ إِبْرَاهِيمَ ...',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមផ្ដល់ ពរជ័យដល់មូហាំម៉ាត់ និងសាច់សាលោហិតរបស់ មូហាំម៉ាត់ ដូចដែលទ្រង់ ធ្លាប់បាន ឲ្យពរជ័យ ដល់ណាហ្ពី អ៊ីព្រហ៊ីម...',
        reference: 'Al-Bukhari 3370',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1h2DY3TR7ITvWUU7i_2J-8fkZgsnqtm3E'
      }
    ]
  },
  {
    id: 'ch24',
    number: 24,
    titleKhmer: 'ហ្ទូអាបន្ទាប់ពីសូត្រតាស្ហះហ៊ុតរួច (មុនសាឡាម)',
    titleEnglish: 'Before Salam',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '54',
        number: 54,
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ ، وَمِنْ عَذَابِ جَهَنَّمَ ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! ខ្ញុំសូមទ្រង់ បញ្ចៀសរូបខ្ញុំ ពីការធ្វើ ទណ្ឌកម្មនៅក្នុងផ្នូរ និងការធ្វើទណ្ឌកម្មនៅក្នុងនរក ហើយសូម ទ្រង់បញ្ចៀស រូបខ្ញុំពីភាពចលាចលពេលនៅមានជីវិត និងពេល អស់ជីវិត ព្រមទាំងភាពចលាចលរបស់ ម៉ាសៀហហ្ទាច់ហ្ជើល។',
        reference: 'Al-Bukhari 1377',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1hd9ENrXCU73BlejHtFc6KcX3WAtoyxB_'
      },
      {
        id: '55',
        number: 55,
        arabic: 'اللَّهُمَّ إِنِّي أَعوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ ، وَأَعوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ...',
        translation: 'ឱអល់ឡោះជាម្ចាស់! ខ្ញុំសូមទ្រង់បញ្ចៀសរូបខ្ញុំ ពីការធ្វើ ទណ្ឌកម្មក្នុងផ្នូរ និងភាពចលាចលរបស់ម៉ាសៀហហ្ទាច់ហ្ជើល...',
        reference: 'Al-Bukhari 832',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1hmkbTKhqDailF8dGtI_Buw9PFymOYJRQ'
      }
    ]
  },
  {
    id: 'ch25',
    number: 25,
    titleKhmer: 'ហ្ស៊ីកៀរក្រោយសាឡាម បន្ទាប់ពីសឡាត',
    titleEnglish: 'After Salam',
    categoryIds: ['all', 'prayer'],
    duas: [
      {
        id: '65',
        number: 65,
        arabic: 'أَسْتَغْفِرُ اللهَ (ثَلاَثًا) ، اللَّهُمَّ أَنْتَ السَّلاَمُ ، وَمِنْكَ السَّلاَمُ ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ',
        translation: 'ខ្ញុំសូមនូវការលើកលែងទោសពី អល់ឡោះ (៣ដង) ។ ឱអល់ឡោះ! ទ្រង់ជាអ្នកផ្ដល់នូវភាពសន្ដិសុខ ហើយសន្ដិសុខ បានមកអំពីទ្រង់ ។ ទ្រង់ដ៏មហាពិសិដ្ឋ ។ ឱម្ចាស់ ដែលប្រកប ដោយកិត្ដិយសមហាខ្ពង់ខ្ពស់ និងសប្បុរសបំផុត ។',
        reference: 'Muslim 591',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1ib-axWeyk9HRCz4sC1Bsk2ag45S4JI9p'
      }
    ]
  },
  {
    id: 'ch27',
    number: 27,
    titleKhmer: 'ហ្សីកៀរពេលព្រឹក និងពេលល្ងាច',
    titleEnglish: 'Morning & Evening',
    categoryIds: ['all', 'morning_evening'],
    duas: [
      {
        id: '74',
        number: 74,
        arabic: 'الْـحَمْدُ لِلَّهِ وَحْدَهُ ، وَالصَّلاَةُ وَالسَّـلاَمُ عَلَى مَـنْ لاَ نَبِيَّ بَعْدَهُ... (آية الكرسي)',
        translation: '(អាយ៉ាត់គួរគូរស៊ី) ឱអល់ឡោះជាម្ចាស់! ដែលគ្មាន ម្ចាស់ណា ត្រូវគេគោរព ដ៏ពិតប្រាកដ ក្រៅពីទ្រង់ឡើយ ។ ទ្រង់មាន ជីវិតអមតៈ...',
        reference: 'An-Nasa\'i',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1j51FTwElirsnd1DwGrrrtMa3UsjI7Dor'
      }
    ]
  },
  {
    id: 'ch28',
    number: 28,
    titleKhmer: 'សូត្រពេលចូលដំណេក',
    titleEnglish: 'Before Sleeping',
    categoryIds: ['all', 'morning_evening', 'home'],
    duas: [
      {
        id: '97',
        number: 97,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ... (المعوذات)',
        translation: '(សូត្រស៊ូរ៉ោះ Ikhlas, Falaq, Nas ៣ដង ហើយផ្លុំដាក់ដៃ ជូតខ្លួន)',
        reference: 'Al-Bukhari 5017',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1hZuNcrkcrpKYyox1GbrNF9B1acYaD05K' 
      },
      {
        id: '100',
        number: 100,
        arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي ، وَبِكَ أَرْفَعُهُ ، فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا ، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا ، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
        translation: 'ដោយព្រះនាមរបស់ទ្រង់ ឱម្ចាស់របស់ខ្ញុំ! ខ្ញុំសូមដាក់ខ្លួន ដេក និងដោយព្រះនាមរបស់ទ្រង់ ខ្ញុំសូមក្រោកពីដំនេក...',
        reference: 'Al-Bukhari 6320',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1i-Z-kze-IRiQN5lAWFJ-7zOGsoa5XDVk' 
      }
    ]
  },
  {
    id: 'ch29',
    number: 29,
    titleKhmer: 'ការហ្ទូអានៅពេលប្រែខ្លួនក្នុងដំណេកនារាត្រី',
    titleEnglish: 'Turning over at night',
    categoryIds: ['all', 'morning_evening'],
    duas: [
      {
        id: '107',
        number: 107,
        arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ الْوَاحِدُ الْقَهّارُ ، رَبُّ السَّمَوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزيزُ الْغَفَّارُ',
        translation: 'គ្មានទេម្ចាស់ដែលត្រូវគេគោរព ដ៏ពិតប្រាកដ គឺមានតែ អល់ឡោះជាម្ចាស់តែមួយ ដ៏មហាខ្លាំងពូកែ ។ ទ្រង់ជាម្ចាស់ មេឃ និងដី...',
        reference: 'Al-Hakim 1/540',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1jD-OM2EWYrbIGvG4xsbP3iwlC8UTC8I9'
      }
    ]
  },
  {
    id: 'ch63',
    number: 63,
    titleKhmer: 'ហ្ទូអាសុំទឹកភ្លៀង',
    titleEnglish: 'Rain (Istisqa)',
    categoryIds: ['all', 'nature', 'prayer'],
    duas: [
      {
        id: '164',
        number: 164,
        arabic: 'اللَّهُمَّ اسْقِنَا غَيْثاً مُغِيثاً مَرِيئاً مَرِيعاً ، نَافِعاً غَيْرَ ضَارٍّ ، عَاجِلاً غَيْرَ آجِلٍ',
        translation: 'ឱអល់ឡោះជាម្ចាស់! សូមទ្រង់ ផ្ដល់ទឹកភ្លៀង ដល់ពួក យើងខ្ញុំ នូវទឹកភ្លៀងដែលមានផលប្រយោជន៍បរិបូរ សុខភាពល្អ ផ្ដល់ផលល្អ គ្មានគ្រោះថ្នាក់...',
        reference: 'Abu Dawud 1171',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1iSXm_TMCsDjpyT2dNfensVIBT9dXHIwo' 
      }
    ]
  },
  {
    id: 'ch69',
    number: 69,
    titleKhmer: 'សូត្រមុនពេលទទួលទានអាហារ',
    titleEnglish: 'Before Eating',
    categoryIds: ['all', 'food'],
    duas: [
      {
        id: '173',
        number: 173,
        arabic: 'بِسْمِ اللهِ',
        translation: '(ក្នុងនាមអល់ឡោះ)។',
        reference: 'Abu Dawud 3767',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1j7gX9frOJQlp0eZwDPHJqocpicdXFFSY' 
      }
    ]
  },
  {
    id: 'ch70',
    number: 70,
    titleKhmer: 'សូត្របន្ទាប់ពីទទួលទានអាហាររួច',
    titleEnglish: 'After Eating',
    categoryIds: ['all', 'food', 'gratitude'],
    duas: [
      {
        id: '175',
        number: 175,
        arabic: 'الْـحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا ، وَرَزَقَنِيهِ ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
        translation: 'ការសរសើរទាំងឡាយចំពោះទ្រង់ ដែលជាអ្នកផ្ដល់អាហារ នេះ ដល់យើងខ្ញុំ និងផ្ដល់លាភីមកឲ្យខ្ញុំ...',
        reference: 'Abu Dawud 4025',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1iVZVWMg3DThaAJyNgbGfGpiO2x48RSl7' 
      }
    ]
  },
  {
    id: 'ch96',
    number: 96,
    titleKhmer: 'ហ្ទូអាពេលធ្វើដំណើរ',
    titleEnglish: 'Travel',
    categoryIds: ['all', 'travel'],
    duas: [
      {
        id: '202',
        number: 202,
        arabic: 'اللَّهُ أَكْـبَرُ ، اللَّهُ أَكْـبَرُ ، اللَّهُ أَكْبَرُ... سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا...',
        translation: 'អល់ឡោះដ៏មហាធំធេង (បីដង) ទ្រង់ដ៏មហាបរិសុទ្ធ ដែល ទ្រង់បានសម្រួល ដល់ពួកយើងខ្ញុំ នូវករណីនេះ...',
        reference: 'Muslim 1342',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1iyt8JYqKNkNULeMxA9mn1mEZBEvB9ajw' 
      }
    ]
  },
  {
    id: 'ch129',
    number: 129,
    titleKhmer: 'ការសុំអភ័យទោស និងសារភាព',
    titleEnglish: 'Repentance and Istighfar',
    categoryIds: ['all', 'prayer', 'praising'],
    duas: [
      {
        id: '241',
        number: 241,
        arabic: 'وَاللَّهِ إِنِّي لأَسْتَغفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةٍ',
        translation: 'ខ្ញុំសូមស្បថចំពោះអល់ឡោះ ពិតណាស់ រូបខ្ញុំ បានសុំការអភ័យ ទោស ពីអល់ឡោះ និងសារ ភាពកំហុសចំពោះទ្រង់ ច្រើនជាង ចិតសិប ដងក្នុងមួយថ្ងៃ។',
        reference: 'Al-Bukhari 6307',
        audioSrc: 'https://drive.google.com/uc?export=download&id=1hZuNcrkcrpKYyox1GbrNF9B1acYaD05K'
      }
    ]
  }
];
