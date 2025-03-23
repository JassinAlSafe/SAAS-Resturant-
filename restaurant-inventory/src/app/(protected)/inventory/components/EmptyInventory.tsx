import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card";
import { motion } from "framer-motion";

type EmptyInventoryProps = {
  onAddClick: () => void;
  isFiltered?: boolean;
  isLoading?: boolean;
  filterDescription?: string;
};

export default function EmptyInventory({
  onAddClick,
  isFiltered = false,
  isLoading = false,
  filterDescription = "No items match your current filters. Try adjusting your search criteria.",
}: EmptyInventoryProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading inventory</h2>
        <p className="text-muted-foreground max-w-md">
          Please wait while we fetch your inventory data.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <FiPlus className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {isFiltered ? "No matching items" : "Your Inventory is Empty"}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {isFiltered
            ? filterDescription
            : "Start by adding items to your inventory. You\'ll be able to track quantities, set reorder alerts, and manage costs."}
        </p>
        {!isFiltered && (
          <Button onClick={onAddClick} className="flex items-center gap-1.5">
            <FiPlus />
            Add Your First Item
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
