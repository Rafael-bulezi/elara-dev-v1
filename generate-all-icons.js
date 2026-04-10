import sharp from 'sharp';
import fs from 'fs';

async function generateIcons() {
  const input = 'public/elara-logo.png';
  
  if (!fs.existsSync(input)) {
    console.error('Input file not found: ' + input);
    return;
  }

  // Favicons
  await sharp(input).resize(32, 32).toFile('public/favicon-32x32.png');
  await sharp(input).resize(16, 16).toFile('public/favicon-16x16.png');
  
  // PWA Icons
  await sharp(input).resize(192, 192).toFile('public/pwa-192x192.png');
  await sharp(input).resize(512, 512).toFile('public/pwa-512x512.png');
  
  // Apple Touch Icon
  await sharp(input).resize(180, 180).toFile('public/apple-touch-icon.png');

  console.log('All icons generated successfully');
}

generateIcons().catch(console.error);