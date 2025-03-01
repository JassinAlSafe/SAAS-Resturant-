import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface CategoryStatsCardProps {
  className?: string;
  title: string;
  categories: CategoryItem[];
}

const CategoryStatsCard = ({
  className,
  title,
  categories,
}: CategoryStatsCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
        <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                  category.color
                )}
              >
                {category.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{category.name}</p>
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        category.change > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {category.change > 0 ? "+" : ""}
                      {category.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold">
                    {category.count.toLocaleString()}
                  </p>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        category.color.includes("bg-")
                          ? category.color
                          : "bg-primary/60"
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          (category.count /
                            Math.max(...categories.map((c) => c.count))) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryStatsCard;
