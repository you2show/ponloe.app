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
            let modified = false;
            
            // Replace <img ...> with <img referrerPolicy="no-referrer" ...>
            // But only if it doesn't already have referrerPolicy
            const regex = /<img\s+(?![^>]*referrerPolicy)([^>]+)>/g;
            const newContent = content.replace(regex, '<img referrerPolicy="no-referrer" $1>');
            
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./components');
console.log('Done');
