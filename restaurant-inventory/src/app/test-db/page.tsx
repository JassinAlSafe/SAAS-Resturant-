"use client";

import { useState } from "react";
import { testDatabaseConnection } from "@/lib/test-database-connection";

export default function TestDatabasePage() {
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setResults("Testing database connection...\n");

    try {
      const result = await testDatabaseConnection();
      setResults(
        (prev) =>
          prev +
          `Test completed: ${result.success ? "SUCCESS" : "FAILED"}\n${
            result.message
          }\n\nPlease check your browser console for detailed results.`
      );
    } catch (error) {
      setResults(
        (prev) =>
          prev +
          `Test failed with error: ${
            error instanceof Error ? error.message : String(error)
          }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <p className="mb-4">
        This page tests your Supabase database connection after applying RLS
        policies. Click the button below to run tests and check if the 500
        Internal Server Error is resolved.
      </p>

      <button
        onClick={handleTestConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Testing..." : "Test Database Connection"}
      </button>

      {results && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {results}
          </pre>
        </div>
      )}
    </div>
  );
}
