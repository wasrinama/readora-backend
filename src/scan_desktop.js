import fs from 'fs';
import path from 'path';

const desktopPath = 'c:\\Users\\wasri\\Desktop';

function scanDesktop() {
  if (!fs.existsSync(desktopPath)) {
    console.error('Desktop path does not exist');
    return;
  }

  console.log(`Scanning Desktop: ${desktopPath}`);
  try {
    const items = fs.readdirSync(desktopPath);
    console.log(`Found ${items.length} items on the desktop:\n`);
    items.forEach(item => {
      const fullPath = path.join(desktopPath, item);
      const stat = fs.statSync(fullPath);
      const isDir = stat.isDirectory();
      console.log(`- ${item} [${isDir ? 'DIR' : 'FILE'}]`);
    });
  } catch (err) {
    console.error('Error scanning desktop:', err.message);
  }
}

scanDesktop();
