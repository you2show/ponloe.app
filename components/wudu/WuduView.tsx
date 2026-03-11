import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { ViewMode } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface WuduViewProps {
  setView: (view: ViewMode) => void;
}

export const WuduView: React.FC<WuduViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const wuduSteps = [
    {
      img: 'https://www.wikihow.com/images/thumb/0/05/Be-Suave-Step-16.jpg/aid196202-v4-728px-Be-Suave-Step-16.jpg.webp',
      num: '១',
      content: <><b>នៀត:</b> តាំងចិត្តយកវូហ្ទុដើម្បីសឡាត ឬ តវ៉ាហ្វ..។ <br/>អ្នកអាចសូត្រថា (ពីសមើលឡះ / Bismillah) :بِسْمِ اللَّهِ ។</>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/e/e1/Perform-Wudu-Step-2.jpg/aid196202-v4-728px-Perform-Wudu-Step-2.jpg.webp',
      num: '២',
      content: <><b>លាងបាតដៃទាំងពីរ ចំនួនបីដង។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/5/56/Perform-Wudu-Step-3.jpg/aid196202-v4-728px-Perform-Wudu-Step-3.jpg.webp',
      num: '៣',
      content: <><b>ខ្ពុរមាត់ ចំនួនបីដង។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/a/a2/Perform-Wudu-Step-4.jpg/aid196202-v4-728px-Perform-Wudu-Step-4.jpg.webp',
      num: '៤',
      content: <><b>បីតទឹកបញ្ចូលក្នុងច្រមុះ និង បញ្ចេញបកក្រៅវិញ ចំនួនបីដង។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/e/e5/Perform-Wudu-Step-5.jpg/aid196202-v4-728px-Perform-Wudu-Step-5.jpg',
      num: '៥',
      content: <><b>លាងមុខ ចំនួនបីដង(ចាប់ពីថ្ងាស់រហូតដល់ក្រោមចង្ការ ហើយចាប់ពីកូនត្រចៀកម្ខាងរហូតដល់កូនត្រចៀកម្ខាងទៀត។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/4/43/Perform-Wudu-Step-6.jpg/aid196202-v4-728px-Perform-Wudu-Step-6.jpg.webp',
      num: '៦',
      content: <><b>លាងដៃស្ដាំរហូតដល់កែងដៃ ចំនួនបីដង។ ហើយលាងដៃឆ្វេងរហូតដល់កែងដៃ ចំនួនបីដង។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/a/aa/Perform-Wudu-Step-8.jpg/aid196202-v4-728px-Perform-Wudu-Step-8.jpg',
      num: '៧',
      content: <><b>ជូតត្រចៀក ទាំងពីរ ទាំងផ្នែកខាងក្រៅ និងផ្នែកខាងក្នុង នឹងទឹកដែល សល់ពីការជូតក្បាល ឬអាចយកទឹកថ្មីប្រសិនបើទឹកនោះស្ងួតអស់។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/e/e0/Perform-Wudu-Step-7.jpg/aid196202-v4-728px-Perform-Wudu-Step-7.jpg',
      num: '៨',
      content: <><b>ជូតក្បាល ដោយចាប់ផ្តើមពីផ្នែកខាងមុខដល់ផ្នែកខាងក្រោយ និង ជូតត្រលប់ បញ្ច្រាសមកវិញ ចំនួនមួយដងគត់។ </b>ការស្វែងយល់: ទីមួយ មានសាសនវិទូឥស្លាមមួយចំនួនយល់ឃើញថា ការជូតក្បាល<br />ត្រូវធ្វើបីដង ដូចអវៈយវៈដទៃទៀតដែរ។<br />ប៉ុន្តែទស្សនៈខាងលើដែលថា ត្រូវជូតក្បាលតែមួយដងនោះមានលក្ខណៈត្រឹមត្រូវ ជាងទស្សនៈដែលថា ត្រូវជូតក្បាលបីដងនោះ។<br />ទីពីរ សាសនវិទូឥស្លាមបានខ្វែងគំនិតគ្នាអំពីបញ្ហាថា តើត្រូវជូតក្បាល ទាំងអស់តែម្ដង ឬ ត្រូវជូតតែផ្នែកខ្លះនៃក្បាលក៏បានដែរ?<br />-ទស្សនៈទីមួយ ត្រូវជូតយ៉ាងហោចណាស់ ១/៤ នៃក្បាល ។<br />-ទស្សនៈទីពីរ ត្រូវជូតក្បាលទាំងអស់តែម្តង ។<br /> -ទស្សនៈទីបី ត្រូវជូតផ្នែកណាមួយនៃក្បាល ទោះជាការ<br />ជូតនោះតិចក្តី ឬ ច្រើនក្តី ក៏វូហ្ទុរបស់គេត្រឹមត្រូវដែរ។</>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/6/6e/Perform-Wudu-Step-9.jpg/aid196202-v4-728px-Perform-Wudu-Step-9.jpg',
      num: '៩',
      content: <><b>លាងជើងស្ដាំរហូតដល់កែងជើង។ ហើយលាងជើងឆ្វេងរហូតដល់កែងជើង។</b></>
    }
  ];

  const tayammumSteps = [
    {
      img: 'https://www.wikihow.com/images/thumb/0/01/Be-a-Winner-Step-1.jpg/aid196202-v4-728px-Be-a-Winner-Step-1.jpg.webp',
      num: '១',
      content: <><b>នៀត តាយាំមុំ ដើម្បីសឡាត ឬ តវ៉ាហ្វ ជាដើម។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/0/05/Be-Suave-Step-16.jpg/aid196202-v4-728px-Be-Suave-Step-16.jpg.webp',
      num: '២',
      content: <><b>សូត្រ ពីសមើលឡ بِسْمِ الله (Bismillah)។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/7/7c/Perform-Tayammum-Step-12.jpg/aid239882-v4-728px-Perform-Tayammum-Step-12.jpg.webp',
      num: '៣',
      content: <><b>យកបាតដៃទាំងពីរ ដាក់លើធូលី ឬ ដីដែលស្អាត។</b></>
    },
    {
      img: 'https://www.wikihow.com/images/thumb/9/90/Perform-Tayammum-Step-13.jpg/aid239882-v4-728px-Perform-Tayammum-Step-13.jpg',
      num: '៤',
      content: <><b>ជូតមុខ រួចប្រអប់ដៃទាំងពីរ (ចំនួនមួយដងគត់)។</b></>
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
          <h1 className="text-xl font-bold font-khmer">{t('services.wudu')}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Wudu Section */}
        <section>
          <h2 className="text-2xl font-bold font-khmer mb-6 text-emerald-600">របៀបយកវូហ្ទុ</h2>
          <div className="space-y-6">
            {wuduSteps.map((step, index) => (
              <div key={`wudu-${index}`} className={`rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
              }`}>
                <img src={step.img} alt={`Step ${step.num}`} className="w-full h-auto object-cover max-h-64" referrerPolicy="no-referrer" />
                <div className="p-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg font-khmer">
                    {step.num}
                  </span>
                  <p className={`font-khmer leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tayammum Section */}
        <section className="pt-8 border-t border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold font-khmer mb-6 text-emerald-600">របៀបតាយាំមុំ</h2>
          <div className="space-y-6">
            {tayammumSteps.map((step, index) => (
              <div key={`tayammum-${index}`} className={`rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
              }`}>
                <img src={step.img} alt={`Step ${step.num}`} className="w-full h-auto object-cover max-h-64" referrerPolicy="no-referrer" />
                <div className="p-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg font-khmer">
                    {step.num}
                  </span>
                  <p className={`font-khmer leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
