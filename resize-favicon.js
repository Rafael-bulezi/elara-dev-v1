import sharp from 'sharp';

const input = 'public/elara-logo.png';
await sharp(input).resize(32, 32).toFile('public/favicon-32x32.png');
console.log('Favicon resized');
