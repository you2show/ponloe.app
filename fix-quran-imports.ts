import fs from 'fs';
import path from 'path';

const quranDir = path.join(process.cwd(), 'components', 'quran');

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Calculate relative path to components/quran/types.ts
      const relativePath = path.relative(path.dirname(filePath), path.join(quranDir, 'types'));
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      
      content = content.replace(/from\s+['"]@\/types['"]/g, `from '${importPath}'`);
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }
}

walkDir(quranDir);
console.log('Done');
