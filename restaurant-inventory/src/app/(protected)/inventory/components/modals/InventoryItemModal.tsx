"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { InventoryItem, Supplier } from "@/lib/types";
import { COMMON_CATEGORIES } from "@/lib/constants";
import { FiInfo, FiPackage, FiDollarSign, FiBox } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BaseModal } from "@/components/ui/modal/base-modal";

// Interface for form data that includes both snake_case and camelCase properties
interface InventoryFormData
  extends Omit<
    InventoryItem,
    "id" | "created_at" | "updated_at" | "cost_per_unit" | "business_profile_id"
  > {
  expiryDate?: string;
  image_url?: string;
  supplier_id?: string;
}

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: InventoryFormData) => void;
  onUpdate?: (itemData: InventoryFormData) => void;
  item?: InventoryItem;
  customCategories?: string[];
  suppliers?: Supplier[];
  userRole?: "admin" | "manager" | "staff";
}

// Section component for modal content organization
const ModalSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}> = ({ title, icon, children, className, divider = false }) => {
  return (
    <div
      className={cn(
        "space-y-4",
        divider && "border-b border-gray-100 pb-6 mb-6",
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2.5 text-gray-900">
          {icon && <div className="text-gray-500">{icon}</div>}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  customCategories = [],
  suppliers,
  userRole,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    cost: 0,
    reorder_level: 0,
    description: "",
    location: "",
    expiry_date: "",
    supplier_id: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof InventoryFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item?.name || "",
        category: item?.category || "",
        quantity: item?.quantity || 0,
        unit: item?.unit || "",
        cost: item?.cost || 0,
        reorder_level: item?.reorder_level || 0,
        description: item?.description || "",
        location: item?.location || "",
        expiry_date: item?.expiry_date || "",
        image_url: item?.image_url || "",
        supplier_id: item?.supplier_id || "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  // Common units for inventory items
  const commonUnits = ["pcs", "kg", "g", "l", "ml", "box", "pack"];

  // All available categories
  const allCategories = useMemo(() => {
    return [...new Set([...COMMON_CATEGORIES, ...(customCategories || [])])];
  }, [customCategories]);

  // Handle form field changes
  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >
        | { name: string; value: string | number }
    ) => {
      const { name, value } = "target" in e ? e.target : e;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof InventoryFormData]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof InventoryFormData];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle numeric input changes
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = value === "" ? 0 : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
      if (errors[name as keyof InventoryFormData]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof InventoryFormData];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    if (formData.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }
    if (formData.reorder_level < 0) {
      newErrors.reorder_level = "Reorder level cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (item) {
        await onUpdate?.(formData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, item, onSave, onUpdate, onClose, validateForm]);

  // Log modal state changes for debugging
  useEffect(() => {
    console.log("Modal state changed:", { isOpen });
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      position="middle"
      size="xl"
      className="p-0 overflow-hidden"
    >
      {/* Close button X */}
      <button
        className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-gray-900 hover:bg-gray-100 z-10"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Modal Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FiPackage className="text-primary h-6 w-6" />
            {item ? (
              <span>
                Edit <span className="text-primary">{item.name}</span>
              </span>
            ) : (
              "Add New Item"
            )}
          </div>
          <p className="text-base text-gray-600 mt-2">
            {item
              ? "Update the details of this inventory item"
              : "Add a new item to your inventory"}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Basic Information */}
          <ModalSection title="Basic Information" icon={<FiInfo />} divider>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Item Name <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  variant={errors.name ? "error" : undefined}
                />
                {errors.name && (
                  <p className="text-xs text-error">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-error">*</span>
                </label>
                <select
                  className={cn(
                    "select w-full",
                    errors.category ? "select-error" : "select-bordered"
                  )}
                  value={formData.category}
                  onChange={(e) =>
                    handleChange({ name: "category", value: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-error">{errors.category}</p>
                )}
              </div>
            </div>
          </ModalSection>

          {/* Cost and Unit Information */}
          <ModalSection
            title="Cost & Unit Information"
            icon={<FiDollarSign />}
            divider
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cost Per Unit <span className="text-error">*</span>
                </label>
                <div className="join w-full">
                  <span className="join-item inline-flex items-center px-3 border border-base-300 bg-base-200 text-base-content text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleNumberChange}
                    className="join-item rounded-l-none w-full"
                    variant={errors.cost ? "error" : undefined}
                  />
                </div>
                {errors.cost && (
                  <p className="text-xs text-error">{errors.cost}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Unit <span className="text-error">*</span>
                </label>
                <select
                  className={cn(
                    "select w-full",
                    errors.unit ? "select-error" : "select-bordered"
                  )}
                  value={formData.unit}
                  onChange={(e) =>
                    handleChange({ name: "unit", value: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {commonUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-xs text-error">{errors.unit}</p>
                )}
              </div>
            </div>
          </ModalSection>

          {/* Stock Management */}
          <ModalSection title="Stock Management" icon={<FiBox />} divider>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quantity <span className="text-error">*</span>
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  variant={errors.quantity ? "error" : undefined}
                />
                {errors.quantity && (
                  <p className="text-xs text-error">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reorder Level</label>
                <Input
                  type="number"
                  name="reorder_level"
                  min="0"
                  value={formData.reorder_level}
                  onChange={handleNumberChange}
                />
                <p className="text-xs text-base-content/70">
                  Minimum quantity before reorder alert
                </p>
              </div>
            </div>
          </ModalSection>

          {/* Additional Details */}
          <ModalSection title="Additional Details" icon={<FiInfo />}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description..."
                  className="h-24"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Storage Location
                  </label>
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Kitchen Storage A"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {suppliers && suppliers.length > 0 && (
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Supplier</label>
                  <select
                    className="select w-full select-bordered"
                    name="supplier_id"
                    value={formData.supplier_id || ""}
                    onChange={(e) =>
                      handleChange({
                        name: "supplier_id",
                        value: e.target.value,
                      })
                    }
                  >
                    <option value="">No supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-base-content/70">
                    Select the supplier for this item
                  </p>
                </div>
              )}

              {/* Additional image URL field (visible only for admin/manager) */}
              {(userRole === "admin" || userRole === "manager") && (
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-base-content/70">
                    Enter a URL for an image of this item
                  </p>
                </div>
              )}
            </div>
          </ModalSection>
        </form>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 mt-4 bg-gray-50 border-t border-gray-100 modal-action justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-10 px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          className="h-10 px-4"
        >
          {isSubmitting ? "Processing..." : item ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </BaseModal>
  );
};

export default InventoryItemModal;
