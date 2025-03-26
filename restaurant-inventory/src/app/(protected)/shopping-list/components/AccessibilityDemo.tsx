"use client";

import React, { useState } from "react";
import { announcer } from "./ScreenReaderAnnouncer";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  FormAccessibilityWrapper,
  AccessibleInput,
  AccessibleSelect,
  AccessibleCheckbox,
} from "./FormAccessibility";
import { Lightbulb, Check, AlertTriangle } from "lucide-react";
import { toast } from "../utils/toast";

// Define form data type
interface FormSubmitData {
  "item-name"?: string;
  "item-quantity"?: number;
  "item-category"?: string;
  "item-urgent"?: boolean;
  [key: string]: string | number | boolean | undefined;
}

const AccessibilityDemo: React.FC = () => {
  const { settings } = useAccessibility();
  const [formData, setFormData] = useState<FormSubmitData | null>(null);

  const handleFormSubmit = (data: FormSubmitData) => {
    setFormData(data);
    toast.success("Demo form submitted successfully!", {
      screenReaderMessage: "Form successfully submitted with sample data.",
    });
    announcer.announce("Demo form submitted successfully!", "polite");
  };

  const handleScreenReaderAnnounce = () => {
    toast.info("Screen reader announcement made", {
      screenReaderMessage:
        "This is a demonstration of screen reader announcements. They help users with screen readers understand what is happening.",
    });
    announcer.announce(
      "This is a demonstration of screen reader announcements. They help users with screen readers understand what is happening.",
      "polite"
    );
  };

  const handleErrorAnnounce = () => {
    toast.error("Error example shown", {
      screenReaderMessage:
        "This is a demonstration of an error announcement. Error messages should be assertive to get the user&apos;s attention immediately.",
    });
    announcer.announce(
      "This is a demonstration of an error announcement. Error messages should be assertive to get the user&apos;s attention immediately.",
      "assertive"
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Accessibility Features Demonstration
        </h2>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Active Accessibility Settings
            </h3>

            <div className="bg-base-200 p-4 rounded-lg">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span
                    className={
                      settings.highContrast ? "text-success" : "text-error"
                    }
                  >
                    {settings.highContrast ? (
                      <Check />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  High Contrast Mode
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      settings.reducedMotion ? "text-success" : "text-error"
                    }
                  >
                    {settings.reducedMotion ? (
                      <Check />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  Reduced Motion
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      settings.largeText ? "text-success" : "text-error"
                    }
                  >
                    {settings.largeText ? (
                      <Check />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  Large Text
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      settings.keyboardFocus ? "text-success" : "text-error"
                    }
                  >
                    {settings.keyboardFocus ? (
                      <Check />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  Keyboard Focus Indicators
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      settings.screenReaderOptimized
                        ? "text-success"
                        : "text-error"
                    }
                  >
                    {settings.screenReaderOptimized ? (
                      <Check />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  Screen Reader Optimizations
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-md font-medium">
                Screen Reader Announcements
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleScreenReaderAnnounce}
                  className="btn btn-primary btn-sm"
                  aria-label="Demonstrate polite announcement"
                >
                  Polite Announcement
                </button>
                <button
                  onClick={handleErrorAnnounce}
                  className="btn btn-error btn-sm"
                  aria-label="Demonstrate assertive announcement"
                >
                  Error Announcement
                </button>
              </div>
              <p className="text-sm text-base-content/70">
                These buttons trigger announcements for screen readers. They are
                invisible to sighted users but help screen reader users
                understand what&apos;s happening.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              Accessible Form Example
            </h3>

            <FormAccessibilityWrapper
              formId="demo-form"
              formTitle="Inventory Item Form"
              onFormSubmit={handleFormSubmit}
            >
              <AccessibleInput
                id="item-name"
                label="Item Name"
                required
                minLength={3}
                maxLength={50}
                helperText="Enter the name of the inventory item"
              />

              <AccessibleInput
                id="item-quantity"
                label="Quantity"
                type="number"
                required
                min={1}
                max={1000}
                helperText="Enter a number between 1 and 1000"
              />

              <AccessibleSelect
                id="item-category"
                label="Category"
                required
                options={[
                  { value: "produce", label: "Produce" },
                  { value: "dairy", label: "Dairy" },
                  { value: "meat", label: "Meat" },
                  { value: "bakery", label: "Bakery" },
                  { value: "pantry", label: "Pantry" },
                ]}
                helperText="Select the item category"
              />

              <AccessibleCheckbox id="item-urgent" label="Mark as urgent" />

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  aria-label="Submit form"
                >
                  Submit
                </button>
              </div>
            </FormAccessibilityWrapper>

            {formData && (
              <div
                className="mt-4 p-4 bg-success/10 rounded-lg"
                role="status"
                aria-live="polite"
              >
                <h4 className="font-medium text-success flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Form Submitted Successfully!
                </h4>
                <div className="text-sm mt-2">
                  <pre className="whitespace-pre-wrap bg-base-300 p-2 rounded">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-base-200 p-4 rounded-lg">
          <h3 className="font-medium">Keyboard Navigation Tips</h3>
          <p className="text-sm text-base-content/70 mt-1">
            Press <kbd className="kbd kbd-sm">Shift</kbd> +{" "}
            <kbd className="kbd kbd-sm">?</kbd> to view all keyboard shortcuts.
            Use <kbd className="kbd kbd-sm">Tab</kbd> to navigate between
            elements and
            <kbd className="kbd kbd-sm">Enter</kbd> or{" "}
            <kbd className="kbd kbd-sm">Space</kbd> to activate buttons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityDemo;
