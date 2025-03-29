"use client";

import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  isSubmitting: boolean;
  isValid: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

export function FormButtons({
  isSubmitting,
  isValid,
  isEditMode,
  onCancel,
}: FormButtonsProps) {
  return (
    <div className="pt-2 flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="default"
        size="sm"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? "Saving..." : isEditMode ? "Update Note" : "Add Note"}
      </Button>
    </div>
  );
}
