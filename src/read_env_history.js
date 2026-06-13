import { execSync } from 'child_process';

const commits = [
  'bc81254',
  '3f086d2',
  '3c2ae6d',
  '70046b9',
  'c9b168f',
  '9ce4201',
  '89b6760',
  'f88908b',
  '120ae75',
  '0c91bbb',
  '7e8b6a9'
];

console.log('📜 Extracting .env history from git commits...');

for (const commit of commits) {
  try {
    const output = execSync(`git show ${commit}:.env`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    console.log(`\nCommit: ${commit}`);
    const lines = output.split('\n');
    const mongoLine = lines.find(l => l.includes('MONGODB_URI') || l.includes('MONGO_URI'));
    if (mongoLine) {
      console.log(` - ${mongoLine.trim()}`);
    } else {
      console.log(' - No MONGODB_URI line found');
    }
  } catch (err) {
    console.log(`\nCommit: ${commit} - Error: ${err.message.split('\n')[0]}`);
  }
}
