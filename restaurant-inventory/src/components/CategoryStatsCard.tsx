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
    <Card className={cn("overflow-hidden bg-card shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800">
            {title}
          </CardTitle>
        </div>
        <button className="p-1 rounded-md hover:bg-slate-100">
          <MoreVertical className="h-5 w-5 text-slate-400" />
        </button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-md flex items-center justify-center ${category.color}`}
              >
                {category.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">
                    {category.name}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    +{category.change}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold text-slate-800">
                    {category.count.toLocaleString()}
                  </p>
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
