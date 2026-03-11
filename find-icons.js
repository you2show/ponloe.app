import fs from 'fs';
import path from 'path';

function findIcons(dir) {
  let icons = new Set();
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        const subIcons = findIcons(fullPath);
        subIcons.forEach(i => icons.add(i));
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
      if (match) {
        const imported = match[1].split(',').map(s => s.trim()).filter(Boolean);
        imported.forEach(i => icons.add(i));
      }
    }
  }
  return icons;
}

const allIcons = Array.from(findIcons('./components'));
console.log(allIcons.join(', '));
