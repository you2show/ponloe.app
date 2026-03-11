const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Find <img ...> tags
            const regex = /<img[^>]+>/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const imgTag = match[0];
                if (!imgTag.includes('referrerPolicy')) {
                    console.log(`Missing referrerPolicy in ${fullPath}: ${imgTag}`);
                }
            }
        }
    }
}

processDirectory('./src');
if (fs.existsSync('./App.tsx')) {
    let content = fs.readFileSync('./App.tsx', 'utf8');
    const regex = /<img[^>]+>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const imgTag = match[0];
        if (!imgTag.includes('referrerPolicy')) {
            console.log(`Missing referrerPolicy in App.tsx: ${imgTag}`);
        }
    }
}
console.log('Done checking');
