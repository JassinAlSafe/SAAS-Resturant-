"use client";

import { CircleCheck } from "lucide-react";
import { WIZARD_STEPS } from "./types";

interface WizardStepsProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

export default function WizardSteps({
  currentStep,
  setCurrentStep,
}: WizardStepsProps) {
  return (
    <div className="w-full py-2 mb-4">
      <div className="flex items-center justify-between relative">
        {WIZARD_STEPS.map((step) => {
          const isCompleted =
            (step.id === "plan" &&
              ["shop", "complete"].includes(currentStep)) ||
            (step.id === "shop" && currentStep === "complete");
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center z-10 w-1/3"
            >
              <div
                className="tooltip tooltip-bottom w-full flex justify-center"
                data-tip={step.description}
              >
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`
                    btn btn-circle ${
                      isCompleted
                        ? "btn-primary btn-outline border-2"
                        : isCurrent
                        ? "btn-primary"
                        : "btn-ghost border border-base-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CircleCheck className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <span
                className={`
                mt-2 text-sm font-medium ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-primary/80"
                    : "text-base-content/60"
                }
              `}
              >
                {step.title}
              </span>
            </div>
          );
        })}

        {/* Progress line */}
        <div className="absolute top-6 left-0 w-full h-[2px] bg-base-300 -z-0">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width:
                currentStep === "plan"
                  ? "0%"
                  : currentStep === "shop"
                  ? "50%"
                  : "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
