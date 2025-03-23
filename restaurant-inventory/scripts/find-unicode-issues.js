import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a file has unicode issues
function checkFileForUnicodeIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for invalid unicode characters
    for (let i = 0; i < content.length; i++) {
      const code = content.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDFFF) {
        console.log(`Unicode issue found in ${filePath} at position ${i}, character code: ${code.toString(16)}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return true; // Assume there's an issue if we can't read the file
  }
}

// Function to recursively scan a directory
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Only check relevant file types
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.html'].includes(ext)) {
        checkFileForUnicodeIssues(fullPath);
      }
    }
  }
}

// Start scanning from the src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log(`Scanning for unicode issues in ${srcDir}...`);
scanDirectory(srcDir);
console.log('Scan complete.');
