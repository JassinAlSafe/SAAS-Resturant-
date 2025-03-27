"use client";

import { useAuth } from "@/lib/services/auth-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Define a type for the session
interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export function AuthDebugger() {
  const { user, profile, session, isLoading } = useAuth();
  const [cookieInfo, setCookieInfo] = useState<string>("");
  const [supabaseSession, setSupabaseSession] =
    useState<SupabaseSession | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Get all cookies for debugging
    setCookieInfo(document.cookie);

    // Get Supabase session directly
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSupabaseSession(data.session);
    };

    checkSupabaseSession();
  }, []);

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSupabaseSession(data.session);
    setCookieInfo(document.cookie);
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    refreshSession();
  };

  const forceRedirect = () => {
    window.location.href = "/dashboard";
  };

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
          className="bg-white dark:bg-slate-900 shadow-md"
        >
          Show Auth Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw] bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Auth Debug Info</h2>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-2 text-sm max-h-[70vh] overflow-auto">
        <p>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </p>
        <p>
          <strong>Auth Context User:</strong> {user ? "Yes" : "No"}
        </p>
        <p>
          <strong>Auth Context Session:</strong> {session ? "Yes" : "No"}
        </p>
        <p>
          <strong>Auth Context Profile:</strong> {profile ? "Yes" : "No"}
        </p>
        <p>
          <strong>Direct Supabase Session:</strong>{" "}
          {supabaseSession ? "Yes" : "No"}
        </p>

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="font-semibold">User Details:</p>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "No user"}
          </pre>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="font-semibold">Session Details:</p>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {session ? JSON.stringify(session, null, 2) : "No session"}
          </pre>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="font-semibold">Cookies:</p>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {cookieInfo || "No cookies"}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={refreshSession}>
          Refresh Data
        </Button>
        <Button size="sm" variant="outline" onClick={clearLocalStorage}>
          Clear Storage
        </Button>
        <Button size="sm" variant="secondary" onClick={forceRedirect}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
