"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";

interface EmptySuppliersProps {
  onAddClick: () => void;
}

export default function EmptySuppliers({ onAddClick }: EmptySuppliersProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FiPlus className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Your Supplier List is Empty
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Add suppliers to keep track of your vendors and their contact
        information. You'll be able to link inventory items to specific
        suppliers.
      </p>
      <Button onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Add Your First Supplier
      </Button>
    </Card>
  );
}
