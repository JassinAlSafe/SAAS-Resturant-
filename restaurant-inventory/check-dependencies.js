const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Checking dependencies...");

// Check if tailwindcss-animate is installed
try {
  const tailwindAnimatePath = path.resolve(
    "./node_modules/tailwindcss-animate"
  );
  if (fs.existsSync(tailwindAnimatePath)) {
    console.log("✅ tailwindcss-animate is installed");
  } else {
    console.log("❌ tailwindcss-animate is not installed");
    console.log("Installing tailwindcss-animate...");
    execSync("npm install tailwindcss-animate", { stdio: "inherit" });
  }
} catch (error) {
  console.error("Error checking tailwindcss-animate:", error);
}

// Check if next-themes is installed
try {
  const nextThemesPath = path.resolve("./node_modules/next-themes");
  if (fs.existsSync(nextThemesPath)) {
    console.log("✅ next-themes is installed");
  } else {
    console.log("❌ next-themes is not installed");
    console.log("Installing next-themes...");
    execSync("npm install next-themes", { stdio: "inherit" });
  }
} catch (error) {
  console.error("Error checking next-themes:", error);
}

// Check if @radix-ui/react-dropdown-menu is installed
try {
  const radixDropdownPath = path.resolve(
    "./node_modules/@radix-ui/react-dropdown-menu"
  );
  if (fs.existsSync(radixDropdownPath)) {
    console.log("✅ @radix-ui/react-dropdown-menu is installed");
  } else {
    console.log("❌ @radix-ui/react-dropdown-menu is not installed");
    console.log("Installing @radix-ui/react-dropdown-menu...");
    execSync("npm install @radix-ui/react-dropdown-menu", { stdio: "inherit" });
  }
} catch (error) {
  console.error("Error checking @radix-ui/react-dropdown-menu:", error);
}

console.log("Dependency check completed.");
