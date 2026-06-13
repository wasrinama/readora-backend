import fs from 'fs';
import path from 'path';

const homeDir = 'c:\\Users\\wasri';

try {
  const items = fs.readdirSync(homeDir);
  console.log(`Found ${items.length} items in home directory:`);
  
  items.forEach(item => {
    const fullPath = path.join(homeDir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const lowerName = item.toLowerCase();
        if (
          !item.startsWith('.') &&
          !['appdata', 'node_modules', 'videos', 'pictures', 'music', 'contacts', 'links', 'searches', 'saved games', 'onedrive', '3d objects'].includes(lowerName)
        ) {
          console.log(`- DIR: ${item}`);
        }
      } else {
        console.log(`- FILE: ${item} (${(stat.size/1024).toFixed(2)} KB)`);
      }
    } catch (e) {
      // Ignore
    }
  });
} catch (err) {
  console.error(err);
}
