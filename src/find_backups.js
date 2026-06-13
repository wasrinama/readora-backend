import fs from 'fs';
import path from 'path';

const searchDir = 'c:\\Users\\wasri\\Desktop\\readeora';

function searchFiles(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git') {
          results = results.concat(searchFiles(fullPath));
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.json' || ext === '.db' || ext === '.sql' || file.includes('backup') || file.includes('dump')) {
          results.push({ path: fullPath, size: stat.size });
        }
      }
    });
  } catch (err) {
    // Ignore read errors
  }
  return results;
}

console.log(`Searching for database files/backups under: ${searchDir}`);
const files = searchFiles(searchDir);
console.log(`Found ${files.length} matching files:\n`);
files.forEach(f => {
  console.log(`- ${f.path} (${(f.size / 1024).toFixed(2)} KB)`);
});
