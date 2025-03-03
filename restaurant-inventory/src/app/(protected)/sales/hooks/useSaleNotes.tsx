"use client";

import { useState } from "react";
import { Sale } from "@/lib/types";

export function useSaleNotes() {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Open notes modal for a sale
  const openNotesModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsNotesModalOpen(true);
  };

  // Close notes modal
  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedSale(null);
  };

  return {
    isNotesModalOpen,
    selectedSale,
    openNotesModal,
    closeNotesModal,
  };
}
