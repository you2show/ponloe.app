const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = ['components', 'contexts', 'hooks', 'lib', 'services', 'src'];
const ALIAS_TARGETS = ['components', 'contexts', 'hooks', 'lib', 'services', 'types'];

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDir(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

let allFiles = [];
for (const dir of DIRS_TO_SCAN) {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(scanDir(dir));
  }
}
if (fs.existsSync('types.ts')) allFiles.push('types.ts');
if (fs.existsSync('server.ts')) allFiles.push('server.ts');

let changedFiles = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace relative imports that go to one of the target directories
  // e.g. import { ... } from '../../../contexts/AuthContext'
  // -> import { ... } from '@/contexts/AuthContext'
  
  const regex = /from\s+['"]((?:\.\.\/|\.\/)+)(components|contexts|hooks|lib|services|types)(.*)['"]/g;
  content = content.replace(regex, (match, relativePath, targetDir, rest) => {
    return `from '@/${targetDir}${rest}'`;
  });

  // Also handle dynamic imports if any
  const regexDynamic = /import\(['"]((?:\.\.\/|\.\/)+)(components|contexts|hooks|lib|services|types)(.*)['"]\)/g;
  content = content.replace(regexDynamic, (match, relativePath, targetDir, rest) => {
    return `import('@/${targetDir}${rest}')`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
    changedFiles++;
  }
}

console.log(`Done. Updated ${changedFiles} files.`);
