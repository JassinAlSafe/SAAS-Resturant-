"use client";

import { FiUsers } from "react-icons/fi";

interface SupplierHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function SupplierHeader({ error, retry }: SupplierHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
        <FiUsers className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-sm text-gray-500">
          Manage your suppliers and vendor contacts
        </p>
      </div>
    </div>
  );
}
