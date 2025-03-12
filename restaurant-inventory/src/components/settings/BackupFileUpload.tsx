import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FiUpload } from "react-icons/fi";

interface BackupData {
  version: string;
  data: Record<string, unknown>;
}

type BackupFileUploadProps = {
  onFileSelected: (backupData: BackupData) => void;
  isLoading: boolean;
};

export default function BackupFileUpload({
  onFileSelected,
  isLoading,
}: BackupFileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Reset error
    setError(null);

    // Validate file type
    if (file.type !== "application/json") {
      setError("Invalid file type. Please select a JSON backup file.");
      return;
    }

    setSelectedFile(file);

    // Read file contents
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        // Validate basic backup structure
        if (!backupData || !backupData.version || !backupData.data) {
          setError(
            "Invalid backup file format. Please select a valid backup file."
          );
          return;
        }

        // Pass the backup data to the parent component
        onFileSelected(backupData);
      } catch (error) {
        console.error("Error parsing backup file:", error);
        setError("Unable to parse backup file. The file may be corrupted.");
      }
    };

    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Select Backup File</p>
          <p className="text-sm text-slate-500">
            Choose a backup file (.json) to restore from
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <Button
            onClick={triggerFileInput}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FiUpload className="h-4 w-4" />
            <span>Choose File</span>
          </Button>
        </div>
      </div>

      {selectedFile && (
        <div className="p-3 bg-green-50 text-green-800 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs">
              {(selectedFile.size / 1024).toFixed(2)} KB • Selected for restore
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
