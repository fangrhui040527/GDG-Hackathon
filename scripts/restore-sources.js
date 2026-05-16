const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Asus\\OneDrive\\Desktop\\GDG-Hackathon';

function extractSources(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const b64Pattern = /sourceMappingURL=data:application\/json;charset=utf-8;base64,([A-Za-z0-9+\/=]+)/g;
  let match;
  const results = [];
  while ((match = b64Pattern.exec(content)) !== null) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf8');
      const map = JSON.parse(decoded);
      if (map.sourcesContent && map.sources) {
        for (let i = 0; i < map.sources.length; i++) {
          const src = map.sources[i];
          const srcContent = map.sourcesContent[i];
          if (srcContent && src && src.includes('GDG-Hackathon\\src\\') && !src.includes('node_modules')) {
            results.push({ source: src, content: srcContent });
          }
        }
      }
    } catch (e) { }
  }
  return results;
}

const bundleFiles = [
  '.next/server/app/organizer/dashboard/page.js',
  '.next/server/app/organizer/my-programmes/page.js',
  '.next/server/app/organizer/create-programme/page.js',
  '.next/server/app/organizer/form-hub/page.js',
  '.next/server/app/organizer/submitted/page.js',
  '.next/server/app/login/page.js',
  '.next/static/chunks/app/organizer/layout.js',
  '.next/static/chunks/app/organizer/create-programme/page.js',
  '.next/static/chunks/app/organizer/form-hub/page.js',
  '.next/static/chunks/app/layout.js',
  '.next/static/chunks/app/login/page.js',
];

const allSources = new Map();

for (const bundleFile of bundleFiles) {
  const fullPath = path.join(ROOT, bundleFile);
  if (!fs.existsSync(fullPath)) continue;
  const sources = extractSources(fullPath);
  for (const { source, content } of sources) {
    if (!allSources.has(source)) {
      allSources.set(source, content);
    }
  }
}

let restored = 0;
let skipped = 0;

for (const [src, content] of allSources) {
  // Normalize path: strip the root prefix (handle both / and \ variants)
  let relPath = src
    .replace(/^C:[\/\\]Users[\/\\]Asus[\/\\]OneDrive[\/\\]Desktop[\/\\]GDG-Hackathon[\/\\]/, '')
    .replace(/\\/g, '/');
  
  // Skip the export default / CSS module proxy files
  if (content.startsWith('export default "') || content.startsWith('// This file is generated')) continue;
  
  const destPath = path.join(ROOT, relPath.replace(/\//g, path.sep));
  
  // Only create if missing
  if (!fs.existsSync(destPath)) {
    const dir = path.dirname(destPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(destPath, content);
    console.log('CREATED: ' + relPath);
    restored++;
  } else {
    console.log('EXISTS: ' + relPath);
    skipped++;
  }
}

console.log(`\nRestored ${restored} files, skipped ${skipped} existing files.`);
