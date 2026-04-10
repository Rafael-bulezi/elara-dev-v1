import fs from 'fs';
fs.copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
console.log('Copied to favicon.ico');
