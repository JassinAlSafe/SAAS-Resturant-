import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";
import Image from "next/image";

export function TestStorageUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    publicUrl?: string;
    details?: Record<string, unknown>;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setIsLoading(true);
    setResult(null);

    try {
      // Instead of uploading to the storage bucket, use a placeholder image
      const width = 300;
      const height = 300;
      const placeholderUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;

      // Simulate a delay to mimic upload time
      await new Promise((resolve) => setTimeout(resolve, 800));

      setResult({
        success: true,
        message: "Using placeholder image instead of actual upload",
        publicUrl: placeholderUrl,
        details: {
          note: "Storage bucket upload is currently disabled due to permission issues. Using placeholder image instead.",
          originalFileName: file.name,
          fileType: file.type,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          placeholderUrl,
        },
      });
    } catch (error) {
      console.error("Error handling file:", error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        details: { error: String(error) },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test Image Placeholder</CardTitle>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className="mb-4"
          >
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              <p>{result.message}</p>
              {result.publicUrl && (
                <div className="mt-2">
                  <p className="mb-2">Placeholder image:</p>
                  <Image
                    src={result.publicUrl}
                    alt="Placeholder image"
                    width={160}
                    height={160}
                    className="max-w-full h-auto max-h-40 rounded-md object-contain"
                  />
                </div>
              )}
              {result.details && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer">View Details</summary>
                  <pre className="mt-2 w-full overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <Button
            onClick={() => document.getElementById("test-file-input")?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generate Placeholder
              </>
            )}
          </Button>
          <input
            id="test-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </CardContent>
    </Card>
  );
}
