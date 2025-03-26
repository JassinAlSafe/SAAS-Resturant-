"use client";

import React, { useState, useRef, useEffect } from "react";
import { announcer } from "./ScreenReaderAnnouncer";

// Define the props for FormAccessibilityWrapper
interface FormAccessibilityWrapperProps {
  children: React.ReactNode;
  formId: string;
  formTitle: string;
  onFormSubmit?: (data: any) => void;
}

// Define the props for AccessibleInput
interface AccessibleInputProps {
  id: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "date"
    | "textarea";
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
  helperText?: string;
  errorMessage?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  className?: string;
}

// Define the props for AccessibleSelect
interface AccessibleSelectProps {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
  helperText?: string;
  errorMessage?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

// Define the props for AccessibleCheckbox
interface AccessibleCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

// Hook to manage form validation and accessibility
export function useFormAccessibility(formId: string) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Validate a specific field
  const validateField = (
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  ) => {
    if (!field) return true;

    const isValid = field.validity.valid;
    const errorMessage = field.validationMessage || "This field is invalid";

    if (!isValid) {
      setErrors((prev) => ({ ...prev, [field.id]: errorMessage }));

      // Announce error to screen readers
      announcer.announce(
        `Error in ${field.name || field.id}: ${errorMessage}`,
        "assertive"
      );
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field.id];
        return newErrors;
      });
    }

    return isValid;
  };

  // Validate the entire form
  const validateForm = () => {
    if (!formRef.current) return true;

    const form = formRef.current;
    const isValid = form.checkValidity();

    if (!isValid) {
      // Find the first invalid field
      const invalidField = Array.from(form.elements).find(
        (element) =>
          element instanceof HTMLInputElement && !element.validity.valid
      ) as HTMLInputElement;

      if (invalidField) {
        invalidField.focus();
        validateField(invalidField);
      }
    } else {
      // Clear all errors
      setErrors({});
    }

    return isValid;
  };

  // Handle form submission with validation
  const handleSubmit =
    (callback?: (data: any) => void) => (e: React.FormEvent) => {
      e.preventDefault();

      if (validateForm() && formRef.current && callback) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        callback(data);

        // Announce success to screen readers
        announcer.announce("Form submitted successfully", "polite");
      }
    };

  return { errors, validateField, validateForm, handleSubmit, formRef };
}

// FormAccessibilityWrapper component
export const FormAccessibilityWrapper: React.FC<
  FormAccessibilityWrapperProps
> = ({ children, formId, formTitle, onFormSubmit }) => {
  const { errors, handleSubmit, formRef } = useFormAccessibility(formId);

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={handleSubmit(onFormSubmit)}
      aria-labelledby={`${formId}-title`}
      className="space-y-4"
      noValidate
    >
      <h2 id={`${formId}-title`} className="text-lg font-medium">
        {formTitle}
      </h2>
      <div className="space-y-3">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              errors,
            });
          }
          return child;
        })}
      </div>
    </form>
  );
};

// AccessibleInput component
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  pattern,
  minLength,
  maxLength,
  min,
  max,
  step,
  defaultValue,
  helperText,
  errorMessage,
  onChange,
  className,
}) => {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Handle validation on blur
  const handleBlur = () => {
    if (inputRef.current) {
      const isValid = inputRef.current.validity.valid;
      if (!isValid) {
        setError(
          inputRef.current.validationMessage ||
            errorMessage ||
            "This field is invalid"
        );
      } else {
        setError(null);
      }
    }
  };

  const inputProps = {
    id,
    name: id,
    placeholder,
    required,
    pattern,
    minLength,
    maxLength,
    min,
    max,
    step,
    defaultValue,
    "aria-describedby": helperText ? `${id}-helper` : undefined,
    "aria-invalid": error ? "true" : "false",
    "aria-required": required ? "true" : "false",
    onChange,
    onBlur: handleBlur,
    className: `input input-bordered w-full ${error ? "input-error" : ""} ${
      className || ""
    }`,
  };

  return (
    <div className="form-control">
      <label htmlFor={id} className="label">
        <span className="label-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      {type === "textarea" ? (
        <textarea
          {...inputProps}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className={`textarea textarea-bordered ${
            error ? "textarea-error" : ""
          } ${className || ""}`}
        />
      ) : (
        <input
          type={type}
          {...inputProps}
          ref={inputRef as React.RefObject<HTMLInputElement>}
        />
      )}

      {helperText && !error && (
        <div id={`${id}-helper`} className="text-sm mt-1 text-gray-500">
          {helperText}
        </div>
      )}

      {error && (
        <div
          id={`${id}-error`}
          className="text-sm mt-1 text-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

// AccessibleSelect component
export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  options,
  required = false,
  defaultValue,
  helperText,
  errorMessage,
  onChange,
  className,
}) => {
  const [error, setError] = useState<string | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Handle validation on blur
  const handleBlur = () => {
    if (selectRef.current) {
      const isValid = selectRef.current.validity.valid;
      if (!isValid) {
        setError(
          selectRef.current.validationMessage ||
            errorMessage ||
            "Please select an option"
        );
      } else {
        setError(null);
      }
    }
  };

  return (
    <div className="form-control">
      <label htmlFor={id} className="label">
        <span className="label-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <select
        id={id}
        name={id}
        ref={selectRef}
        required={required}
        defaultValue={defaultValue}
        aria-describedby={helperText ? `${id}-helper` : undefined}
        aria-invalid={error ? "true" : "false"}
        aria-required={required ? "true" : "false"}
        onChange={onChange}
        onBlur={handleBlur}
        className={`select select-bordered w-full ${
          error ? "select-error" : ""
        } ${className || ""}`}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <div id={`${id}-helper`} className="text-sm mt-1 text-gray-500">
          {helperText}
        </div>
      )}

      {error && (
        <div
          id={`${id}-error`}
          className="text-sm mt-1 text-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

// AccessibleCheckbox component
export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className,
}) => {
  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={checked}
          onChange={onChange}
          className={`checkbox ${className || ""}`}
        />
        <span className="label-text">{label}</span>
      </label>
    </div>
  );
};
