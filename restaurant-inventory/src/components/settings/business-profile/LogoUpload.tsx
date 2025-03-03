import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FiUpload } from "react-icons/fi";
import Image from "next/image";

interface LogoUploadProps {
  logoPreview: string | null;
  isLoading: boolean;
  onUpload: (file: File) => void;
}

export function LogoUpload({
  logoPreview,
  isLoading,
  onUpload,
}: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
        {logoPreview ? (
          <div className="relative w-48 h-48 mb-4">
            <Image
              src={logoPreview}
              alt="Business Logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-muted flex items-center justify-center mb-4 rounded-md">
            <span className="text-muted-foreground">No logo uploaded</span>
          </div>
        )}

        <Button
          type="button"
          onClick={triggerFileInput}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            "Uploading..."
          ) : (
            <>
              <FiUpload className="mr-2 h-4 w-4" />
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        <p className="text-xs text-muted-foreground mt-2">
          Recommended size: 300x300 pixels. Max file size: 5MB.
          <br />
          Supported formats: PNG, JPEG, GIF, WebP, SVG
        </p>
      </div>
    </div>
  );
}
