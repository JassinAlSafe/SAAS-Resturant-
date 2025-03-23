import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find problematic unicode characters in a file
function findUnicodeIssues(filePath) {
  try {
    console.log(`Checking ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for invalid unicode characters
    const invalidUnicodeRegex = /[\uD800-\uDFFF]|[\uFDD0-\uFDEF]|[\uFFFE\uFFFF]|[\u{1FFFE}-\u{1FFFF}]/u;
    
    if (invalidUnicodeRegex.test(content)) {
      console.log(`Found invalid Unicode in ${filePath}`);
      
      // Find the position of the invalid character
      let position = -1;
      for (let i = 0; i < content.length; i++) {
        const charCode = content.charCodeAt(i);
        if ((charCode >= 0xD800 && charCode <= 0xDFFF) || 
            (charCode >= 0xFDD0 && charCode <= 0xFDEF) || 
            charCode === 0xFFFE || charCode === 0xFFFF) {
          position = i;
          console.log(`Invalid character at position ${position}, code point: ${charCode.toString(16)}`);
          
          // Print surrounding context
          const start = Math.max(0, position - 20);
          const end = Math.min(content.length, position + 20);
          const context = content.substring(start, end);
          console.log(`Context: ${context.replace(/[\uD800-\uDFFF\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '�')}`);
          
          // Only report the first occurrence
          break;
        }
      }
      
      return true;
    }
    
    // Check for specific positions mentioned in the error
    const specificPositions = [175733, 333770];
    for (const pos of specificPositions) {
      if (content.length >= pos) {
        const charAtPos = content.charAt(pos - 1); // Adjust for 0-based indexing
        const charCode = content.charCodeAt(pos - 1);
        console.log(`Character at position ${pos}: ${charAtPos}, code point: ${charCode.toString(16)}`);
        
        // Print surrounding context
        const start = Math.max(0, pos - 21);
        const end = Math.min(content.length, pos + 20);
        const context = content.substring(start, end);
        console.log(`Context: ${context}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively scan a directory
function scanDirectory(dir, maxFiles = 100) {
  let filesChecked = 0;
  let foundIssues = false;
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (filesChecked >= maxFiles) return;
      
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .next directories
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        // Only check relevant file types
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
          const hasIssues = findUnicodeIssues(fullPath);
          if (hasIssues) foundIssues = true;
          filesChecked++;
        }
      }
      
      if (foundIssues) return;
    }
  }
  
  scanDir(dir);
  return foundIssues;
}

// Check specific files that might be causing issues
const specificFiles = [
  path.join(__dirname, '..', 'src', 'app', '(protected)', 'suppliers', 'components', 'modals', 'SupplierForm.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'billing', 'BillingService.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'billing', 'PaymentMethods.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'billing', 'PricingPlans.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'billing', 'PlanSelector.tsx'),
  path.join(__dirname, '..', 'src', 'lib', 'currency.tsx')
];

console.log('Checking specific files for Unicode issues...');
let foundIssues = false;
for (const file of specificFiles) {
  if (fs.existsSync(file)) {
    const hasIssues = findUnicodeIssues(file);
    if (hasIssues) foundIssues = true;
  } else {
    console.log(`File does not exist: ${file}`);
  }
}

if (!foundIssues) {
  console.log('Scanning src directory for Unicode issues...');
  scanDirectory(path.join(__dirname, '..', 'src'));
}

console.log('Unicode issue check completed!');
