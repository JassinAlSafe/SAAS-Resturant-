import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  onViewAll?: () => void;
  viewAllLink?: string;
}

const CategoryStatsCard = ({
  className,
  title,
  categories,
  onViewAll,
  viewAllLink,
}: CategoryStatsCardProps) => {
  // Total items across all categories
  const totalItems = categories.reduce(
    (sum, category) => sum + category.count,
    0
  );

  return (
    <Card
      className={cn(
        "overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 h-full",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <CardDescription className="mt-1 text-sm">
            {totalItems} total items
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Generate report</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          {categories.map((category) => {
            // Calculate percentage of total for the progress bar
            const percentage = Math.round((category.count / totalItems) * 100);
            // Determine if the change is positive, negative or neutral
            const changeType =
              category.change > 0
                ? "positive"
                : category.change < 0
                ? "negative"
                : "neutral";

            return (
              <div
                key={category.id}
                className="group p-3 rounded-lg hover:bg-muted/40 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 duration-300",
                      category.color
                    )}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{category.name}</p>

                      {/* Dynamic badge based on change direction */}
                      {changeType === "positive" && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 flex items-center gap-1 hover:bg-green-100"
                        >
                          <TrendingUp className="h-3 w-3" />+
                          {Math.abs(category.change)}
                        </Badge>
                      )}
                      {changeType === "negative" && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 flex items-center gap-1 hover:bg-red-100"
                        >
                          <TrendingDown className="h-3 w-3" />
                          {category.change}
                        </Badge>
                      )}
                      {changeType === "neutral" && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          No change
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex-grow mr-4">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              category.color.includes("primary")
                                ? "bg-primary"
                                : category.color.includes("green")
                                ? "bg-green-500"
                                : category.color.includes("blue")
                                ? "bg-blue-500"
                                : category.color.includes("amber")
                                ? "bg-amber-500"
                                : category.color.includes("red")
                                ? "bg-red-500"
                                : "bg-muted-foreground"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        {category.count.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">
                          items
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(onViewAll || viewAllLink) && (
            <div className="pt-2">
              {viewAllLink ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm flex items-center justify-center text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href={viewAllLink}>
                    View all categories
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAll}
                  className="w-full text-sm flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  View all categories
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryStatsCard;
