import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/pages/UserApp.tsx',
  'src/pages/AdminHub.tsx'
];

const oldColor = '#a3ff00';
const newColor = '#FFB800';
const oldRgba = 'rgba(163,255,0,';
const newRgba = 'rgba(255,184,0,';

filesToUpdate.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(new RegExp(oldColor, 'g'), newColor);
  content = content.replace(new RegExp(oldRgba.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newRgba);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
