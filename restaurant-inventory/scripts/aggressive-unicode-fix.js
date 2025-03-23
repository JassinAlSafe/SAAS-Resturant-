const fs = require('fs');
const path = require('path');

// Function to aggressively fix unicode issues in a file
function fixUnicodeIssues(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all non-ASCII characters with their ASCII equivalents or remove them
    content = content
      // Replace smart quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Replace dashes and hyphens
      .replace(/[–—]/g, '-')
      // Replace ellipsis
      .replace(/…/g, '...')
      // Replace non-breaking spaces
      .replace(/\u00A0/g, ' ')
      // Remove zero-width spaces and other invisible characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Remove byte order mark
      .replace(/^\uFEFF/g, '')
      // Fix common HTML entities
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // Remove all other non-ASCII characters
      .replace(/[^\x00-\x7F]/g, '');
    
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
  try {
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
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

// Start scanning from the src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log(`Scanning and fixing unicode issues in ${srcDir}...`);
scanAndFixDirectory(srcDir);
console.log('Unicode issues fixed!');
