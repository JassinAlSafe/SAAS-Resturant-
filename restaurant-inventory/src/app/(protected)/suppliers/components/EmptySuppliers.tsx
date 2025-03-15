"use client";

import { Button } from "@/components/ui/button";
import { FiPlus, FiUsers } from "react-icons/fi";

interface EmptySuppliersProps {
  onAddClick: () => void;
}

export default function EmptySuppliers({ onAddClick }: EmptySuppliersProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-8 rounded-full mb-8 border border-blue-100 shadow-md">
        <FiUsers className="h-14 w-14 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">
        Your Supplier List is Empty
      </h2>
      <p className="text-gray-500 max-w-md mb-8 text-base">
        Add suppliers to keep track of your vendors and their contact
        information. You&apos;ll be able to link inventory items to specific
        suppliers.
      </p>
      <Button
        onClick={onAddClick}
        className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-5 h-auto rounded-xl shadow-md transition-all duration-200 font-medium text-base"
      >
        <FiPlus className="mr-2 h-5 w-5" />
        Add Your First Supplier
      </Button>
    </div>
  );
}
