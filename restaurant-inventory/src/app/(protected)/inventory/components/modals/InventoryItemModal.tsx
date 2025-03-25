"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { InventoryItem, Supplier } from "@/lib/types";
import { COMMON_CATEGORIES } from "@/lib/constants";
import {
  FiInfo,
  FiPackage,
  FiDollarSign,
  FiBox,
  FiImage,
  FiMapPin,
  FiCalendar,
  FiTruck,
  FiAlertCircle,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import Image from "next/image";

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

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  customCategories = [],
  suppliers,
}) => {
  // Modal focus trap ref
  const modalRef = useRef<HTMLDivElement>(null);

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
  const [activeTab, setActiveTab] = useState("basic");

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
      setActiveTab("basic");
    }
  }, [isOpen, item]);

  // Focus trap implementation for accessibility
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus first element when modal opens
    setTimeout(() => {
      firstElement.focus();
    }, 100);

    const handleTabKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleTabKeyPress);
    document.addEventListener("keydown", handleEscapeKeyPress);

    return () => {
      document.removeEventListener("keydown", handleTabKeyPress);
      document.removeEventListener("keydown", handleEscapeKeyPress);
    };
  }, [isOpen, onClose]);

  // Common units for inventory items with friendly names
  const commonUnits = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilograms" },
    { value: "g", label: "Grams" },
    { value: "l", label: "Liters" },
    { value: "ml", label: "Milliliters" },
    { value: "box", label: "Boxes" },
    { value: "pack", label: "Packs" },
    { value: "cans", label: "Cans" },
    { value: "bottles", label: "Bottles" },
    { value: "bags", label: "Bags" },
  ];

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
    if (!validateForm()) {
      // If there are errors, switch to the first tab that has errors
      if (errors.name || errors.category) {
        setActiveTab("basic");
      } else if (errors.cost || errors.unit) {
        setActiveTab("cost");
      } else if (errors.quantity || errors.reorder_level) {
        setActiveTab("stock");
      }
      return;
    }

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
  }, [formData, item, onSave, onUpdate, onClose, validateForm, errors]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="fieldset w-full">
                <label className="label font-medium">
                  Item Name <span className="text-error ml-1">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className={cn(errors.name && "input-error")}
                />
                {errors.name && (
                  <div className="mt-1.5 flex items-center text-error text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <label className="label font-medium">
                  Category <span className="text-error ml-1">*</span>
                </label>
                <Select
                  variant="primary"
                  value={formData.category}
                  onChange={(e) =>
                    handleChange({ name: "category", value: e.target.value })
                  }
                  className={cn(errors.category && "select-error")}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                {errors.category && (
                  <div className="mt-1.5 flex items-center text-error text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.category}
                  </div>
                )}
              </fieldset>
            </div>

            <fieldset className="fieldset w-full">
              <label className="label font-medium flex items-center">
                <FiImage className="mr-2 h-4 w-4" /> Image URL
              </label>
              <Input
                type="text"
                name="image_url"
                value={formData.image_url || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="input w-full"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Enter a URL for an image of this item
              </span>

              {formData.image_url && (
                <div className="mt-3 p-3 bg-base-200 rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-md border border-base-300 flex items-center justify-center overflow-hidden relative">
                    <Image
                      src={
                        formData.image_url ||
                        "https://placehold.co/100x100/e9e9e9/959595?text=No+Image"
                      }
                      alt="Item preview"
                      fill
                      sizes="64px"
                      className="object-contain"
                      onError={() => {
                        // Do nothing - fallback handled by src
                      }}
                    />
                  </div>
                  <span className="text-sm text-base-content/70">
                    Image preview
                  </span>
                </div>
              )}
            </fieldset>
          </div>
        );

      case "cost":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiDollarSign className="mr-2 h-4 w-4" />
                  Cost Per Unit <span className="text-error ml-1">*</span>
                </label>
                <label className="input-group">
                  <span className="bg-base-300">$</span>
                  <Input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleNumberChange}
                    className={cn(errors.cost && "input-error")}
                  />
                </label>
                {errors.cost && (
                  <div className="mt-1.5 flex items-center text-error text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.cost}
                  </div>
                )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  Unit <span className="text-error ml-1">*</span>
                </label>
                <Select
                  variant="primary"
                  value={formData.unit}
                  onChange={(e) =>
                    handleChange({ name: "unit", value: e.target.value })
                  }
                  className={cn(errors.unit && "select-error")}
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {commonUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label} ({unit.value})
                    </option>
                  ))}
                </Select>
                {errors.unit && (
                  <div className="mt-1.5 flex items-center text-error text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.unit}
                  </div>
                )}
              </fieldset>
            </div>
          </div>
        );

      case "stock":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiBox className="mr-2 h-4 w-4" />
                  Quantity <span className="text-error ml-1">*</span>
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  className={cn(errors.quantity && "input-error")}
                />
                {errors.quantity && (
                  <div className="mt-1.5 flex items-center text-error text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.quantity}
                  </div>
                )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiAlertCircle className="mr-2 h-4 w-4" /> Reorder Level
                </label>
                <Input
                  type="number"
                  name="reorder_level"
                  min="0"
                  value={formData.reorder_level}
                  onChange={handleNumberChange}
                  className="input w-full"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Minimum quantity before reorder alert
                </span>
              </fieldset>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-5">
            <fieldset className="fieldset w-full">
              <label className="label font-medium flex items-center">
                <FiInfo className="mr-2 h-4 w-4" /> Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description..."
                className="textarea h-24"
              />
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiMapPin className="mr-2 h-4 w-4" /> Storage Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Kitchen Storage A"
                  className="input w-full"
                />
              </fieldset>

              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4" /> Expiry Date
                </label>
                <Input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="input w-full"
                />
              </fieldset>
            </div>

            {suppliers && suppliers.length > 0 && (
              <fieldset className="fieldset w-full">
                <label className="label font-medium flex items-center">
                  <FiTruck className="mr-2 h-4 w-4" /> Supplier
                </label>
                <Select
                  variant="primary"
                  value={formData.supplier_id || ""}
                  onChange={(e) =>
                    handleChange({ name: "supplier_id", value: e.target.value })
                  }
                  className="select w-full"
                >
                  <option value="">No supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
                <span className="text-xs text-gray-500 mt-1 block">
                  Select the supplier for this item
                </span>
              </fieldset>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const tabIcons = {
    basic: <FiInfo className="h-4 w-4" />,
    cost: <FiDollarSign className="h-4 w-4" />,
    stock: <FiBox className="h-4 w-4" />,
    details: <FiInfo className="h-4 w-4" />,
  };

  const tabLabels = {
    basic: "Basic Info",
    cost: "Cost & Unit",
    stock: "Stock",
    details: "Details",
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <FiPackage className="text-primary h-6 w-6" />
      <h3 className="text-xl font-bold">
        {item ? `Edit ${item.name}` : "Add New Item"}
      </h3>
    </div>
  );

  const modalDescription = item
    ? "Update the details of this inventory item"
    : "Add a new item to your inventory";

  const modalFooter = (
    <div className="flex justify-between w-full items-center">
      <span className="text-xs text-base-content/70 flex items-center">
        <span className="text-error mr-1">*</span> Required fields
      </span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {item ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      footer={modalFooter}
      size="xl"
    >
      <div className="px-6" ref={modalRef}>
        {/* Improved tab navigation with better active state */}
        <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={cn(
                "tab gap-2 transition-all duration-200 flex-1",
                activeTab === key
                  ? "tab-active bg-primary text-primary-content font-medium"
                  : "hover:bg-base-300"
              )}
              onClick={() => setActiveTab(key)}
              aria-selected={activeTab === key}
              role="tab"
            >
              {tabIcons[key as keyof typeof tabIcons]}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">
                {tabIcons[key as keyof typeof tabIcons]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {renderTabContent()}
        </form>
      </div>
    </Modal>
  );
};

export default InventoryItemModal;
