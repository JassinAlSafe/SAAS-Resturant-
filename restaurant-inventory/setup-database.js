// This script sets up the database schema in Supabase
// Run this script with: node setup-database.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This is different from the anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
  );
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log("Setting up database schema...");

    // Read the schema file
    const schemaPath = path.join(
      __dirname,
      "src",
      "lib",
      "supabase-schema.sql"
    );
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql: schemaSQL });

    if (error) {
      console.error("Error executing schema:", error);

      // Alternative approach if rpc method is not available
      console.log("Trying alternative approach...");

      // Split the schema into individual statements
      const statements = schemaSQL
        .split(";")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      // Execute each statement
      for (const statement of statements) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement });
        if (error) {
          console.error(`Error executing statement: ${statement}`);
          console.error(error);
        }
      }
    } else {
      console.log("Database schema set up successfully!");
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

setupDatabase();
