// This script calls the setup-restaurant-icons API endpoint to fix the RLS policies
// Run this script with: node setup-restaurant-icons.js

// Use dynamic import for node-fetch
import("node-fetch").then(async ({ default: fetch }) => {
  try {
    // Load environment variables
    const dotenv = await import("dotenv");
    dotenv.config();

    console.log("Setting up restaurant-icons bucket...");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const apiUrl = `${appUrl}/api/setup-restaurant-icons`;

    console.log(`Calling API endpoint: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error setting up restaurant-icons bucket:", data);
      console.log(
        "\nIf you see an RLS policy error, you need to run the fix_restaurant_icons_rls.sql script in the Supabase SQL editor."
      );
      console.log("1. Go to https://supabase.com/dashboard");
      console.log("2. Select your project");
      console.log("3. Go to the SQL Editor");
      console.log("4. Copy the content of fix_restaurant_icons_rls.sql");
      console.log("5. Paste it into the SQL Editor");
      console.log("6. Run the script");
      console.log("\nAfter running the script, try this setup script again.");
    } else {
      console.log("Restaurant-icons bucket setup successful!");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error calling setup-restaurant-icons API:", error);
  }
});
