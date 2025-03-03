import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card";

type EmptyInventoryProps = {
  onAddClick: () => void;
};

export default function EmptyInventory({ onAddClick }: EmptyInventoryProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FiPlus className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your Inventory is Empty</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Start by adding items to your inventory. You&apos;ll be able to track
        quantities, set reorder alerts, and manage costs.
      </p>
      <Button onClick={onAddClick}>
        <FiPlus className="mr-2" />
        Add Your First Item
      </Button>
    </Card>
  );
}
