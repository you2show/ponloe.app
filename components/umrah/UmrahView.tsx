import React, { useState } from 'react';
import { ChevronLeft, BookOpen, Image as ImageIcon, Video, FileText, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';
import { ViewMode } from '../../types';

interface UmrahViewProps {
  setView: (view: ViewMode) => void;
}

export const UmrahView: React.FC<UmrahViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'books' | 'video'>('text');

  const tabs = [
    { id: 'text', label: 'អត្ថបទ', icon: FileText },
    { id: 'images', label: 'រូបភាព', icon: ImageIcon },
    { id: 'books', label: 'សៀវភៅ', icon: BookOpen },
    { id: 'video', label: 'វីដេអូ', icon: Video },
  ] as const;

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
          របៀបធ្វើអុំរ៉ោះ
        </h1>
      </div>

      {/* Tabs Header */}
      <div className={`sticky top-[60px] z-20 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar ${
        theme === 'dark' ? 'bg-slate-950/95 backdrop-blur' : 'bg-gray-50/95 backdrop-blur'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-khmer transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Intro Note */}
              <div className={`p-4 rounded-xl border-l-4 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-emerald-500 text-slate-300' 
                  : 'bg-white border-emerald-500 text-gray-700 shadow-sm'
              }`}>
                <div className="flex items-start gap-3">
                  <Info className="text-emerald-500 shrink-0 mt-1" size={20} />
                  <div className="font-khmer leading-relaxed">
                    <p className="font-bold mb-2">យោងហ្វាតាវ៉ា អ៊ីមុំា អ៊ីពនូ ហ្ពាហ្ស (១៧/៤២៥) និងអ៊ីពនូ អ៊ូសៃមីន បាននិយាយថា៖</p>
                    <p>ការងារដែលត្រូវធ្វើសំរាប់អុំរ៉ោះគឺ មាន៤៖</p>
                    <p className="font-amiri text-xl my-2 text-right" dir="rtl">الإحرام ، والطواف بالبيت الحرام ، والسعي بين الصفا والمروة ، والحلق أو التقصير</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>អាល់អៀហរ៉ម (នៀតធ្វើអុំរ៉ោះដោយពាក់ក្រណាត់ស២ដុំ)</li>
                      <li>ដើរតវ៉ាហ្វជុំវិញកាក់ហ្ពះ «៧ជុំ»</li>
                      <li>ដើរសាអ៊ីរវាង អាល់សាហ្វា និងអាល់ម៉ើរវ៉ា «៧ជុំ»</li>
                      <li>កោរសក់ ឬកាត់សក់</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 1: Ihram */}
              <section className="space-y-4">
                <h2 className={`text-xl font-bold font-khmer px-4 py-2 rounded-lg border-l-4 ${
                  theme === 'dark' ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                }`}>
                  ទី១៖ អាល់អៀហរ៉ម
                </h2>
                <div className={`font-khmer leading-loose space-y-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <p>
                    នៅពេលដែលអ្នកទៅដល់មីកោត (ព្រំប្រទល់ដែលបានកំណត់) ស៊ុណ្ណះត្រូវងូតទឹកដូចងូតទឹកជូនុប ដូចគ្នាដែរស្រ្តី គឺត្រូវងូតទឹកបើសិនជានាងមានរដូវ ឬនីហ្វាស ក៏ប៉ុន្តែនាងមិនត្រូវដើរតវ៉ាហ្វជុំវិញកាក់ហ្ពះឡើយរហូតទាល់តែនាងអស់រដូវ។
                  </p>
                  <p>
                    ពីព្រោះ ណាហ្ពីបានបញ្ជាឲ្យ <b>អាស្មាក ពិនតី អ៊ូមៃស្ស</b> ដែលកំពុងមាននីហ្វាសឲ្យនាងងូតទឹកពេលនាងចង់ពាក់អៀហរ៉មធ្វើអុំរ៉ោះ ដូចក្នុងហាទីសរាយការណ៍ដោយមូស្លិម៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`} dir="rtl">
                    حتى النفساء والحائض لأن النبي صلى الله عليه وسلم  ( أمر أسماء بنت عميس حين نفست أن تغتسل عند إحرامها وتستثفر بثوب وتحرم ) . رواه مسلم (1209) .
                  </div>
                  <p>
                    បន្ទាប់ពីងូតទឹករួចស៊ុណ្ណះសំរាប់បុរស ត្រូវលាបទឹកអប់ក្រអូបលើពុកចង្កា លើក្បាល ដូចក្នុងហាទីស អាអ៊ីស្ហះ រាយការណ៍ដោយពូខរី និងមូស្លីម បន្ទាប់មកចាំពាក់អៀហរ៉មពីលើ តែមិនត្រូវលាបទឹកអប់លើក្រណាស់សនៃអៀហរ៉មឡើយ។
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`} dir="rtl">
                    عائشة رضي الله عنها قالت : كان النبي صلى الله عليه وسلم إذا أراد أن يحرم تطيب بأطيب ما يجد ، ثم أرى وبيص المسك في رأسه ولحيته بعد ذلك . رواه البخاري (271) ومسلم (1190) .
                  </div>
                  <p>
                    មុនពេលពាក់អៀហរ៉ម ឬមុនពេលនៀតចាប់ផ្តើមធ្វើអុំរ៉ោះ ស៊ុណ្ណះត្រូវកោររោមក្លៀក រោមជុំវិញប្រដាប់កេរ្តិ៍ខ្មាស់ កាត់ក្រចកដៃជើង និងកាត់តម្រឹមពុកមាត់នៅឯផ្ទះមុនពេលធ្វើដំណើរ ឬមុនពេលនៀតចាប់ផ្តើមធ្វើអុំរ៉ោះ ពីព្រោះ បន្ទាប់ពីនៀតចូលធ្វើអុំរួចមិនអនុញ្ញាតឡើយ។
                  </p>
                  <p>
                    បើសិនជាក្នុងករណីគាត់មិនអាចងូតទឹកពេលទៅដល់មីកោត ដូចជានៅលើយន្តហោះជាដើម វ៉ាជិបមកលើគាត់គ្រាន់តែដោះសម្លៀកបំពាក់ទាំងអស់ ហើយពាក់តែក្រណាត់សពីរដុំប៉ុណ្ណោះ ។
                    ហើយពេលទៅដល់សណ្ឋាគានៅម៉ាក្កាហគាត់អាចងូតទឹកក៏បានដែរមុនពេលគាត់ចេញទៅទៅដើរតវ៉ាហ្វ។
                  </p>
                  <p>
                    រីឯស្រ្តីវិញ គឺ អនុញ្ញាតឲ្យពាក់សម្លៀកបំពាក់អ្វីក៏បានដែរ ដែលមិនធ្វើឲ្យបុរសដទៃចាប់អារម្មណ៍ និងមិនមែនជាសម្លៀកបំពាក់ដែលលេចធ្លោខុសពីមនុស្សដទៃក្នុងប្រទេស។
                    បន្ទាប់មកចូរអ្នកនៀតក្នុងចិត្ត «ចង់ធ្វើអុំរ៉ោះ» បន្ទាប់មកត្រូវសូត្រថា ៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-2xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    لَبَّيْكَ عُمْرَة ឬ  اَللَّهُمَّ لَبَّيْكَ عُمْرَة
                  </div>
                  <p>បន្ទាប់មកសូត្រ «តាល់ពីយ្យះ» ដូចដែលណាហ្ពីបានសូត្រគឺ ៖</p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-2xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ، 
                    وَالنِّعْمَةَ، لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ
                  </div>
                  <p>
                    ត្រូវសូត្រតាល់ពីយ្យះខាងលើរហូតដល់ឃើញកាក់ហ្ពះ ចូរអ្នកជ្រាបថា តាល់ពីយ្យះខាងលើ មានន័យថា «អ្នកកំពុងឆ្លើយតបចំពោះអល់ឡោះតាមអ្វីដែលអល់ឡោះបានបញ្ជាឲ្យមកធ្វើហាជ្ជី ឬអុំរ៉ោះ» ដូច្នេះ រាល់អ្វីៗទាំងអស់ដែលបានឮការសូត្រតាល់ពីយ្យះខាងលើរបស់អ្នក មិនថាដើមឈើ ឬថ្ម សុទ្ធតែនឹងធ្វើសាក្សីឲ្យអ្នកនៅថ្ងៃគីយ៉ាម៉ាត់ដូចក្នុងហាទីសរាយការណ៍ដោយអាត្តើរមីស៊ីលេខ(៨២៨)។
                  </p>
                  <p>
                    ចូរជ្រាបថា គ្មានឡើយអ្វីទៅដែលហៅថា ស៊ុណ្ណះ២រ៉ក្អាត់បន្ទាប់ពីពាក់អៀហរ៉មរួច វាជាប្រការពិទអះ តែបើសិនជាអ្នកពាក់រួចហើយដល់ពេលសឡាតចូរអ្នកសឡាតធម្មតា។
                    វាជាការយល់ខុសរបស់មនុស្សមួយចំនួន ពេលចាប់ផ្តើមពាក់អៀហរ៉មភ្លាមក៏យកក្រណាត់សដាក់ក្រោមខ្លៀកខាងស្តាំ ហើយបិទស្មាខាងឆ្វេង នេះជាការយល់ខុស ពីព្រោះ ស៊ុណ្ណះឲ្យធ្វើដូច្នេះតែពេលកំពុងដើរតវ៉ាហ្វប៉ុណ្ណោះ រីឯក្រៅពីនោះត្រូវបិទស្មាទាំងពីរ។
                  </p>
                  <img 
                    src="https://makkah.accorhotels.com/wp-content/uploads/sites/55/2018/08/Clothes-for-Hajj-1024x849.jpg" 
                    alt="Ihram Clothes" 
                    className="w-full rounded-xl shadow-md my-4"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </section>

              {/* Section 2: Tawaf */}
              <section className="space-y-4">
                <h2 className={`text-xl font-bold font-khmer px-4 py-2 rounded-lg border-l-4 ${
                  theme === 'dark' ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                }`}>
                  ទី២- តវ៉ាហ្វជុំវិញកាក់ហ្ពះ៧ជុំ
                </h2>
                <div className={`font-khmer leading-loose space-y-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <p>
                    ពេលទៅដល់ម៉ាស្ជិទហារ៉ម គឺត្រូវបញ្ឈប់ការសូត្រតាល់ពីយ្យះ ហើយដើរចូលម៉ាស្ជិតដោយជើងស្តំា និងសូត្រទូអាចូលម៉ាស្ជិទដូចអ្នកចូលម៉ាស្ជិទទូទៅគឺសូត្រទូអាថា ៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    بِسْمِ الله ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ الله، اَللَّهُمَّ اغْفِرْ لِي ذُنُوبِي ،  اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ. أَعُوذُ بالله الْعَظِيمِ وَ بِوَجْهِهِ الْكَرِيمِ وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ.
                  </div>
                  <p>
                    បន្ទាប់មកត្រូវដើរតម្រង់ថ្មខ្មៅនៃកាក់ហ្ពះ ហើយស៊ុណ្ណះដូចក្នុងហាទីស គឺ ឲ្យសាឡាមទៅថ្មខ្មៅដោយយកដៃទៅជូតលើវា និងថើបថ្មនោះ បើសិនជាមានលទ្ធភាព និងមិនប៉ះពាល់ដល់អ្នកដទៃ ហើយសូត្រថា ៖ <span className="font-amiri font-bold">بِسْمِ الله وَالله أَكْبَر</span> ។
                  </p>
                  <p>
                    តែបើសិនជាគ្មានលទ្ធភាព ចូរអ្នកលើកដៃតម្រង់ទៅថ្មខ្មៅ ហើយសូត្រថា <span className="font-amiri font-bold">(الله أكبر)</span> និងមិនត្រូវថើបដៃឡើយ។
                    ត្រូវដឹងថា « មានតែថ្មខ្មៅនេះប៉ុណ្ណោះនៅលើលោកយើងនេះដែលអល់ឡោះអនុញ្ញាតឲ្យថើប រីឯថ្មក្រៅពីនោះមិនអនុញ្ញាតឡើយ » ដូចក្នុងហាទីស ។
                  </p>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`}>
                    <p className="font-bold mb-2">- តើពេលតវ៉ាហ្វវ៉ាជិបត្រូវមានទឹកសំប៉ះយុំាដែរ ឬទេ?</p>
                    <p>ចំលើយ វាមានការខ្វែងយោបល់គ្នារវាងអ៊ូឡាម៉ាកស៊ុណ្ណះ តែដែលត្រឹមត្រូវគឺ ជាស៊ុណ្ណះ មិនវ៉ាជិបត្រូវតែមានទឹកសំប៉ះយុំាងឡើយដូចក្នុងហ្វាតាវ៉ាស្ហៃខុលឥស្លាម អ៊ីពនូ តៃមីយ្យះ។</p>
                  </div>
                  <p>
                    ពេលដើរតវ៉ាហ្វាត្រូវឲ្យកាក់ហ្ពះនៅខាងឆ្វេងដៃ ហើយក្រណាត់សខាងលើត្រូវដាក់ក្រោមក្លៀកនៃស្មាខាងស្តាំ ហើយបិទស្មាខាងឆ្វេង ត្រូវដើរជុំវិញ៧ជុំ រៀងរាល់ពេលដើរកាត់ថ្មខ្មៅត្រូវឲ្យសាឡាមដោយយកដៃជូត និងថើប និងសូត្រដូចបានរៀបរាប់ តែបើគ្មានលទ្ធភាពទេគឺ ត្រូវលើកដៃតម្រង់ទៅរកថ្មខ្មៅហើយសូត្រតឹកពៀតថា <span className="font-amiri font-bold">(الله أكبر)</span> ។
                  </p>
                  <p>
                    ហើយស៊ុណ្ណះគឺ ត្រូវដើរញាប់លឿនបន្តិចពេលតវ៉ាហ្វនៅជុំទី១ ទី២ និងទី៣ប៉ុណ្ណោះពេលទៅដល់ជ្រុងជិតថ្មខ្មៅ (الركن اليماني) បើសិនជាមានលទ្ធភាព តែបើមានមនុស្សច្រើនមិនបាច់ដើរញាប់ឡើយ ហើយស៊ុណ្ណះរៀងរាល់ដើរកាត់ជ្រុងជិតថ្មខ្មៅសូត្រទូអាថា៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
                  </div>
                  <p className="text-sm text-center text-gray-500 font-amiri" dir="rtl">رواه أبو داوود وحسنه الألباني في صحيح أبي داوود (1666).</p>
                  
                  <p>
                    -ចូរជ្រាបថា « គ្មានទូអាណាមួយដែលកំណត់ឲ្យសូត្រពេលកំពុងដើរតវ៉ាហ្វ មិនថាជុំទី១ ឬទី២ ឬទីប៉ុន្មានក្តី »។
                    ដូច្នេះ ការកំណត់ឲ្យសូត្រទូអានៅជុំទី១ ឬទី២ ឬទី៣ ឬផ្សេងៗដូចមានក្នុងគីតាបមួយចំនួន វាជាពិទអះ ហើយការសូត្រទូអាខ្លាំងៗជាក្រុមៗ ដោយសំឡេងតែមួយវាជាពិទអះ ហើយស៊ុណ្ណះពេលតវ៉ាហ្វគឺ សូត្រទូអាអ្វីក៏បាន ស៊ីកៀតអ្វីក៏បាន សូត្រគួរអាន និងផ្សេងៗ ហើយអាចនិយាយគ្នាបានបើចាំបាច់។
                    ពេលតវ៉ាហ្វចប់ ត្រូវបិទស្មាទាំងពីរឲ្យជិត ហើយដើរតម្រង់ទៅកន្លែងបាតជើងណាហ្ពីអ៊ីព្រហ៊ីម និងសូត្រថា ៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى
                  </div>
                  <p>
                    ស៊ុណ្ណះ ត្រូវសឡាត២រ៉ក្អាត់នៅពីក្រោយកន្លែងបាតជើងណាហ្ពីអ៊ីព្រហ៊ីមបើសិនជាមានលទ្ធភាព តែបើគ្មានទេ អាចសឡាតនៅកន្លែងណាក៏បានដែរ ដោយសូត្រនៅរ៉ក្អាត់ទី១បន្ទាប់ពីសូត្រហ្វាទីហះសូត្រស៊ូរ៉ោះ <span className="font-amiri">قل يا أيها الكافرون</span> រ៉ក្អាត់ទី២សូត្រ <span className="font-amiri">قل هو الله أحد</span> បន្ទាប់មកដើរតម្រង់ទៅកន្លែងសាហ្វាត។
                  </p>
                  <img 
                    src="https://i.aaj.tv/primary/2022/06/171442364bf21a9.jpg" 
                    alt="Tawaf" 
                    className="w-full rounded-xl shadow-md my-4"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </section>

              {/* Section 3: Sa'i */}
              <section className="space-y-4">
                <h2 className={`text-xl font-bold font-khmer px-4 py-2 rounded-lg border-l-4 ${
                  theme === 'dark' ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                }`}>
                  ទី៣ ៖ សាអ៊ី (السعي)
                </h2>
                <div className={`font-khmer leading-loose space-y-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <p>ពេលដើរជិតដល់កន្លែងសហ្វាតស៊ុណ្ណះត្រូវសូត្រតែម្តងគត់ប៉ុណ្ណោះថា ៖</p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَآئِرِ الله
                  </div>
                  <p>
                    បន្ទាប់មកសូត្រថា <span className="font-amiri font-bold">أَبْدَأُ بِمَا بَدَأَ اللهُ بِهِ</span> រួចឡើងទៅលើកន្លែងសហ្វាតបើមានលទ្ធភាពហើយតម្រង់ទៅកាក់ហ្ពះរួចសូត្រថា ៖ <span className="font-amiri font-bold">الله أكبر</span> (៣ដង) រួចសូត្រដូចណាហ្ពីបានសូត្រគឺ ៖
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl font-bold ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`} dir="rtl">
                    اللهُ أكبَرُ، اللهُ أكبَرُ، اللهُ أكبَرُ، ويقول: لا إلهَ إلَّا اللهُ وَحْدَه لا شريكَ له، له المُلْك وله الحَمْدُ ، وهو على كلِّ شيءٍ قديرٍ، لا إلهَ إلَّا اللهُ وحدَه ، أنجَزَ وَعْدَه، ونصَرَ عَبْدَه، وهَزَمَ الأحزابَ وَحْدَه
                  </div>
                  <p>
                    ពេលឡើងទៅលើកន្លែងសហ្វាត ត្រូវតម្រង់កាក់ហ្ពះដោយលើកដៃ រួចតឹកពៀត៣ដង រួចសូត្រទូអាខាងលើ បន្ទាប់មកទូអានូវអ្វីដែលអ្នកចង់ ធ្វើដូច្នេះចំនួន៣ដងគឺ សូត្រទូអាខាងលើរួចទូអាអ្វីដែលអ្នកចង់។
                  </p>
                  <p>
                    បន្ទាប់មកចុះពីកន្លែងសហ្វាតដើរទៅកន្លែងម៉ើរវ៉ា ឡើងទៅលើ តម្រង់ទៅកាក់ហ្ពះ លើកដៃទូអាសូត្រដូចអ្វីដែលបានសូត្រនៅកន្លែងសហ្វាតចំនួន៣ដង។
                    ពេលដើរទៅវិញទៅមក «រវាងសហ្វាតនិងម៉ើរវ៉» គឺមានកន្លែងមួយដែលមានពណ៌ខៀវ ស៊ុណ្ណះចូរអ្នករត់លឿននៅចន្លោះពន្លឺខៀវនោះដូចក្នុងហាទីស បើសិនជាមានលទ្ធភាព តែបើសិនជាអ្នកមានប្រពន្ធអមជាមួយ ឬបីកូនជាដើម មិនចាំបាច់រត់ឡើយ គឺដើរធម្មតា។
                  </p>
                  <div className={`p-4 rounded-lg text-center font-amiri text-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`} dir="rtl">
                    ثبت أن النبي صلى الله عليه وسلم سعى بين الصفا والمروة وهو يقول : (لا يُقطع الأبطح إلا شَدًّا) أي : إلا عَدْواً . رواه ابن ماجه وصححه الألباني في صحيح ابن ماجه (2419) .
                  </div>
                  <p>
                    សាអ៊ីគឺ ត្រូវដើរ៧ជុំ ចាប់ផ្តើមពីសហ្វាត បញ្ចប់ដោយម៉ើរវ៉ា ពេលដើរពីសហ្វាតមកម៉ើរវ៉ា ចាត់ទុកថាជុំទី១ ហើយពីម៉ើរវ៉ាមកសហ្វាតចាត់ទុកថាជុំទី២ ។
                    នៅចន្លោះពេលកំពុងដើរសាអ៊ី « អ្នកអាចសូត្រស៊ីកៀត ទូអា សូត្រគួរអាន និងផ្សេងៗ» ។
                  </p>
                  <p>
                    ការដើរសាអ៊ីទៅវិញទៅមក៧ជុំ មិនតម្រូវឲ្យមានទឹកសំប៉ះយុំាងឡើយ។
                    ពេលកំពុងដើរសាអ៊ីពីសហ្វាតទៅម៉ើរវ៉ា គ្មានការកំណត់ទូអាណាមួយឡើយ ដូច្នេះ រាល់ការកំណត់ឲ្យសូត្រទូអាណាមួយពេលកំពុងដើរសាអ៊ី វាជាពិទអះ ការសូត្រទូអា ឬស៊ីកៀតជា ក្រុមៗ មានមេដឹកនាំឲ្យសូត្រតាមពីក្រោយ ដោយសំឡេងតែមួយ «វាជាពិទអះ»។
                  </p>
                  <img 
                    src="https://www.madaninews.id/wp-content/uploads/2018/07/sai.jpg" 
                    alt="Sa'i" 
                    className="w-full rounded-xl shadow-md my-4"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </section>

              {/* Section 4: Shaving */}
              <section className="space-y-4">
                <h2 className={`text-xl font-bold font-khmer px-4 py-2 rounded-lg border-l-4 ${
                  theme === 'dark' ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                }`}>
                  ទី៤ ៖ កោរសក់ ឬកាត់សក់
                </h2>
                <div className={`font-khmer leading-loose space-y-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <p>
                    បើសិនជាអ្នកបានដើរសាអ៊ី៧ជុំរួហើយ វ៉ាជិបគឺ ត្រូវកោរសក់ ឬកាត់សក់សំរាប់បុរស។
                  </p>
                  <p>
                    -រីឯស្រ្តីវិញគឺ គ្រាន់តែយកសក់របស់នាងមួយថ្នាំងម្រាមដៃកាត់តែប៉ុណ្ណោះ ពីព្រោះ សក់ស្រ្តីជាផ្នែកមួយដែលធ្វើឲ្យនាងស្រស់ស្អាត មិនតម្រូវឲ្យកោរឡើយ។
                  </p>
                  <p>
                    - តែសំរាប់បុរសវិញ ស៊ុណ្ណះគឺកោរសក់ល្អជាងកាត់ ដូចក្នុងហាទីសមូស្លីមលេខ(១៣០៣) « ណាហ្ពីបានទូអាឲ្យអល់ឡោះអភ័យទោសដល់អ្នកដែលកោរសក់ដល់ទៅ៣ដង រីឯអ្នកដែលកាត់វិញតែ១ដងប៉ុណ្ណោះ »។
                  </p>
                  <p>
                    -ការកោរសក់ ឬកាត់សក់ ត្រូវកាត់ឲ្យសព្វលើក្បាល មិនត្រូវកោរឬកាត់កន្លែងខ្លះ ហើយចោលកន្លែងខ្លះនោះទេ។
                  </p>
                  <img 
                    src="https://islamonline.net/wp-content/uploads/2022/06/Hajj-pilgrims-shaving-hair-1.jpg" 
                    alt="Shaving" 
                    className="w-full rounded-xl shadow-md my-4"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </section>

              <div className={`mt-8 p-4 rounded-lg text-sm text-center ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                <p className="font-khmer">ដោយ៖ ស្លេះ ម៉ាត់លី</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj_rtUVMnw_uYPN0D1tx3mJ6olysGIjJXOU8x97FtAebGC4ukiJ9GEc1Ob55NKhwK9Ekczexe4NOJYmQ7OTjPHefXvEux9OYaFTpvibR49kkW8pdoYfmFIW6hZ3SzNHACqTv3joUQMY7DXwT-3iqEvzVuPJ7p9KDdiYIge_8VnBOO-6Y5wrO8SaIMWyuiA/s1600/87284581_3252238754803393_304879155449692160_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQx1g-wBy3VdyANGAViU9DV9C_FgqQmcutgKB8lkvuxfaa5iQmMREhnJJ1SyK8H-Ntv1oF10l3qUD_vIXwfB_TJ1N_t7OWcf056OtpGdYK_UZgClfcAlti2BfImmKg5o1Bwb2Cc759ud9pvpxDg6TBwBCMcfxNVlZa2AB8NDL7b1-FVTD7sbp6eZmEqsA/s1600/87037157_3252239071470028_2038680774793756672_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjXjL7F0XGSMLaS1f9jqiO1HULLDLeV4_G4RAqAfeZFSbt2ifTLDXzgRHxKITycz2tcOE3nmj10rDdr2S44wZ1cSnf5KVxDjC_LY3sjPbbkwYHXD9BVpyhs41ef-5VJfQIWizApiUyGJlfFIpSCyYt4h07lrtR_lXFVe25p3d4MzQwAY7iAyktIZctOMnA/s1600/87100197_3252239274803341_8197606754192719872_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj1IgYG-ZaFukFUxc-Q_fdDeWiyjya6ncirBX9AmE9kJ0CWoJt3661ORFOvN_Jo7V2u3ebNZ7-0kgwra7_cahABTdOR0ZeUWoWt47-e6lxAY6pUxTeeS7su0f8CGoATn59h5z1y59jF58ALBoeRotx7xEPx1p6uZpzxCz-JaVP9fW_L8jKS-UPYht653uE/s1600/87084352_3252239574803311_6122112710898352128_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj64yHyJXmXddIpP4gKToFrlfKcF4Rwmf6OECZaC7qrpvoUpzTCrrbfRu7TULF4-T1aiQQ6uskxPyuAMGXLSrEZK4bq5QpZdteTBMTACowQzskUScDK0HLBVMs1s5bykgVXqyVJgmfIuCOSVbvPov7V_BNkS6E8S26EdEJUaMsByff43EKfsvV9K-f_pd0/s1600/87151187_3252239924803276_8903746630885310464_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBapi9WI8iVLMAkkJo29ZYr0ifXzjbPU2WpbsfZaH-iLjQkrpZsGrKZQ8vx07TADul2fqtWwWOLiMO0KZnupeEXhb9GugoxnNk6EHmvhtSOrdpzA2L3pRsoDqOptiQSJpf1Q2Fj4FTb6nof3IZnf_qDUnfPH7dXaIlSUeMvBPBtPaLZVil0_RuIboxPZ8/s1600/87073245_3252239694803299_1821755776402718720_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgtw6jUhNNQ8yKVgtep5wW3pNpEaH6NiJ3DxNzaQVvHJ9s88Rel-Wm5RLAnWFE9fo_yf4Js7F47bVNXYRVhw1to14m1HBPruwPfYQd2WiC1BL7wGforY4XZOyS-a_8SV5c_kBFFMQCbh-RavSHfMLIRDlj6lZ2D0-M4cBNCuhmTZG5tNnD7DEk7XV2Zrcc/s1600/86970380_3252240061469929_5542659745074118656_n.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhqn8ycqNcnS2skSVmess3etHuGFSkiZoxKm2v7Gi5RxWOECnT0g_KrUNqo6VSk8HJWDKplBwAgf7z7USIFn_s055Kx9KK18Ki2lYPaE1r2IBQcGlIFhObOKrMZDBWf2OqxtDIMyRdgBOUbqEf0c5cryI1-h9dWBZSdhSUie1x8PwrlF_EcJzr31xJgbDQ/s1600/87096067_3252240224803246_9186847780998479872_n.jpg"
              ].map((src, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-800">
                  <img src={src} alt={`Umrah step ${index + 1}`} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'books' && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                <h2 className="font-bold font-khmer text-lg">សេចក្តីណែនាំអំពី របៀបធ្វើហាជី នឹងអ៊ុំរ៉ោះ</h2>
              </div>
              <iframe 
                src="https://drive.google.com/embeddedfolderview?id=19SnpMMgZKLJGK--AOLueIk_m2vBxo1xF#grid" 
                className="w-full h-full border-0"
                title="Umrah Books"
              />
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="rounded-xl overflow-hidden shadow-lg bg-black">
                <div className="aspect-video w-full">
                  <iframe 
                    src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2F100053174625247%2Fvideos%2F2904026666405382%2F&show_text=false&width=560&t=0" 
                    className="w-full h-full border-0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Umrah Video"
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="font-bold font-khmer text-lg mb-2">របៀបធ្វើអុំរ៉ោះ - ក្រុមហ៊ុន យូណេះ ហាជ្ជី និង អុំរ៉ោះ</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-khmer">
                  វីដេអូបង្ហាញអំពីរបៀបនៃការធ្វើអុំរ៉ោះដោយលម្អិត។
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
