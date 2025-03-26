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
    <tr>
      <td className="font-medium">{name}</td>
      <td>{stock}</td>
      <td>{usage}</td>
      <td>
        <span
          className={`badge ${
            depleted
              ? "badge-error bg-opacity-20 text-error"
              : warning
              ? "badge-warning bg-opacity-20 text-warning"
              : "badge-success bg-opacity-20 text-success"
          }`}
        >
          {depletion}
        </span>
      </td>
    </tr>
  );
};
