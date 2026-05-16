const fs = require('fs');
const path = require('path');

function extractSources(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Find base64 encoded source maps
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
          const content_i = map.sourcesContent[i];
          if (content_i && src && !src.includes('node_modules') && !src.includes('next/dist')) {
            results.push({ source: src, content: content_i });
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  return results;
}

const pages = [
  '.next/server/app/organizer/dashboard/page.js',
  '.next/server/app/organizer/my-programmes/page.js',
  '.next/server/app/organizer/create-programme/page.js',
  '.next/server/app/organizer/form-hub/page.js',
  '.next/server/app/organizer/submitted/page.js',
  '.next/static/chunks/app/organizer/layout.js',
  '.next/static/chunks/app/organizer/create-programme/page.js',
  '.next/static/chunks/app/organizer/form-hub/page.js',
];

const allSources = new Map();

for (const pageFile of pages) {
  if (!fs.existsSync(pageFile)) continue;
  const sources = extractSources(pageFile);
  for (const { source, content } of sources) {
    if (!allSources.has(source)) {
      allSources.set(source, content);
    }
  }
}

console.log('Found sources:');
for (const [src, content] of allSources) {
  console.log(`\n=== ${src} ===`);
  console.log(content.substring(0, 200) + (content.length > 200 ? '\n...' : ''));
}
