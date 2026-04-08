import sharp from 'sharp';
import fs from 'fs';

async function resize() {
  const input = 'public/elara-logo.png';
  await sharp(input).resize(192, 192).toFile('public/pwa-192x192.png');
  await sharp(input).resize(512, 512).toFile('public/pwa-512x512.png');
  console.log('Icons generated');
}

resize();
