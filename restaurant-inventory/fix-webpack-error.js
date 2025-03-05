const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Paths to check
const paths = {
  minifyPlugin: path.resolve(
    "./node_modules/next/dist/build/webpack/plugins/minify-webpack-plugin/src/index.js"
  ),
  terserPlugin: path.resolve(
    "./node_modules/next/dist/build/webpack/plugins/terser-webpack-plugin/src/index.js"
  ),
};

async function backupFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    const backupPath = `${filePath}.backup-${Date.now()}`;
    await writeFile(backupPath, content, "utf8");
    console.log(`✓ Created backup at: ${backupPath}`);
    return content;
  } catch (error) {
    console.error(`✗ Failed to create backup: ${error.message}`);
    throw error;
  }
}

async function patchMinifyPlugin(content) {
  // Replace WebpackError with standard Error
  content = content.replace(/new\s+_webpack\.WebpackError\s*\(/g, "new Error(");
  content = content.replace(/_webpack\.WebpackError/g, "Error");

  // Simplified buildError function
  const simplifiedBuildError = `
function buildError(error, causedByPlugin, compilation) {
  const message = error.message || "Unspecified error";
  const stack = error.stack || "";
  
  const simpleError = new Error(message);
  simpleError.name = "MinifyError";
  simpleError.stack = stack;
  simpleError.cause = error.cause;
  simpleError.plugin = causedByPlugin;
  
  // Add compilation context if available
  if (compilation && compilation.compiler) {
    simpleError.file = compilation.compiler.name;
  }
  
  return simpleError;
}`;

  // Replace the existing buildError function
  const functionPattern = /function\s+buildError[^{]*\{[\s\S]*?\n\}/;
  content = content.replace(functionPattern, simplifiedBuildError);

  return content;
}

async function patchTerserPlugin(content) {
  // Replace problematic terser options
  const terserOptions = `
const terserOptions = {
  parse: {
    ecma: 8
  },
  compress: {
    ecma: 5,
    warnings: false,
    comparisons: false,
    inline: 2,
    drop_console: process.env.NODE_ENV === 'production'
  },
  mangle: { safari10: true },
  output: {
    ecma: 5,
    comments: false,
    ascii_only: true
  }
};`;

  // Replace existing terser options
  const optionsPattern = /const\s+terserOptions\s*=\s*{[\s\S]*?};/;
  content = content.replace(optionsPattern, terserOptions);

  return content;
}

async function fixFile(filePath, patchFunction) {
  try {
    // Check if file exists
    await access(filePath);

    // Create backup
    const content = await backupFile(filePath);

    // Apply patch
    const patchedContent = await patchFunction(content);

    // Write patched content
    await writeFile(filePath, patchedContent, "utf8");
    console.log(`✓ Successfully patched: ${path.basename(filePath)}`);

    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ℹ Skipping ${path.basename(filePath)} - file not found`);
    } else {
      console.error(
        `✗ Error patching ${path.basename(filePath)}: ${error.message}`
      );
    }
    return false;
  }
}

async function main() {
  console.log("🔧 Starting webpack error fix...");

  try {
    // Fix MinifyPlugin
    await fixFile(paths.minifyPlugin, patchMinifyPlugin);

    // Fix TerserPlugin
    await fixFile(paths.terserPlugin, patchTerserPlugin);

    console.log("✅ Webpack error fix completed!");
    console.log("ℹ Please run 'npm run build' to verify the fixes.");
  } catch (error) {
    console.error("❌ Failed to apply webpack fixes:", error);
    process.exit(1);
  }
}

// Run the script
main();
