"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /**
   * The currently selected value in the group
   */
  value?: string;
  /**
   * Callback when the selected value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Default value for uncontrolled usage
   */
  defaultValue?: string;
}

export interface RadioGroupItemProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "size"
  > {
  /**
   * The value of the radio item
   */
  value: string;
  /**
   * Color variant of the radio
   */
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info";
  /**
   * Size of the radio
   */
  size?: "xs" | "sm" | "md" | "lg";
}

/**
 * RadioGroup component using DaisyUI styling
 */
const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    { className, value, onValueChange, defaultValue, children, ...props },
    ref
  ) => {
    // Since we're using native HTML, we need to track the value for uncontrolled components
    const [internalValue, setInternalValue] = React.useState(
      defaultValue || ""
    );

    // For controlled components, use the provided value
    const currentValue = value !== undefined ? value : internalValue;

    // Handler to update the value
    const handleChange = React.useCallback(
      (newValue: string) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    // Create a context to pass the value and onChange handler to children
    const contextValue = React.useMemo(
      () => ({
        value: currentValue,
        onChange: handleChange,
      }),
      [currentValue, handleChange]
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <fieldset ref={ref} className={cn("grid gap-2", className)} {...props}>
          {children}
        </fieldset>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

// Create a context to share the radio group state with items
const RadioGroupContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
}>({
  value: "",
  onChange: () => {},
});

/**
 * RadioGroupItem component using DaisyUI styling
 */
const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  (
    { className, id, value, variant = "primary", size = "md", ...props },
    ref
  ) => {
    const { value: groupValue, onChange } = React.useContext(RadioGroupContext);
    const inputId = id || `radio-${value}`;

    return (
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="flex items-center cursor-pointer gap-2"
        >
          <input
            ref={ref}
            type="radio"
            id={inputId}
            value={value}
            checked={value === groupValue}
            onChange={(e) => {
              if (e.target.checked) {
                onChange(value);
              }
            }}
            className={cn(
              "radio",
              variant && `radio-${variant}`,
              size && `radio-${size}`,
              className
            )}
            {...props}
          />
          <span className="text-sm">{props.children}</span>
        </label>
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
