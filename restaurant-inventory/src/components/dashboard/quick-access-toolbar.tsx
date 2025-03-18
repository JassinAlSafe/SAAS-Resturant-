import { Button } from "@/components/ui/button";
import {
  FiPlus,
  FiAlertTriangle,
  FiDollarSign,
  FiBarChart2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

interface QuickAccessToolbarProps {
  isLoading?: boolean;
}

export function QuickAccessToolbar({
  isLoading = false,
}: QuickAccessToolbarProps) {
  const router = useRouter();

  return (
    <div className="bg-card border border-border/50 rounded-lg p-2 mb-6 flex items-center overflow-x-auto">
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={() => router.push("/inventory/add")}
        >
          <FiPlus className="mr-1 h-4 w-4" /> Add Item
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={() => router.push("/inventory?filter=low")}
        >
          <FiAlertTriangle className="mr-1 h-4 w-4" /> Low Stock
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={() => router.push("/sales/new")}
        >
          <FiDollarSign className="mr-1 h-4 w-4" /> Record Sale
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={() => router.push("/reports")}
        >
          <FiBarChart2 className="mr-1 h-4 w-4" /> Reports
        </Button>
      </div>
    </div>
  );
}
