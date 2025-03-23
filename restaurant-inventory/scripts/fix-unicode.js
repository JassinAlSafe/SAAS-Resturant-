import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix unicode issues in a file
function fixUnicodeIssues(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace smart quotes with regular quotes
    content = content.replace(/[""]/g, '"');
    content = content.replace(/['']/g, "'");
    
    // Replace other problematic characters
    content = content.replace(/[–—]/g, '-'); // em and en dashes
    content = content.replace(/…/g, '...'); // ellipsis
    
    // Replace unescaped apostrophes in JSX with &apos;
    content = content.replace(/(\s)(\w+)'(\w+)(\s)/g, '$1$2&apos;$3$4');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively scan a directory
function scanAndFixDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanAndFixDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Only fix relevant file types
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
        fixUnicodeIssues(fullPath);
      }
    }
  }
}

// Start scanning from the src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log(`Scanning and fixing unicode issues in ${srcDir}...`);
scanAndFixDirectory(srcDir);
console.log('Unicode issues fixed!');
