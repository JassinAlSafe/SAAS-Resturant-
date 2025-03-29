"use client";

import React from "react";

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
  maxLength,
  required = false,
  className = "",
}: TextFieldProps) {
  const inputClasses = `w-full ${
    multiline
      ? "textarea textarea-bordered resize-none"
      : "input input-bordered"
  }`;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={inputClasses}
          required={required}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
          required={required}
        />
      )}
    </div>
  );
}
