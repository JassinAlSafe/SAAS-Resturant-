const fs = require('fs');
const path = require('path');

// Function to find and fix specific unicode issue positions
function findAndFixSpecificPositions() {
  // Get all .js, .jsx, .ts, .tsx files from the .next/static directory
  const nextStaticDir = path.join(__dirname, '..', '.next', 'static');
  
  if (!fs.existsSync(nextStaticDir)) {
    console.log(`Directory ${nextStaticDir} does not exist. Run a build first.`);
    return;
  }
  
  // Recursively find all files
  const findFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(findFiles(filePath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          results.push(filePath);
        }
      }
    });
    
    return results;
  };
  
  const files = findFiles(nextStaticDir);
  console.log(`Found ${files.length} files to check.`);
  
  // Check each file for the specific positions
  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if the file is long enough to contain the problematic position
      if (content.length >= 175733) {
        console.log(`File ${file} is long enough to potentially contain the issue.`);
        
        // Create a new string with the problematic character replaced
        let newContent = '';
        for (let i = 0; i < content.length; i++) {
          // If we're at the specific position, replace the character with a space
          if (i === 175733 - 1) { // Adjust for 0-based indexing
            newContent += ' ';
            console.log(`Replaced character at position ${i+1} in ${file}`);
          } else {
            newContent += content[i];
          }
        }
        
        // Write the fixed content back to the file
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Fixed ${file}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });
}

// Function to fix all source files
function fixAllSourceFiles() {
  const srcDir = path.join(__dirname, '..', 'src');
  
  // Recursively find all files
  const findFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        // Skip node_modules and .next
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          results = results.concat(findFiles(filePath));
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
          results.push(filePath);
        }
      }
    });
    
    return results;
  };
  
  const files = findFiles(srcDir);
  console.log(`Found ${files.length} source files to fix.`);
  
  // Process each file
  files.forEach((file) => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace all non-ASCII characters with spaces
      content = content.replace(/[^\x00-\x7F]/g, ' ');
      
      // Write the fixed content back to the file
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });
}

// Fix all source files first
console.log('Fixing all source files...');
fixAllSourceFiles();

// Then try to fix specific positions in build files
console.log('Checking for specific position issues in build files...');
findAndFixSpecificPositions();

console.log('Done!');
