"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  children: ReactNode;
}

export function FormFieldWrapper({
  id,
  label,
  required = false,
  error,
  success,
  helpText,
  children,
}: FormFieldWrapperProps) {
  const uniqueHelpId = `${id}-help`;
  const uniqueErrorId = `${id}-error`;
  const uniqueSuccessId = `${id}-success`;

  // Compute the aria-describedby attribute value
  const getDescribedBy = () => {
    const ids = [];
    if (helpText) ids.push(uniqueHelpId);
    if (error) ids.push(uniqueErrorId);
    if (success) ids.push(uniqueSuccessId);
    return ids.join(" ") || undefined;
  };

  return (
    <div className="form-control w-full mb-4">
      <label htmlFor={id} className="label">
        <span className="label-text">
          {label} {required && <span className="text-error">*</span>}
        </span>
      </label>

      {/* Wrap the child in a div that provides the ARIA attributes */}
      <div
        className="relative"
        aria-invalid={!!error}
        aria-describedby={getDescribedBy()}
      >
        {children}
      </div>

      {/* Help text */}
      {helpText && (
        <div id={uniqueHelpId} className="text-xs text-base-content/70 mt-1">
          {helpText}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          id={uniqueErrorId}
          className="flex items-center mt-1.5 text-sm text-error"
        >
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div
          id={uniqueSuccessId}
          className="flex items-center mt-1.5 text-sm text-success"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

interface A11yLabelProps {
  children: ReactNode;
  visuallyHidden?: boolean;
  htmlFor?: string;
  id?: string;
}

export function A11yLabel({
  children,
  visuallyHidden = false,
  htmlFor,
  id,
}: A11yLabelProps) {
  const className = visuallyHidden ? "sr-only" : "label-text";

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={className} id={id}>
        {children}
      </label>
    );
  }

  return (
    <span className={className} id={id}>
      {children}
    </span>
  );
}

export default function FormAccessibility() {
  return null; // This is a utility component file, not meant to be rendered directly
}
