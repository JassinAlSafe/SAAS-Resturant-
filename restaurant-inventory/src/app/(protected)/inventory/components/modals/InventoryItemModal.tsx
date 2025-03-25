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
  suppliers = [],
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
      // Try to get the description and location from localStorage if this is an existing item
      let savedDescription = "";
      let savedLocation = "";
      if (item?.id) {
        try {
          const descriptionKey = `item_description_${item.id}`;
          const locationKey = `item_location_${item.id}`;
          
          const storedDescription = localStorage.getItem(descriptionKey);
          const storedLocation = localStorage.getItem(locationKey);
          
          if (storedDescription) {
            savedDescription = storedDescription;
          }
          
          if (storedLocation) {
            savedLocation = storedLocation;
          }
        } catch (e) {
          console.warn('Could not retrieve data from localStorage:', e);
        }
      }

      setFormData({
        name: item?.name || "",
        category: item?.category || "",
        quantity: item?.quantity || 0,
        unit: item?.unit || "",
        cost: item?.cost || 0,
        reorder_level: item?.reorder_level || 0,
        description: savedDescription || item?.description || "",
        location: savedLocation || item?.location || "",
        expiry_date: item?.expiry_date || "",
        image_url: item?.image_url || "",
        supplier_id: item?.supplier_id || "",
      });
      setErrors({});
      setIsSubmitting(false);
      setActiveTab("basic");
    }
  }, [isOpen, item]);

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
      // Create a copy of the form data
      const formDataForSubmit = { ...formData };
      
      // Store client-side only fields in localStorage for this item if we're updating
      if (item && item.id) {
        try {
          // Use prefixes to avoid conflicts
          if (formData.description) {
            const descriptionKey = `item_description_${item.id}`;
            localStorage.setItem(descriptionKey, formData.description);
          }
          
          if (formData.location) {
            const locationKey = `item_location_${item.id}`;
            localStorage.setItem(locationKey, formData.location);
          }
        } catch (e) {
          console.warn('Could not save data to localStorage:', e);
        }
      }
      
      if (item) {
        await onUpdate?.(formDataForSubmit);
      } else {
        await onSave(formDataForSubmit);
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
            <div className="grid grid-cols-1 gap-5">
              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-block">
                  Item Name <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className={cn(
                    "w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm",
                    errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.name && (
                  <div className="mt-1.5 flex items-center text-red-500 text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <fieldset className="w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 inline-block">
                    Category <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      handleChange({ name: "category", value: e.target.value })
                    }
                    className={cn(
                      "w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm",
                      errors.category && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
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
                    <div className="mt-1.5 flex items-center text-red-500 text-sm">
                      <FiAlertCircle className="mr-1 h-4 w-4" />
                      {errors.category}
                    </div>
                  )}
                </fieldset>

                <fieldset className="w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                    <FiImage className="mr-2 h-4 w-4" /> Image URL
                  </label>
                  <Input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
                  />
                </fieldset>
              </div>

              {formData.image_url && (
                <div className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-md border border-gray-200 flex items-center justify-center overflow-hidden relative">
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
                  <span className="text-sm text-gray-600">
                    Image preview
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case "cost":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiDollarSign className="mr-2 h-4 w-4" />
                  Cost Per Unit <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleNumberChange}
                    className={cn(
                      "pl-7 w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm",
                      errors.cost && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {errors.cost && (
                  <div className="mt-1.5 flex items-center text-red-500 text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.cost}
                  </div>
                )}
              </fieldset>

              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  Unit <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.unit}
                  onChange={(e) =>
                    handleChange({ name: "unit", value: e.target.value })
                  }
                  className={cn(
                    "w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm",
                    errors.unit && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
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
                  <div className="mt-1.5 flex items-center text-red-500 text-sm">
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
              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiBox className="mr-2 h-4 w-4" />
                  Quantity <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  className={cn(
                    "w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm",
                    errors.quantity && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.quantity && (
                  <div className="mt-1.5 flex items-center text-red-500 text-sm">
                    <FiAlertCircle className="mr-1 h-4 w-4" />
                    {errors.quantity}
                  </div>
                )}
              </fieldset>

              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiAlertCircle className="mr-2 h-4 w-4" /> Reorder Level
                </label>
                <Input
                  type="number"
                  name="reorder_level"
                  min="0"
                  value={formData.reorder_level}
                  onChange={handleNumberChange}
                  className="w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
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
            <fieldset className="w-full">
              <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                <FiInfo className="mr-2 h-4 w-4" /> Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description..."
                className="w-full h-24 text-base px-4 py-3 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
              />
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiMapPin className="mr-2 h-4 w-4" /> Storage Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Kitchen Storage A"
                  className="w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
                />
              </fieldset>

              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4" /> Expiry Date
                </label>
                <Input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full h-12 text-base px-4 bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
                />
              </fieldset>
            </div>

            {suppliers && suppliers.length > 0 && (
              <fieldset className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center">
                  <FiTruck className="mr-2 h-4 w-4" /> Supplier
                </label>
                <Select
                  value={formData.supplier_id || ""}
                  onChange={(e) =>
                    handleChange({ name: "supplier_id", value: e.target.value })
                  }
                  className="w-full h-12 text-base bg-white border-2 border-gray-200 focus:border-teal-500 shadow-sm"
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
    basic: <FiInfo className="h-5 w-5" />,
    cost: <FiDollarSign className="h-5 w-5" />,
    stock: <FiBox className="h-5 w-5" />,
    details: <FiInfo className="h-5 w-5" />,
  };

  const tabLabels = {
    basic: "Basic Info",
    cost: "Cost & Unit",
    stock: "Stock",
    details: "Details",
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <FiPackage className="text-orange-500 h-6 w-6" />
      <h3 className="text-xl font-bold">
        {item ? `Edit ${item.name}` : "Add New Item"}
      </h3>
    </div>
  );

  const modalDescription = item
    ? "Update the details of this inventory item"
    : "Add a new item to your inventory";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="xl"
      className="min-h-[500px] w-full"
      footer={
        <div className="flex justify-between w-full items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <span className="text-red-500 mr-1">*</span> Required fields
          </span>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-6 text-base font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                item ? "Update Item" : "Add Item"
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 min-h-[300px]" ref={modalRef}>
        {/* Improved tab navigation with better active state */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-md flex-1 transition-all duration-200",
                activeTab === key
                  ? "bg-white shadow-sm text-teal-600 font-medium"
                  : "text-gray-600 hover:bg-gray-200"
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 px-1">
          <div className="min-h-[200px]">
            {renderTabContent()}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InventoryItemModal;
