

import fs from 'fs';
import path from 'path';

const ICON_MAP = {
  'X': 'Cancel01Icon',
  'Check': 'Tick01Icon',
  'Plus': 'Add01Icon',
  'Minus': 'MinusSignIcon',
  'Search': 'Search01Icon',
  'Menu': 'Menu01Icon',
  'Home': 'Home01Icon',
  'User': 'UserIcon',
  'Settings': 'Settings01Icon',
  'ChevronRight': 'ArrowRight01Icon',
  'ChevronLeft': 'ArrowLeft01Icon',
  'ChevronDown': 'ArrowDown01Icon',
  'ChevronUp': 'ArrowUp01Icon',
  'Edit3': 'Edit02Icon',
  'Trash2': 'Delete02Icon',
  'Share2': 'Share01Icon',
  'ExternalLink': 'LinkSquare01Icon',
  'LogOut': 'Logout01Icon',
  'HelpCircle': 'HelpCircleIcon',
  'AlertCircle': 'AlertCircleIcon',
  'Info': 'InformationCircleIcon',
  'MoreHorizontal': 'MoreHorizontalIcon',
  'MoreVertical': 'MoreVerticalIcon',
  'Loader2': 'Loading02Icon',
  'RefreshCw': 'RefreshIcon',
  'RotateCcw': 'ReloadIcon',
  'ArrowLeft': 'ArrowLeft01Icon',
  'ArrowRight': 'ArrowRight01Icon',
  'Calendar': 'Calendar01Icon',
  'Clock': 'Clock01Icon',
  'MapPin': 'Location01Icon',
  'Filter': 'FilterHorizontalIcon',
  'List': 'ListViewIcon',
  'Grid': 'GridViewIcon',
  'LayoutGrid': 'LayoutGridIcon',
  'BookOpen': 'BookOpen01Icon',
  'Bookmark': 'Bookmark01Icon',
  'Heart': 'FavouriteIcon',
  'Star': 'StarIcon',
  'Bell': 'Notification01Icon',
  'Play': 'PlayIcon',
  'Pause': 'PauseIcon',
  'Volume2': 'VolumeHighIcon',
  'VolumeX': 'VolumeOffIcon',
  'Maximize2': 'Maximize01Icon',
  'Download': 'Download01Icon',
  'Upload': 'Upload01Icon',
  'Link': 'Link01Icon',
  'Mail': 'Mail01Icon',
  'Phone': 'CallIcon',
  'MessageCircle': 'Comment01Icon',
  'ThumbsUp': 'ThumbsUpIcon',
  'Image': 'Image01Icon',
  'Camera': 'Camera01Icon',
  'Video': 'Video01Icon',
  'Mic': 'Mic01Icon',
  'Mic2': 'Mic02Icon',
  'Globe': 'Globe02Icon',
  'Moon': 'Moon01Icon',
  'Sun': 'Sun01Icon',
  'Cloud': 'CloudIcon',
  'Coffee': 'Coffee01Icon',
  'Save': 'FloppyDiskIcon',
  'Copy': 'Copy01Icon',
  'Eye': 'ViewIcon',
  'EyeOff': 'ViewOffIcon',
  'Lock': 'LockIcon',
  'Unlock': 'UnlockIcon',
  'Shield': 'SecurityIcon',
  'Zap': 'FlashIcon',
  'Activity': 'Activity01Icon',
  'BarChart2': 'ChartBarLineIcon',
  'DollarSign': 'Dollar01Icon',
  'CreditCard': 'CreditCardIcon',
  'ShoppingBag': 'ShoppingBag01Icon',
  'ShoppingCart': 'ShoppingCart01Icon',
  'Truck': 'DeliveryTruck01Icon',
  'Users': 'UserGroupIcon',
  'Smile': 'HappyIcon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'Circle': 'CircleIcon',
  'ArrowRight': 'ArrowRight01Icon',
  'ArrowLeft': 'ArrowLeft01Icon',
  'ArrowUp': 'ArrowUp01Icon',
  'ArrowDown': 'ArrowDown01Icon',
  'Layout': 'Layout01Icon',
  'Columns': 'LayoutTwoColumnIcon',
  'Rows': 'LayoutTwoRowIcon',
  'Square': 'SquareIcon',
  'StretchHorizontal': 'HorizontalResizeIcon',
  'Type': 'TextIcon',
  'Map': 'MapsIcon',
  'Tag': 'Tag01Icon',
  'Book': 'Book01Icon',
  'Store': 'Store01Icon',
  'HandHeart': 'CharityIcon',
  'FileText': 'File01Icon',
  'ZoomIn': 'ZoomInAreaIcon',
  'ZoomOut': 'ZoomOutAreaIcon',
  'TrendingUp': 'AnalyticsUpIcon',
  'Music': 'MusicNote01Icon',
  'Film': 'Film01Icon',
  'PlayCircle': 'PlayCircleIcon',
  'Calculator': 'Calculator01Icon',
  'Coins': 'Coins01Icon',
  'Facebook': 'Facebook01Icon',
  'Send': 'SentIcon',
  'Monitor': 'ComputerIcon',
  'Sparkles': 'CleanIcon',
  'Gauge': 'DashboardSpeed01Icon',
  'SkipBack': 'PreviousIcon',
  'SkipForward': 'NextIcon',
  'SlidersHorizontal': 'FilterHorizontalIcon',
  'Target': 'Target01Icon',
  'ArrowDownUp': 'ArrowUpDownIcon',
  'Brain': 'Brain01Icon',
  'DownloadCloud': 'CloudDownloadIcon',
  'History': 'Time01Icon',
  'Vibrate': 'Notification01Icon',
  'Filter': 'FilterIcon',
  'Baby': 'Baby01Icon',
  'LogOut': 'Logout01Icon',
  'Lightbulb': 'BulbIcon',
  'Trophy': 'ChampionIcon',
  'Library': 'LibraryIcon',
  'ListFilter': 'FilterIcon',
  'MoreHorizontal': 'MoreHorizontalIcon',
  'MoreVertical': 'MoreVerticalIcon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'AlertCircle': 'AlertCircleIcon',
  'HelpCircle': 'HelpCircleIcon',
  'Layers': 'Layers01Icon',
  'Gem': 'GemIcon',
  'Gavel': 'LegalHammerIcon',
  'Hourglass': 'HourglassIcon',
  'Sunrise': 'SunriseIcon',
  'Sunset': 'SunsetIcon',
  'Shuffle': 'ShuffleIcon',
  'ListMusic': 'Playlist01Icon',
  'Compass': 'Compass01Icon',
  'CalendarRange': 'Calendar01Icon',
  'Headphones': 'HeadphonesIcon',
  'LibraryBig': 'LibraryIcon',
  'Navigation': 'Navigation01Icon',
  'Baby': 'Baby01Icon',
  'Shield': 'SecurityIcon',
  'Bookmark': 'Bookmark01Icon',
  'Clock': 'Clock01Icon',
  'Trash2': 'Delete02Icon',
  'Circle': 'CircleIcon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'X': 'Cancel01Icon',
  'User': 'UserIcon',
  'Settings': 'Settings01Icon',
  'LogOut': 'Logout01Icon',
  'Bell': 'Notification01Icon',
  'Heart': 'FavouriteIcon',
  'Search': 'Search01Icon',
  'Filter': 'FilterIcon',
  'ChevronRight': 'ArrowRight01Icon',
  'ChevronLeft': 'ArrowLeft01Icon',
  'ChevronDown': 'ArrowDown01Icon',
  'ChevronUp': 'ArrowUp01Icon',
  'Play': 'PlayIcon',
  'Pause': 'PauseIcon',
  'Share2': 'Share01Icon',
  'Upload': 'Upload01Icon',
  'ExternalLink': 'LinkSquare01Icon',
  'RotateCcw': 'ReloadIcon',
  'ListMusic': 'Playlist01Icon',
  'Download': 'Download01Icon',
  'Maximize2': 'Maximize01Icon',
  'Image': 'Image01Icon',
  'MapPin': 'Location01Icon',
  'Store': 'Store01Icon',
  'BarChart2': 'ChartBarLineIcon',
  'HandHeart': 'CharityIcon',
  'BookOpen': 'BookOpen01Icon',
  'Quote': 'QuoteDownIcon',
  'MessageCircle': 'Comment01Icon',
  'ThumbsUp': 'ThumbsUpIcon',
  'FileText': 'File01Icon',
  'Check': 'Tick01Icon',
  'Globe': 'Globe02Icon',
  'MoreHorizontal': 'MoreHorizontalIcon',
  'Plus': 'Add01Icon',
  'TrendingUp': 'AnalyticsUpIcon',
  'Home': 'Home01Icon',
  'PlayCircle': 'PlayCircleIcon',
  'Film': 'Film01Icon',
  'Music': 'MusicNote01Icon',
  'Calculator': 'Calculator01Icon',
  'DollarSign': 'Dollar01Icon',
  'Info': 'InformationCircleIcon',
  'RefreshCw': 'RefreshIcon',
  'Coins': 'Coins01Icon',
  'Edit3': 'Edit02Icon',
  'Trash2': 'Delete02Icon',
  'Save': 'FloppyDiskIcon',
  'Facebook': 'Facebook01Icon',
  'Send': 'SentIcon',
  'Link': 'Link01Icon',
  'Type': 'TextIcon',
  'Volume2': 'VolumeHighIcon',
  'Monitor': 'ComputerIcon',
  'Sparkles': 'CleanIcon',
  'Gauge': 'DashboardSpeed01Icon',
  'SkipBack': 'PreviousIcon',
  'SkipForward': 'NextIcon',
  'Bookmark': 'Bookmark01Icon',
  'Brain': 'Brain01Icon',
  'DownloadCloud': 'CloudDownloadIcon',
  'Mic2': 'Mic02Icon',
  'Menu': 'Menu01Icon',
  'Search': 'Search01Icon',
  'Settings': 'Settings01Icon',
  'Maximize2': 'Maximize01Icon',
  'SlidersHorizontal': 'FilterHorizontalIcon',
  'List': 'ListViewIcon',
  'LayoutGrid': 'LayoutGridIcon',
  'ArrowDownUp': 'ArrowUpDownIcon',
  'RotateCcw': 'ReloadIcon',
  'VolumeX': 'VolumeOffIcon',
  'Vibrate': 'Notification01Icon',
  'History': 'Time01Icon',
  'Filter': 'FilterIcon',
  'Baby': 'Baby01Icon',
  'Copy': 'Copy01Icon',
  'User': 'UserIcon',
  'Moon': 'Moon01Icon',
  'CalendarRange': 'Calendar01Icon',
  'Compass': 'Compass01Icon',
  'Book': 'Book01Icon',
  'Headphones': 'HeadphonesIcon',
  'LibraryBig': 'LibraryIcon',
  'Users': 'UserGroupIcon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'ArrowLeft': 'ArrowLeft01Icon',
  'Lightbulb': 'BulbIcon',
  'Map': 'MapsIcon',
  'ArrowRight': 'ArrowRight01Icon',
  'Star': 'StarIcon',
  'Trophy': 'ChampionIcon',
  'MoreVertical': 'MoreVerticalIcon',
  'Bell': 'Notification01Icon',
  'Library': 'LibraryIcon',
  'ListFilter': 'FilterIcon',
  'Camera': 'Camera01Icon',
  'Mail': 'Mail01Icon',
  'AlertCircle': 'AlertCircleIcon',
  'Navigation': 'Navigation01Icon',
  'HelpCircle': 'HelpCircleIcon',
  'Layers': 'Layers01Icon',
  'Gem': 'GemIcon',
  'Gavel': 'LegalHammerIcon',
  'Hourglass': 'HourglassIcon',
  'Minus': 'MinusSignIcon',
  'ClipboardList': 'ClipboardIcon',
  'Sun': 'Sun01Icon',
  'Sunrise': 'SunriseIcon',
  'Sunset': 'SunsetIcon',
  'Cloud': 'CloudIcon',
  'Coffee': 'Coffee01Icon',
  'Shuffle': 'ShuffleIcon',
  'GripHorizontal': 'DragDropHorizontalIcon',
  'Eye': 'ViewIcon',
  'LayoutGrid': 'LayoutGridIcon',
  'StretchHorizontal': 'HorizontalResizeIcon',
  'Square': 'SquareIcon',
  'Columns': 'LayoutTwoColumnIcon',
  'Rows': 'LayoutTwoRowIcon',
  'Tag': 'Tag01Icon',
  'Smile': 'HappyIcon',
  'MapPin': 'Location01Icon',
  'Video': 'Video01Icon',
  'Type': 'TextIcon',
  'Calendar': 'Calendar01Icon',
  'Mic': 'Mic01Icon',
  'Store': 'Store01Icon',
  'BarChart2': 'ChartBarLineIcon',
  'HandHeart': 'CharityIcon',
  'FileText': 'File01Icon',
  'ArrowLeft': 'ArrowLeft01Icon',
  'Share2': 'Share01Icon',
  'MoreHorizontal': 'MoreHorizontalIcon',
  'List': 'ListViewIcon',
  'X': 'Cancel01Icon',
  'Clock': 'Clock01Icon',
  'ThumbsUp': 'ThumbsUpIcon',
  'MessageCircle': 'Comment01Icon',
  'ChevronLeft': 'ArrowLeft01Icon',
  'ChevronRight': 'ArrowRight01Icon',
  'ZoomIn': 'ZoomInAreaIcon',
  'ZoomOut': 'ZoomOutAreaIcon',
  'Check': 'Tick01Icon',
  'Play': 'PlayIcon',
  'Quote': 'QuoteDownIcon',
  'Globe': 'Globe02Icon',
  'Plus': 'Add01Icon',
  'TrendingUp': 'AnalyticsUpIcon',
  'Home': 'Home01Icon',
  'PlayCircle': 'PlayCircleIcon',
  'Film': 'Film01Icon',
  'Music': 'MusicNote01Icon',
  'Image': 'Image01Icon',
  'Calculator': 'Calculator01Icon',
  'DollarSign': 'Dollar01Icon',
  'Info': 'InformationCircleIcon',
  'RefreshCw': 'RefreshIcon',
  'Coins': 'Coins01Icon',
  'Edit3': 'Edit02Icon',
  'Trash2': 'Delete02Icon',
  'Save': 'FloppyDiskIcon',
  'Facebook': 'Facebook01Icon',
  'Send': 'SentIcon',
  'Link': 'Link01Icon',
  'Volume2': 'VolumeHighIcon',
  'Monitor': 'ComputerIcon',
  'Sparkles': 'CleanIcon',
  'Gauge': 'DashboardSpeed01Icon',
  'SkipBack': 'PreviousIcon',
  'SkipForward': 'NextIcon',
  'BookOpen': 'BookOpen01Icon',
  'Bookmark': 'Bookmark01Icon',
  'Brain': 'Brain01Icon',
  'DownloadCloud': 'CloudDownloadIcon',
  'Mic2': 'Mic02Icon',
  'Menu': 'Menu01Icon',
  'Search': 'Search01Icon',
  'Settings': 'Settings01Icon',
  'ChevronDown': 'ArrowDown01Icon',
  'ChevronUp': 'ArrowUp01Icon',
  'Maximize2': 'Maximize01Icon',
  'SlidersHorizontal': 'FilterHorizontalIcon',
  'LayoutGrid': 'LayoutGridIcon',
  'ArrowDownUp': 'ArrowUpDownIcon',
  'RotateCcw': 'ReloadIcon',
  'VolumeX': 'VolumeOffIcon',
  'Vibrate': 'Notification01Icon',
  'History': 'Time01Icon',
  'Download': 'Download01Icon',
  'Filter': 'FilterIcon',
  'Baby': 'Baby01Icon',
  'Copy': 'Copy01Icon',
  'User': 'UserIcon',
  'Moon': 'Moon01Icon',
  'CalendarRange': 'Calendar01Icon',
  'Compass': 'Compass01Icon',
  'Book': 'Book01Icon',
  'Headphones': 'HeadphonesIcon',
  'LibraryBig': 'LibraryIcon',
  'Users': 'UserGroupIcon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'Lightbulb': 'BulbIcon',
  'Map': 'MapsIcon',
  'ArrowRight': 'ArrowRight01Icon',
  'Star': 'StarIcon',
  'Trophy': 'ChampionIcon',
  'MoreVertical': 'MoreVerticalIcon',
  'Bell': 'Notification01Icon',
  'Library': 'LibraryIcon',
  'ListFilter': 'FilterIcon',
  'Camera': 'Camera01Icon',
  'Mail': 'Mail01Icon',
  'AlertCircle': 'AlertCircleIcon',
  'Navigation': 'Navigation01Icon',
  'HelpCircle': 'HelpCircleIcon',
  'Layers': 'Layers01Icon',
  'Gem': 'GemIcon',
  'Gavel': 'LegalHammerIcon',
  'Hourglass': 'HourglassIcon',
  'Minus': 'MinusSignIcon',
  'ClipboardList': 'ClipboardIcon',
  'Sun': 'Sun01Icon',
  'Sunrise': 'SunriseIcon',
  'Sunset': 'SunsetIcon',
  'Cloud': 'CloudIcon',
  'Coffee': 'Coffee01Icon',
  'Shuffle': 'ShuffleIcon',
  'ListMusic': 'Playlist01Icon',
  'LogOut': 'Logout01Icon',
  'Heart': 'FavouriteIcon',
  'Circle': 'CircleIcon',
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
  'History': 'Time01Icon',
  'Vibrate': 'Notification01Icon'
};

// Helper to find files
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

// Helper to get available Hugeicons
function getAvailableIcons() {
  const dir = path.join('node_modules', '@hugeicons', 'core-free-icons', 'dist', 'esm');
  if (!fs.existsSync(dir)) return new Set();
  const files = fs.readdirSync(dir);
  const icons = new Set();
  files.forEach(file => {
    if (file.endsWith('.js')) {
      icons.add(file.replace('.js', ''));
    }
  });
  return icons;
}

const availableIcons = getAvailableIcons();

function getHugeIconName(lucideName) {
  if (ICON_MAP[lucideName]) {
    const mapped = ICON_MAP[lucideName];
    if (availableIcons.has(mapped)) return mapped;
    // Try to find a fallback if mapped one doesn't exist
    console.warn(`Mapped icon ${mapped} for ${lucideName} not found in available icons.`);
  }

  // Try heuristics
  const candidates = [
    `${lucideName}Icon`,
    `${lucideName}01Icon`,
    `${lucideName}02Icon`
  ];

  for (const candidate of candidates) {
    if (availableIcons.has(candidate)) return candidate;
  }

  return null;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find Lucide imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
  let match;
  let hasReplacements = false;
  let newImports = new Set();
  
  let newContent = content;
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullImport = match[0];
    const importedIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
    
    let replacementMap = {};
    let keptIcons = [];
    
    importedIcons.forEach(icon => {
      // Handle aliases: import { Menu as MenuIcon } from ...
      const parts = icon.split(/\s+as\s+/);
      const originalName = parts[0];
      const aliasName = parts[1] || originalName;
      
      const hugeName = getHugeIconName(originalName);
      
      if (hugeName) {
        replacementMap[aliasName] = hugeName;
        newImports.add(hugeName);
      } else {
        console.warn(`Could not find Hugeicon replacement for ${originalName} in ${filePath}`);
        keptIcons.push(icon); // Keep the original import string (including alias if any)
      }
    });
    
    if (Object.keys(replacementMap).length > 0) {
      hasReplacements = true;
      
      // Replace the Lucide import
      if (keptIcons.length > 0) {
        const newImportLine = `import { ${keptIcons.join(', ')} } from 'lucide-react';`;
        newContent = newContent.replace(fullImport, newImportLine);
      } else {
        newContent = newContent.replace(fullImport, '');
      }
      
      // Replace usages
      Object.keys(replacementMap).forEach(aliasName => {
        const hugeName = replacementMap[aliasName];
        // Regex to replace <IconName ... /> with <HugeiconsIcon icon={HugeName} ... />
        const usageRegex = new RegExp(`<${aliasName}(\\s|/>|>)`, 'g');
        newContent = newContent.replace(usageRegex, (match, p1) => {
            return `<HugeiconsIcon icon={${hugeName}} strokeWidth={1.5}${p1}`;
        });
      });
    }
  }
  
  if (hasReplacements) {
    // Add new imports
    const hugeReactImport = `import { HugeiconsIcon } from '@hugeicons/react';\n`;
    const hugeCoreImport = `import { ${Array.from(newImports).join(', ')} } from '@hugeicons/core-free-icons';\n`;
    
    // Insert imports at the top
    // Check if imports already exist to avoid duplication if we run script multiple times
    if (!newContent.includes(`from '@hugeicons/react'`)) {
        newContent = hugeReactImport + hugeCoreImport + newContent;
    } else {
        // If imports exist, we should merge them, but for now just prepending might be safer than complex parsing
        // Or we can just append them and let the linter fix it, or the user.
        // But to be clean, let's just prepend.
        newContent = hugeReactImport + hugeCoreImport + newContent;
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

const files = findFiles('.');
files.forEach(processFile);
