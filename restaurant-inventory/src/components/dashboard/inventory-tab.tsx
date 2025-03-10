import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function InventoryTab() {
  const router = useRouter();

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Inventory Dashboard</h3>
        <p className="text-muted-foreground mb-4">
          This tab would contain detailed inventory analytics
        </p>
        <Button onClick={() => router.push("/inventory")}>
          Go to Inventory
        </Button>
      </div>
    </div>
  );
}
