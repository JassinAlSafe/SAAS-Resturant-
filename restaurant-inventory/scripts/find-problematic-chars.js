import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a file has problematic characters
function checkFileForProblematicChars(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for potentially problematic characters
    const problematicChars = [];
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charAt(i);
      const code = content.charCodeAt(i);
      
      // Check for various problematic characters
      if (
        (code >= 0xD800 && code <= 0xDFFF) || // Surrogate pairs
        (code >= 0xFDD0 && code <= 0xFDEF) || // Non-characters
        [0xFFFE, 0xFFFF].includes(code & 0xFFFF) || // Non-characters
        (char === "'" && content.charAt(i-1) !== '\\' && content.charAt(i-1) !== '&') || // Unescaped apostrophes
        (char === '"' && content.charAt(i-1) !== '\\' && content.charAt(i-1) !== '&') || // Unescaped quotes
        (code > 127 && code < 160) // Control characters and non-breaking spaces
      ) {
        problematicChars.push({
          position: i,
          char: char,
          code: code.toString(16),
          context: content.substring(Math.max(0, i - 20), Math.min(content.length, i + 20))
        });
      }
    }
    
    if (problematicChars.length > 0) {
      console.log(`\nProblematic characters found in ${filePath}:`);
      problematicChars.forEach(item => {
        console.log(`  Position: ${item.position}, Char: "${item.char}", Code: 0x${item.code}`);
        console.log(`  Context: "${item.context.replace(/\n/g, ' ')}"`);
      });
      return true;
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
      if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
        checkFileForProblematicChars(fullPath);
      }
    }
  }
}

// Start scanning from the src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log(`Scanning for problematic characters in ${srcDir}...`);
scanDirectory(srcDir);
console.log('Scan complete.');
