import fs from 'fs';

const logPath = 'C:\\Users\\wasri\\.gemini\\antigravity\\brain\\701796de-051d-400c-9d4c-31485c827861\\.system_generated\\logs\\transcript.jsonl';

try {
  if (fs.existsSync(logPath)) {
    const data = fs.readFileSync(logPath, 'utf-8');
    const lines = data.split('\n');
    console.log(`Log has ${lines.length} lines.`);
    
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('118') || line.toLowerCase().includes('hundred and eighteen') || line.toLowerCase().includes('inventory')) {
        console.log(`\n--- Line ${i + 1} ---`);
        try {
          const parsed = JSON.parse(line);
          console.log(`Type: ${parsed.type}, Source: ${parsed.source}`);
          if (parsed.content) {
            console.log('Content snippet:', parsed.content.slice(0, 1000));
          }
          if (parsed.tool_calls) {
            console.log('Tool calls:', JSON.stringify(parsed.tool_calls, null, 2).slice(0, 1000));
          }
        } catch (e) {
          console.log('Snippet:', line.slice(0, 1000));
        }
        count++;
        if (count > 20) {
          console.log('Too many matches, stopping print.');
          break;
        }
      }
    }
  } else {
    console.log('Log file does not exist');
  }
} catch (e) {
  console.error(e);
}
