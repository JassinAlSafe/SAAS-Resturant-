"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiUsers } from "react-icons/fi";

interface EmptySuppliersProps {
  onAddClick: () => void;
}

export default function EmptySuppliers({ onAddClick }: EmptySuppliersProps) {
  return (
    <div className="bg-white border rounded-lg shadow-sm flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6 border border-blue-100">
        <FiUsers className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        Your Supplier List is Empty
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Add suppliers to keep track of your vendors and their contact
        information. You&apos;ll be able to link inventory items to specific
        suppliers.
      </p>
      <Button
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Your First Supplier
      </Button>
    </div>
  );
}
