import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { ViewMode } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface BasicKnowledgeViewProps {
  setView: (view: ViewMode) => void;
}

export const BasicKnowledgeView: React.FC<BasicKnowledgeViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const cards = [
    {
      id: 'aqeeda',
      title: 'ផ្នែកអាគីហ្ទះ(គោលជំនឿ)',
      link: 'https://kamnopislam.blogspot.com/2022/10/the-creed-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/aqeeda-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/aqeeda.png',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      darkColor: 'bg-blue-900/20 text-blue-400 border-blue-800/50'
    },
    {
      id: 'fiqh',
      title: 'ផ្នែកហ្វីកោះ(ក្បួនច្បាប់អ៊ីស្លាម)',
      link: 'https://kamnopislam.blogspot.com/2022/10/the-fiqh-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/fiqh-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/fiqh.png',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      darkColor: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50'
    },
    {
      id: 'seera',
      title: 'ផ្នែកជីវប្រវត្តិព្យាការីមូហាំម៉ាត់',
      link: 'https://kamnopislam.blogspot.com/2022/10/history-of-prophet-muhammad.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/seera-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/seera.png',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      darkColor: 'bg-amber-900/20 text-amber-400 border-amber-800/50'
    },
    {
      id: 'tafseer',
      title: 'ផ្នែកតាហ្វសៀរ(បកស្រាយគម្ពីរគួរអាន)',
      link: 'https://kamnopislam.blogspot.com/2022/10/the-tafsir-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/tafseer-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/tafseer.png',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      darkColor: 'bg-purple-900/20 text-purple-400 border-purple-800/50'
    },
    {
      id: 'hadeeth',
      title: 'ផ្នែកហាទីស្ហ(ប្រសាសន៍ព្យាការី)',
      link: 'https://kamnopislam.blogspot.com/2022/10/hadith-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/hadeeth-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/hadeeth.png',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      darkColor: 'bg-rose-900/20 text-rose-400 border-rose-800/50'
    },
    {
      id: 'adab',
      title: 'ផ្នែកសុជីវធម៌អ៊ីស្លាម',
      link: 'https://kamnopislam.blogspot.com/2022/10/islamic-etiquettes-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/adab-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/adab.png',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      darkColor: 'bg-cyan-900/20 text-cyan-400 border-cyan-800/50'
    },
    {
      id: 'akhlaq',
      title: 'ផ្នែកសីលធម៌',
      link: 'https://kamnopislam.blogspot.com/2022/10/morals-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/akhlaq-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/akhlaq.png',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      darkColor: 'bg-indigo-900/20 text-indigo-400 border-indigo-800/50'
    },
    {
      id: 'adeiah',
      title: 'ផ្នែកទូអា និងហ្ស៊ីកៀរ(ការបួងសួង រំលឹក)',
      link: 'https://kamnopislam.blogspot.com/2022/10/supplications-and-dhikrs-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/adeiah-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/adeiah.png',
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      darkColor: 'bg-teal-900/20 text-teal-400 border-teal-800/50'
    },
    {
      id: 'misc',
      title: 'ផ្នែកផ្សេងៗ',
      link: 'https://kamnopislam.blogspot.com/2022/10/miscellaneous-section.html',
      logo: 'https://kids.islamenc.com//assets/imgs/logos/misc-small.png',
      bgImg: 'https://kids.islamenc.com//assets/imgs/logos/misc.png',
      color: 'bg-slate-50 text-slate-600 border-slate-100',
      darkColor: 'bg-slate-900/20 text-slate-400 border-slate-800/50'
    }
  ];

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(ViewMode.HOME)}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-khmer">{t('services.basic_knowledge')}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Intro Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold font-khmer text-blue-600 dark:text-blue-400">
            មូលដ្ឋានគ្រឹះដែលអ្នកមូស្លីមត្រូវដឹង
          </h1>
          <p className={`text-base md:text-lg font-khmer leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
            នេះគឺជាមូលដ្ឋានគ្រឹះដែលកុមារមូស្លីម ក៏ដូចជាជនមូស្លីមគ្រប់រូបត្រូវដឹងទាក់ទងទៅនឹងសាសនារបស់អល់ឡោះជាម្ចាស់ ហើយជាកាតព្វកិច្ចលើអាណាព្យាបាល ត្រូវបង្រៀនកូនៗរបស់ខ្លួនចាប់តាំងពីពួកគេនៅវ័យកុមារ។
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            if (card.id === 'fiqh' || card.id === 'aqeeda' || card.id === 'tafseer' || card.id === 'hadeeth' || card.id === 'adab' || card.id === 'akhlaq' || card.id === 'adeiah' || card.id === 'misc' || card.id === 'seera') {
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    if (card.id === 'fiqh') setView(ViewMode.FIQH);
                    else if (card.id === 'aqeeda') setView(ViewMode.AQEEDA);
                    else if (card.id === 'tafseer') setView(ViewMode.TAFSEER);
                    else if (card.id === 'hadeeth') setView(ViewMode.BASIC_HADITH);
                    else if (card.id === 'adab') setView(ViewMode.ADAB);
                    else if (card.id === 'akhlaq') setView(ViewMode.MORALITY);
                    else if (card.id === 'adeiah') setView(ViewMode.ADEIAH);
                    else if (card.id === 'misc') setView(ViewMode.MISC);
                    else if (card.id === 'seera') setView(ViewMode.SEERA);
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col items-start justify-between min-h-[160px] transition-all duration-300 hover:scale-[102%] hover:shadow-lg group text-left ${
                    theme === 'dark' ? card.darkColor : card.color
                  }`}
                >
                  <div className="relative z-10 space-y-4 w-2/3">
                    <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm">
                      <img src={card.logo} alt="" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="font-bold font-khmer text-lg leading-tight">
                      {card.title}
                    </h3>
                  </div>
                  
                  {/* Background Image */}
                  <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end">
                    <img 
                      src={card.bgImg} 
                      alt="" 
                      className="w-full h-auto object-contain object-right-bottom max-h-[120px] mr-2 mb-2" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </button>
              );
            }
            
            return (
              <a
                key={card.id}
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col items-start justify-between min-h-[160px] transition-all duration-300 hover:scale-[102%] hover:shadow-lg group ${
                  theme === 'dark' ? card.darkColor : card.color
                }`}
              >
                <div className="relative z-10 space-y-4 w-2/3">
                  <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm">
                    <img src={card.logo} alt="" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="font-bold font-khmer text-lg leading-tight">
                    {card.title}
                  </h3>
                </div>
                
                {/* Background Image */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end">
                  <img 
                    src={card.bgImg} 
                    alt="" 
                    className="w-full h-auto object-contain object-right-bottom max-h-[120px] mr-2 mb-2" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-12 pb-6 flex flex-col items-center justify-center space-y-4 border-t border-gray-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-700 shadow-sm">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhmUx2e04nc5m9YqIrvaERKQELPGaATcd8baYp3aeoW83qKWdhmMsvGLUIGkaIr4VpcHRBXRAtZK7Pg5OhS-Nx7pDQ9GK1FlzpFEOjQRD8XJebDujUGdxpERgkFymQANqpFrInwLKewzBSr-YjjUH9qzTvIaG4KTq9B7TBGucOsmP_e0394Eb4c4dGoBg/s1600/289256727_5149596001762212_6230050116274960490_n.jpg" 
              alt="Creator Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center font-khmer text-sm space-y-1">
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
              ប្រែសម្រួលដោយ <a href="https://web.facebook.com/culturalcentercambodia" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">អង្គការវប្បធម៌អារ្យធម៌កម្ពុជា-អារ៉ាប់</a>
            </p>
            <p className="text-xs text-gray-400">Islamic knowledge | Charity purpose</p>
          </div>
        </div>
      </div>
    </div>
  );
};
