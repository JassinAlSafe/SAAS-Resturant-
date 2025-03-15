import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SalesTabProps {
  isLoading: boolean;
}

export function SalesTab({ isLoading }: SalesTabProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl border shadow-xs p-6">
          <div className="h-6 w-1/3 bg-muted/70 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/70 rounded"></div>
            <div className="h-4 w-2/3 bg-muted/70 rounded"></div>
            <div className="h-4 w-5/6 bg-muted/70 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border shadow-xs p-6">
            <div className="h-6 w-1/2 bg-muted/70 rounded mb-4"></div>
            <div className="h-36 bg-muted/50 rounded"></div>
          </div>
          <div className="bg-card rounded-xl border shadow-xs p-6">
            <div className="h-6 w-1/2 bg-muted/70 rounded mb-4"></div>
            <div className="h-36 bg-muted/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-xs p-6 flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Sales Dashboard</h3>
        <p className="text-muted-foreground mb-4">
          This tab would contain detailed sales analytics
        </p>
        <Button onClick={() => router.push("/sales")}>Go to Sales</Button>
      </div>
    </div>
  );
}
