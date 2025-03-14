/**
 * Types System Index
 * 
 * This is the main entry point for types in the application.
 * Import from here to access the fully organized type system.
 */

// Re-export all application types (for use in components/UI)
export * from './app';

// Export type adapters for converting between database and app types
export * as adapters from './adapters';

// Database types are available but should only be used in API/data layers
export * as dbTypes from './database'; 