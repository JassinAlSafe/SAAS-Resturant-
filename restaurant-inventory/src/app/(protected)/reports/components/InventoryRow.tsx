"use client";

import { InventoryItem } from "../types";

export const InventoryRow = ({
  name,
  stock,
  usage,
  depletion,
  depleted,
  warning,
}: InventoryItem) => {
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-3 px-4 font-medium text-gray-900">{name}</td>
      <td className="py-3 px-4 text-gray-700">{stock}</td>
      <td className="py-3 px-4 text-gray-700">{usage}</td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            depleted
              ? "bg-red-50 text-red-700"
              : warning
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {depletion}
        </span>
      </td>
    </tr>
  );
};
