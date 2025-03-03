const fs = require("fs");
const path = require("path");

// Path to the problematic file
const minifyPluginPath = path.resolve(
  "./node_modules/next/dist/build/webpack/plugins/minify-webpack-plugin/src/index.js"
);

console.log("Applying webpack error fix...");

// Check if the file exists
if (fs.existsSync(minifyPluginPath)) {
  try {
    // Read the file content
    let fileContent = fs.readFileSync(minifyPluginPath, "utf8");

    // First approach: Find and replace the specific buildError function
    const buildErrorPattern =
      /function\s+buildError[^{]*{[^}]*new\s+_webpack\.WebpackError/;

    if (buildErrorPattern.test(fileContent)) {
      console.log("Found problematic pattern in buildError function");

      // Replace the WebpackError constructor with a regular Error constructor
      fileContent = fileContent.replace(
        /new\s+_webpack\.WebpackError\s*\(/g,
        "new Error("
      );

      // Replace any reference to WebpackError type
      fileContent = fileContent.replace(/_webpack\.WebpackError/g, "Error");

      // Write the fixed content back to the file
      fs.writeFileSync(minifyPluginPath, fileContent, "utf8");
      console.log("Patch applied successfully!");
    } else {
      // If we couldn't find the specific pattern, try a more direct approach
      console.log(
        "Could not find the buildError pattern, trying alternate approach"
      );

      // Create a simple backup of the file
      fs.writeFileSync(`${minifyPluginPath}.backup`, fileContent, "utf8");

      // Replace the entire buildError function with a simplified version
      const simplifiedBuildError = `
function buildError(error, causedByPlugin, compilation) {
  const message = error.message || "Unspecified error";
  const stack = error.stack || "";
  
  // Create a simplified error object
  const simpleError = new Error(message);
  simpleError.name = "MinifyError";
  simpleError.stack = stack;
  
  // Add additional properties that might be expected
  simpleError.cause = error.cause;
  simpleError.plugin = causedByPlugin;
  
  return simpleError;
}
`;

      // Try to find and replace the buildError function
      const functionPattern = /function\s+buildError[^{]*\{[\s\S]*?\n\}/;
      if (functionPattern.test(fileContent)) {
        fileContent = fileContent.replace(
          functionPattern,
          simplifiedBuildError
        );
        fs.writeFileSync(minifyPluginPath, fileContent, "utf8");
        console.log("Replaced buildError function with simplified version");
      } else {
        console.log("Could not locate buildError function, unable to patch");
      }
    }
  } catch (error) {
    console.error("Error applying patch:", error);
  }
} else {
  console.log("MinifyPlugin file not found. Skipping patch.");
}
