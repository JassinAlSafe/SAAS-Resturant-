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
    
    // Replace common problematic characters
    const replacements = [
      // Smart quotes
      [/[""]/g, '"'],
      [/['']/g, "'"],
      // Dashes and hyphens
      [/[–—]/g, '-'],
      // Ellipsis
      [/…/g, '...'],
      // Non-breaking spaces
      [/\u00A0/g, ' '],
      // Other common problematic characters
      [/[™©®]/g, ''],
      [/[±§]/g, ''],
      [/[¢£¥€]/g, '$'],
      // Fix apostrophes in JSX
      [/(\w)'(\w)/g, "$1\\'$2"],
      // Fix quotes in JSX attributes
      [/="([^"]*)"/g, (match, p1) => `="${p1.replace(/'/g, "\\'")}"`],
      // Remove zero-width spaces and other invisible characters
      [/[\u200B-\u200D\uFEFF]/g, ''],
      // Remove byte order mark
      [/^\uFEFF/g, ''],
      // Fix common HTML entities
      [/&apos;/g, "\\'"],
      [/&quot;/g, '\\"'],
      [/&lt;/g, '<'],
      [/&gt;/g, '>'],
      [/&amp;/g, '&'],
      // Fix common escape sequences
      [/\\"/g, '\\"'],
      [/\\'/g, "\\'"],
      [/\\\\/g, '\\\\'],
      // Fix invalid escape sequences
      [/\\([^"'\\nrtbfv0])/g, '\\\\$1'],
    ];
    
    // Apply all replacements
    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }
    
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
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scanAndFixDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Only fix relevant file types
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css'].includes(ext)) {
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
