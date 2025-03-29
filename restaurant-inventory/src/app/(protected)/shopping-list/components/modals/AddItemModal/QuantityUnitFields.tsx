"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, UseFormSetValue } from "react-hook-form";
import { FormData, unitGroups } from "./types";
import { Scale } from "lucide-react";

interface QuantityUnitFieldsProps {
  control: Control<FormData>;
  useCustomUnit: boolean;
  setUseCustomUnit: (value: boolean) => void;
  setValue: UseFormSetValue<FormData>;
}

export default function QuantityUnitFields({
  control,
  useCustomUnit,
  setUseCustomUnit,
  setValue,
}: QuantityUnitFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Scale className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Quantity & Unit</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label">
                <span className="label-text font-medium">
                  Quantity <span className="text-error">*</span>
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  {...field}
                  aria-required="true"
                  className="input input-bordered w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormItem>
            <FormLabel className="label">
              <span className="label-text font-medium">
                Unit <span className="text-error">*</span>
              </span>
            </FormLabel>

            <div className="flex items-center mb-2">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Standard</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={useCustomUnit}
                    onChange={(e) => {
                      setUseCustomUnit(e.target.checked);
                      if (!e.target.checked) {
                        setValue("custom_unit", "");
                      }
                    }}
                  />
                  <span className="label-text ml-2">Custom</span>
                </label>
              </div>
            </div>

            {!useCustomUnit ? (
              <FormField
                control={control}
                name="unit"
                render={({ field }) => (
                  <>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="select select-bordered w-full"
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {Object.entries(unitGroups).map(
                          ([groupName, units]) => (
                            <optgroup
                              key={groupName}
                              label={
                                groupName.charAt(0).toUpperCase() +
                                groupName.slice(1)
                              }
                            >
                              {units.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </optgroup>
                          )
                        )}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </>
                )}
              />
            ) : (
              <FormField
                control={control}
                name="custom_unit"
                render={({ field }) => (
                  <>
                    <FormControl>
                      <Input
                        placeholder="Enter custom unit"
                        {...field}
                        className="input input-bordered w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </>
                )}
              />
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
}
