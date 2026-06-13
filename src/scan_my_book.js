import fs from 'fs';
import path from 'path';

const myBookPath = 'c:\\Users\\wasri\\Desktop\\my book';

function scanMyBook() {
  if (!fs.existsSync(myBookPath)) {
    console.error('my book path does not exist');
    return;
  }

  console.log(`Scanning "my book" folder: ${myBookPath}`);
  
  // Recursively search for .json, .env, or db files under my book
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
          if (ext === '.json' || file === '.env' || ext === '.db' || file.includes('fallback')) {
            results.push({ path: fullPath, size: stat.size });
          }
        }
      });
    } catch (err) {
      // Ignore
    }
    return results;
  }

  const files = searchFiles(myBookPath);
  console.log(`Found ${files.length} configuration/data files under "my book":\n`);
  files.forEach(f => {
    console.log(`- ${f.path} (${(f.size / 1024).toFixed(2)} KB)`);
  });
}

scanMyBook();
