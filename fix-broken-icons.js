
import fs from 'fs';
import path from 'path';

const ICON_MAP = {
  'ZoomIn': 'ZoomInAreaIcon',
  'ZoomOut': 'ZoomOutAreaIcon',
  'RotateCw': 'RotateClockwiseIcon',
  'Sliders': 'SlidersHorizontalIcon',
  'Palette': 'ColorsIcon',
  'RefreshCcw': 'ReloadIcon',
  'Contrast': 'Sun01Icon',
  'BadgeCheck': 'SecurityCheckIcon',
  'AlertTriangle': 'Alert02Icon',
  'Bold': 'TextBoldIcon',
  'Italic': 'TextItalicIcon',
  'Underline': 'TextUnderlineIcon',
  'Heading1': 'Heading01Icon',
  'Heading2': 'Heading02Icon',
  'Heading3': 'Heading03Icon',
  'ListOrdered': 'TextNumberSignIcon',
  'AlignCenter': 'TextAlignCenterIcon',
  'Pilcrow': 'ParagraphIcon',
  'Undo2': 'UndoIcon',
  'BoxSelect': 'Select01Icon',
  'LayoutGrid': 'LayoutGridIcon',
  'Gavel': 'LegalHammerIcon',
  'Map': 'MapsIcon',
  'Phone': 'CallIcon',
  'Edit2': 'Edit02Icon',
  'Utensils': 'Restaurant01Icon',
  'Landmark': 'BankIcon',
  'CloudRain': 'RainIcon',
  'ScrollText': 'ScrollIcon',
  'ShieldCheck': 'SecurityCheckIcon',
  'ScanLine': 'ScanIcon',
  'Grip': 'DragDropIcon',
  'MessageSquare': 'Comment01Icon',
  'Hash': 'HashtagIcon',
  'Minimize2': 'Minimize01Icon',
  'Languages': 'LanguageCircleIcon',
  'ListPlus': 'Playlist01Icon',
  'Vibrate': 'Notification01Icon',
  'History': 'Time01Icon'
};

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasReplacements = false;
  let newImports = new Set();

  Object.keys(ICON_MAP).forEach(brokenIcon => {
    const hugeName = ICON_MAP[brokenIcon];
    // Regex to find <BrokenIcon ... /> or <BrokenIcon>
    const usageRegex = new RegExp(`<${brokenIcon}(\\s|/>|>)`, 'g');
    
    if (usageRegex.test(newContent)) {
      hasReplacements = true;
      newImports.add(hugeName);
      newContent = newContent.replace(usageRegex, (match, p1) => {
        return `<HugeiconsIcon icon={${hugeName}} strokeWidth={1.5}${p1}`;
      });
    }
  });

  if (hasReplacements) {
    // Add imports
    const hugeReactImport = `import { HugeiconsIcon } from '@hugeicons/react';\n`;
    const hugeCoreImport = `import { ${Array.from(newImports).join(', ')} } from '@hugeicons/core-free-icons';\n`;

    if (!newContent.includes(`from '@hugeicons/react'`)) {
        newContent = hugeReactImport + hugeCoreImport + newContent;
    } else {
        // If imports exist, we try to append to the existing import line if possible, 
        // or just add a new line. Adding a new line is safer for a simple script.
        // But we should check if HugeiconsIcon is already imported.
        if (!newContent.includes('HugeiconsIcon')) {
             newContent = hugeReactImport + newContent;
        }
        newContent = hugeCoreImport + newContent;
    }

    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);
  }
}

const files = findFiles('.');
files.forEach(processFile);
