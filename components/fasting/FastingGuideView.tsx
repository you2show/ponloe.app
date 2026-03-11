import React, { useState } from 'react';
import { ChevronLeft, AlertCircle, CheckCircle2, ShieldAlert, Droplets, UtensilsCrossed, Syringe, Baby, Plane, Stethoscope, HeartHandshake, Eye, Bath, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';
import { ViewMode } from '../../types';

interface FastingGuideViewProps {
  setView: (view: ViewMode) => void;
}

export const FastingGuideView: React.FC<FastingGuideViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'breaks' | 'permitted' | 'exemptions'>('breaks');

  const tabs = [
    { id: 'breaks', label: 'ប្រការធ្វើឲ្យដាច់បួស', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500', lightBg: 'bg-rose-50', border: 'border-rose-200', darkBorder: 'border-rose-900/50' },
    { id: 'permitted', label: 'អ្វីដែលអនុញ្ញាត', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-200', darkBorder: 'border-emerald-900/50' },
    { id: 'exemptions', label: 'ការលើកលែង', icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200', darkBorder: 'border-blue-900/50' },
  ] as const;

  const content = {
    breaks: [
      {
        title: 'ការញ៉ាំ និងផឹកដោយចេតនា',
        desc: 'ការបញ្ចូលអាហារ ឬភេសជ្ជៈទៅក្នុងពោះដោយចេតនា។ ប៉ុន្តែប្រសិនបើភ្លេច ឬត្រូវគេបង្ខំ គឺមិនដាច់បួសឡើយ ហើយអាចបន្តការបួសបានធម្មតា។',
        icon: UtensilsCrossed,
      },
      {
        title: 'ការក្អួតដោយចេតនា',
        desc: 'ការធ្វើឲ្យក្អួតដោយចេតនា (ដូចជាលូកក) ធ្វើឲ្យដាច់បួស។ តែបើក្អួតដោយឯងៗ (ឈឺ ឬចាញ់កូន) គឺមិនដាច់បួសទេ។',
        icon: AlertCircle,
      },
      {
        title: 'ការរួមភេទនៅពេលថ្ងៃ',
        desc: 'ការរួមភេទនៅពេលថ្ងៃនៃខែរ៉ាម៉ាដន ធ្វើឲ្យដាច់បួស ហើយតម្រូវឲ្យបួសសង និងពិន័យ (Kaffarah) យ៉ាងធ្ងន់ធ្ងរ។',
        icon: HeartHandshake,
      },
      {
        title: 'ការមករដូវ និងឈាមក្រោយសម្រាល',
        desc: 'ស្ត្រីដែលមករដូវ (ហៃស៍) ឬមានឈាមក្រោយសម្រាលកូន (នីហ្វាស) ត្រូវបញ្ឈប់ការបួស ទោះបីជាវាមកនៅមុនពេលបំបែកបួសបន្តិចក៏ដោយ រួចត្រូវសងនៅថ្ងៃក្រោយ។',
        icon: Droplets,
      },
      {
        title: 'ការបញ្ចូលសារធាតុចិញ្ចឹម',
        desc: 'ការចាក់សេរ៉ូម ឬវីតាមីនតាមសរសៃឈាមដែលជំនួសអាហារ និងផ្តល់កម្លាំង គឺធ្វើឲ្យដាច់បួស។',
        icon: Syringe,
      }
    ],
    permitted: [
      {
        title: 'ការលេបទឹកមាត់',
        desc: 'ការលេបទឹកមាត់ខ្លួនឯងជារឿងធម្មតា និងមិនធ្វើឲ្យដាច់បួសទេ ព្រោះវាជាការលំបាកក្នុងការចៀសវាង។',
        icon: Droplets,
      },
      {
        title: 'ការងូតទឹក ឬត្រាំទឹក',
        desc: 'អនុញ្ញាតឲ្យងូតទឹក ត្រាំទឹក ឬយកក្រណាត់សើមមកគ្របក្បាល ដើម្បីបន្ថយកម្តៅ ឬបំបាត់ភាពស្រេកឃ្លាន។',
        icon: Bath,
      },
      {
        title: 'ការប្រើឈើដុសធ្មេញ (ស៊ីវ៉ាក)',
        desc: 'ការប្រើប្រាស់ស៊ីវ៉ាក ឬច្រាសដុសធ្មេញ គឺអនុញ្ញាតគ្រប់ពេលវេលា តែត្រូវប្រយ័ត្នកុំឲ្យលេបទឹកថ្នាំដុសធ្មេញ។',
        icon: CheckCircle2,
      },
      {
        title: 'ការភ្លក់ម្ហូបអាហារ',
        desc: 'អ្នកធ្វើម្ហូបអាចភ្លក់រសជាតិអាហារដោយប្រើចុងអណ្តាត រួចត្រូវខ្ជាក់ចេញវិញភ្លាមៗ ដោយមិនឲ្យចូលដល់បំពង់កឡើយ។',
        icon: UtensilsCrossed,
      },
      {
        title: 'ការចាក់ថ្នាំព្យាបាល',
        desc: 'ការចាក់ថ្នាំព្យាបាលជំងឺ (សាច់ដុំ ឬសរសៃឈាម) ដែលមិនមែនជាសារធាតុចិញ្ចឹម ឬការបន្តក់ថ្នាំភ្នែក/ត្រចៀក គឺមិនដាច់បួសទេ។',
        icon: Eye,
      }
    ],
    exemptions: [
      {
        title: 'អ្នកជំងឺ',
        desc: 'ប្រសិនបើការបួសធ្វើឲ្យជំងឺកាន់តែធ្ងន់ធ្ងរ ឬពន្យារការព្យាបាល ឥស្លាមអនុញ្ញាតឲ្យមិនបួស រួចត្រូវសងនៅថ្ងៃក្រោយពេលជាសះស្បើយ។',
        icon: Stethoscope,
      },
      {
        title: 'អ្នកធ្វើដំណើរ',
        desc: 'អ្នកដែលធ្វើដំណើរឆ្ងាយ (តាមលក្ខខណ្ឌសាសនា) ត្រូវបានអនុញ្ញាតឲ្យមិនបួស ដើម្បីសម្រាលការលំបាក រួចត្រូវសងនៅថ្ងៃក្រោយ។',
        icon: Plane,
      },
      {
        title: 'ស្ត្រីមានផ្ទៃពោះ និងបំបៅដោះកូន',
        desc: 'ប្រសិនបើនាងបារម្ភពីសុខភាពខ្លួនឯង ឬកូនក្នុងផ្ទៃ/កូនបៅដោះ នាងអាចមិនបួស រួចសងនៅថ្ងៃក្រោយ (និងអាចមានការចេញ Fidyah បន្ថែមតាមករណី)។',
        icon: Baby,
      },
      {
        title: 'មនុស្សចាស់ជរា និងអ្នកជំងឺរ៉ាំរ៉ៃ',
        desc: 'អ្នកដែលគ្មានលទ្ធភាពបួសទាល់តែសោះ មិនតម្រូវឲ្យបួសទេ ប៉ុន្តែត្រូវផ្តល់អាហារដល់ជនក្រីក្រ (Fidyah) មួយពេលសម្រាប់មួយថ្ងៃដែលមិនបានបួស។',
        icon: ShieldAlert,
      }
    ]
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-200'
      }`}>
        <button 
          onClick={() => setView(ViewMode.HOME)}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ច្បាប់នៃការបួស
        </h1>
      </div>

      {/* Intro Section */}
      <div className={`px-4 py-6 mb-2 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} shadow-sm`}>
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Info size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-khmer mb-2">ការតមអាហារ (សោម)</h2>
            <p className={`font-khmer leading-relaxed text-sm md:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              ការបួសគឺជាសសរស្តម្ភមួយនៃឥស្លាម។ ការយល់ដឹងពីប្រការដែលធ្វើឲ្យដាច់បួស និងអ្វីដែលអនុញ្ញាត គឺជារឿងចាំបាច់សម្រាប់អ្នកមូស្លីមគ្រប់រូប ដើម្បីធានាថាការបួសរបស់ពួកគេត្រឹមត្រូវ និងទទួលបានផលបុណ្យពេញលេញ។
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className={`sticky top-[60px] z-20 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shadow-sm ${
        theme === 'dark' ? 'bg-slate-950/95 backdrop-blur border-b border-slate-800' : 'bg-gray-50/95 backdrop-blur border-b border-gray-200'
      }`}>
        <div className="max-w-3xl mx-auto w-full flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-xl whitespace-nowrap font-khmer transition-all ${
                activeTab === tab.id
                  ? `${tab.bg} text-white shadow-md scale-105`
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : tab.color} />
              <span className="text-xs md:text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {content[activeTab].map((item, index) => {
              const activeTheme = tabs.find(t => t.id === activeTab);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className={`p-5 rounded-2xl border flex gap-4 transition-all hover:shadow-md ${
                    theme === 'dark' 
                      ? `bg-slate-900 ${activeTheme?.darkBorder}` 
                      : `bg-white ${activeTheme?.border}`
                  }`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? `${activeTheme?.color.replace('text-', 'bg-').replace('500', '500/20')} ${activeTheme?.color}` : `${activeTheme?.lightBg} ${activeTheme?.color}`
                  }`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold font-khmer mb-2 ${
                      theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`font-khmer leading-relaxed text-sm md:text-base ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
