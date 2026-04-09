import fs from 'fs';

// Convert the user-provided logo to base64
const file = fs.readFileSync('public/elara-logo.png');
const base64 = file.toString('base64');
fs.writeFileSync('src/constants/logo.ts', `export const CLOUD_LOGO = 'data:image/png;base64,${base64}';\n`);
console.log('User logo converted to base64');
