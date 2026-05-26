const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('http://localhost:5001/api')) {
        // Add import if not present
        if (!content.includes("import { API_URL }")) {
          // Find how many levels deep we are to import from src/config
          const relativePath = path.relative(path.dirname(fullPath), path.join(__dirname, 'src', 'config'));
          const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
          
          const importStatement = `import { API_URL } from '${importPath.replace(/\\/g, '/')}';\n`;
          content = importStatement + content;
        }

        // Replace all instances of 'http://localhost:5001/api' with `${API_URL}`
        // Be careful with template literals
        // Pattern 1: 'http://localhost:5001/api/...' -> `${API_URL}/...`
        content = content.replace(/'http:\/\/localhost:5001\/api([^']*)'/g, '`${API_URL}$1`');
        
        // Pattern 2: `http://localhost:5001/api/...` -> `${API_URL}/...`
        content = content.replace(/`http:\/\/localhost:5001\/api([^`]*)`/g, '`${API_URL}$1`');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

findAndReplace(directoryPath);
console.log('Finished URL replacement.');
