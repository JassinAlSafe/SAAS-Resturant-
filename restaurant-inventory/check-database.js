// This script checks if the profiles table exists and is accessible
// Run this script with: node check-database.js

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  try {
    console.log("Checking database tables...");

    // Check if the profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("count(*)")
      .limit(1);

    if (profilesError) {
      console.error("Error accessing profiles table:", profilesError);
      console.log(
        "\nThe profiles table might not exist or you might not have permission to access it."
      );
      console.log(
        "Please follow the instructions in SETUP_DATABASE.md to set up your database."
      );
    } else {
      console.log("✅ Profiles table exists and is accessible.");
      console.log(`Number of profiles: ${profilesData[0]?.count || 0}`);
    }

    // Check if other tables exist
    const tables = ["ingredients", "dishes", "dish_ingredients", "sales"];

    for (const table of tables) {
      const { error } = await supabase.from(table).select("count(*)").limit(1);

      if (error) {
        console.error(`Error accessing ${table} table:`, error);
        console.log(
          `\nThe ${table} table might not exist or you might not have permission to access it.`
        );
      } else {
        console.log(`✅ ${table} table exists and is accessible.`);
      }
    }

    console.log(
      "\nIf any tables are missing, please follow the instructions in SETUP_DATABASE.md to set up your database."
    );
  } catch (error) {
    console.error("Error checking database:", error);
  }
}

checkDatabase();
