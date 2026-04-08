import fs from 'fs';

const file = fs.readFileSync('public/pwa-192x192.png');
const base64 = file.toString('base64');
fs.writeFileSync('src/constants/logo.ts', `export const CLOUD_LOGO = 'data:image/png;base64,${base64}';\n`);
console.log('Logo converted to base64');
