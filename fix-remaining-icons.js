
import fs from 'fs';
import path from 'path';

const ICON_MAP = {
  'Home': 'Home01Icon',
  'Users': 'UserGroupIcon',
  'Book': 'BookOpen01Icon',
  'LibraryBig': 'LibraryIcon',
  'Moon': 'Moon01Icon',
  'CalendarRange': 'Calendar01Icon',
  'Tag': 'Tag01Icon',
  'Smile': 'HappyIcon',
  'MapPin': 'Location01Icon',
  'Video': 'VideoReplayIcon',
  'Type': 'TextFontIcon',
  'User': 'UserIcon',
  'Calendar': 'Calendar01Icon',
  'Film': 'Film01Icon',
  'Store': 'Store01Icon',
  'FileText': 'File01Icon',
  'Mic': 'Mic01Icon',
  'BarChart2': 'ChartBarLineIcon',
  'BookOpen': 'BookOpen01Icon',
  'HandHeart': 'CharityIcon',
  'Heading1': 'Heading01Icon',
  'Heading2': 'Heading02Icon',
  'Heading3': 'Heading03Icon',
  'AlignCenter': 'TextAlignCenterIcon',
  'AlignRight': 'TextAlignRightIcon',
  'AlignLeft': 'TextAlignLeftIcon',
  'Bold': 'TextBoldIcon',
  'Italic': 'TextItalicIcon',
  'Underline': 'TextUnderlineIcon',
  'List': 'LeftToRightListBulletIcon',
  'ListOrdered': 'LeftToRightListNumberIcon',
  'Quote': 'QuoteUpIcon',
  'Undo': 'ArrowTurnBackwardIcon',
  'LayoutGrid': 'LayoutGridIcon',
  'Square': 'SquareIcon',
  'Columns': 'LayoutTwoColumnIcon',
  'Rows': 'LayoutTwoRowIcon',
  'Layers': 'Layers01Icon',
  'Move': 'MoveIcon',
  'Sliders': 'SlidersHorizontalIcon',
  'Sun': 'Sun01Icon',
  'Heart': 'FavouriteIcon',
  'Landmark': 'BankIcon',
  'Car': 'Car01Icon',
  'CloudRain': 'RainIcon',
  'ThumbsUp': 'ThumbsUpIcon',
  'Coffee': 'Coffee01Icon',
  'Activity': 'Activity01Icon',
  'Sunrise': 'SunriseIcon',
  'Cloud': 'CloudIcon',
  'Sunset': 'SunsetIcon',
  'Mic2': 'Mic02Icon',
  'Brain': 'Brain01Icon',
  'Bookmark': 'Bookmark01Icon',
  'Edit3': 'Edit02Icon',
  'DownloadCloud': 'Download01Icon',
  'Utensils': 'Restaurant01Icon',
  'ShoppingBag': 'ShoppingBag01Icon',
  'MapIcon': 'MapsIcon',
  'SlidersHorizontalIcon': 'SlidersHorizontalIcon',
  'Sun01Icon': 'Sun01Icon'
};

const FILES_TO_FIX = [
  'components/FrameEditor.tsx',
  'components/Navigation.tsx',
  'components/community/CreatePostModal.tsx',
  'components/community/FeedView.tsx',
  'components/community/create-post/ActionMenu.tsx',
  'components/community/create-post/RichTextEditor.tsx',
  'components/community/create-post/image/ImageLayoutSelector.tsx',
  'components/community/feed/LeftSidebar.tsx',
  'components/frames/EditorView.tsx',
  'components/hisnul-muslim/HisnulMuslimView.tsx',
  'components/hisnul-muslim/data.ts',
  'components/qada/QadaView.tsx',
  'components/quran/QuranSidebar.tsx',
  'components/quran/QuranView.tsx'
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasReplacements = false;
  let newImports = new Set();

  // 1. Replace usages
  Object.keys(ICON_MAP).forEach(lucideIcon => {
    const hugeName = ICON_MAP[lucideIcon];
    
    // Replace <LucideIcon ... />
    const tagRegex = new RegExp(`<${lucideIcon}(\\s|/>|>)`, 'g');
    if (tagRegex.test(newContent)) {
        hasReplacements = true;
        newImports.add(hugeName);
        newContent = newContent.replace(tagRegex, (match, p1) => {
            return `<HugeiconsIcon icon={${hugeName}} strokeWidth={1.5}${p1}`;
        });
    }

    // Replace identifier usages (e.g. icon: LucideIcon, [LucideIcon], etc.)
    // We look for the word boundary, but exclude import statements and JSX tags (handled above)
    // This is tricky. Let's target specific patterns seen in errors.
    
    const patterns = [
        `icon:\\s*${lucideIcon}\\b`, // icon: Icon
        `\\[\\s*${lucideIcon}\\b`,   // [Icon
        `,\\s*${lucideIcon}\\b`,      // , Icon
        `=\\s*${lucideIcon}\\b`,      // = Icon
        `:\\s*${lucideIcon}\\b`,      // : Icon
        `\\(\\s*${lucideIcon}\\b`     // (Icon
    ];
    
    patterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'g');
        if (regex.test(newContent)) {
            hasReplacements = true;
            newImports.add(hugeName);
            newContent = newContent.replace(regex, (match) => {
                return match.replace(lucideIcon, hugeName);
            });
        }
    });
  });

  // 2. Consolidate Imports
  // Find all existing imports from @hugeicons/core-free-icons
  const lines = newContent.split('\n');
  const coreImportLines = lines.filter(l => l.includes(`from '@hugeicons/core-free-icons'`));
  
  if (coreImportLines.length > 0 || hasReplacements) {
      // Extract existing imports
      coreImportLines.forEach(line => {
          const match = line.match(/import\s+{([^}]*)}\s+from/);
          if (match) {
              match[1].split(',').map(s => s.trim()).filter(s => s).forEach(i => newImports.add(i));
          }
      });
      
      // Remove old core import lines
      newContent = lines.filter(l => !l.includes(`from '@hugeicons/core-free-icons'`)).join('\n');
      
      // Remove lucide-react imports
      newContent = newContent.replace(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?\n?/g, '');
      
      // Add consolidated import
      const sortedImports = Array.from(newImports).sort().join(', ');
      const consolidatedImport = `import { ${sortedImports} } from '@hugeicons/core-free-icons';\n`;
      
      // Add HugeiconsIcon import if missing
      if (!newContent.includes(`from '@hugeicons/react'`)) {
          newContent = `import { HugeiconsIcon } from '@hugeicons/react';\n` + consolidatedImport + newContent;
      } else {
          // Find where HugeiconsIcon is imported and add core import after it
          const parts = newContent.split(`from '@hugeicons/react';`);
          if (parts.length > 1) {
              newContent = parts[0] + `from '@hugeicons/react';\n` + consolidatedImport + parts.slice(1).join(`from '@hugeicons/react';`);
          } else {
              // Fallback
              newContent = consolidatedImport + newContent;
          }
      }
      
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed ${filePath}`);
  }
}

FILES_TO_FIX.forEach(processFile);
