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
  '.next/server/app/login/page.js',
  '.next/static/chunks/app/login/page.js',
  '.next/static/chunks/app/organizer/layout.js',
  '.next/static/chunks/app/layout.js',
];

const targets = [
  'login\\page.tsx',
  'OrganizerSidebar.tsx',
  'layout.tsx',
];

const allSources = new Map();

for (const bundleFile of bundleFiles) {
  const fullPath = path.join(ROOT, bundleFile);
  if (!fs.existsSync(fullPath)) { console.log('MISSING bundle:', bundleFile); continue; }
  const sources = extractSources(fullPath);
  for (const { source, content } of sources) {
    const key = source.replace(/\\/g, '/');
    if (!allSources.has(key)) {
      allSources.set(key, content);
    }
  }
}

// Force-overwrite target files
for (const [src, content] of allSources) {
  const isTarget = targets.some(t => src.replace(/\\/g, '/').includes(t.replace(/\\/g, '/')));
  if (!isTarget) continue;

  let relPath = src
    .replace(/^C:[\/\\]Users[\/\\]Asus[\/\\]OneDrive[\/\\]Desktop[\/\\]GDG-Hackathon[\/\\]/, '')
    .replace(/\//g, path.sep);

  const destPath = path.join(ROOT, relPath);
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log('RESTORED:', relPath);
}
