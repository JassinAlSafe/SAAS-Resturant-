#!/usr/bin/env node
/**
 * This script applies database migrations to the Supabase project
 * Run with: node src/scripts/apply-migrations.js
 *
 * Prerequisites:
 * - Supabase service role key must be set in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL must be set in .env.local
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing required environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Directory containing migration files
const migrationsDir = path.join(__dirname, "..", "db", "migrations");

async function applyMigration(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\nApplying migration: ${fileName}`);

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, "utf8");

    // Split the file into statements by semicolons (basic approach)
    const statements = sqlContent
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    console.log(`Found ${statements.length} statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error("Statement was:", statement);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Error executing statement ${i + 1}:`, statementError);
        console.error("Statement was:", statement);
      }
    }

    console.log(`Migration ${fileName} completed`);
  } catch (error) {
    console.error(`Failed to apply migration ${fileName}:`, error);
  }
}

async function applyMigrations() {
  console.log("Starting database migration process...");

  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found: ${migrationsDir}`);
      process.exit(1);
    }

    // Get all .sql files in the migrations directory
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => path.join(migrationsDir, file));

    console.log(`Found ${migrationFiles.length} migration files to apply`);

    // Process migrations sequentially (in case of dependencies)
    for (const filePath of migrationFiles) {
      await applyMigration(filePath);
    }

    console.log("\nMigration process completed successfully!");
  } catch (error) {
    console.error("Migration process failed:", error);
    process.exit(1);
  }
}

// Run the migration process
applyMigrations();
