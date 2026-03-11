import fs from 'fs';
const file = 'components/prayer/data.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/ \(ផ្លូវការ\)/g, '');
fs.writeFileSync(file, content);
console.log('Done');
