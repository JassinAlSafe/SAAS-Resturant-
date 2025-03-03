"use client";

import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { FiSearch, FiCalendar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SalesFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export default function SalesFilter({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
}: SalesFilterProps) {
  return (
    <Card className="mb-6">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sales by dish name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full md:w-auto justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <FiCalendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={onDateChange}
              initialFocus
            />
            {selectedDate && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDateChange(null)}
                  className="w-full"
                >
                  Clear Date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}
