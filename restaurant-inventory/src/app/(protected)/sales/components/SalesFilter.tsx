"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ShiftType } from "../types";

interface SalesFilterProps {
  startDate?: Date;
  endDate?: Date;
  shift?: ShiftType;
  searchTerm?: string;
  onFilterChange: (filters: {
    startDate?: Date;
    endDate?: Date;
    shift?: ShiftType;
    searchTerm?: string;
  }) => void;
}

export default function SalesFilter({
  startDate,
  endDate,
  shift,
  searchTerm,
  onFilterChange,
}: SalesFilterProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");

  // Handle date selection
  const handleDateSelect = (type: "start" | "end", date: Date | undefined) => {
    if (type === "start") {
      onFilterChange({ ...getCurrentFilters(), startDate: date });
    } else {
      onFilterChange({ ...getCurrentFilters(), endDate: date });
    }
  };

  // Handle shift selection
  const handleShiftChange = (value: string) => {
    onFilterChange({
      ...getCurrentFilters(),
      shift: value as ShiftType,
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onFilterChange({
      ...getCurrentFilters(),
      searchTerm: value,
    });
  };

  // Get current filters
  const getCurrentFilters = () => ({
    startDate,
    endDate,
    shift,
    searchTerm: localSearchTerm,
  });

  // Clear all filters
  const clearFilters = () => {
    setLocalSearchTerm("");
    onFilterChange({
      startDate: undefined,
      endDate: undefined,
      shift: undefined,
      searchTerm: "",
    });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
      <div className="grid gap-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateSelect("start", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => handleDateSelect("end", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>Shift</Label>
        <Select value={shift} onValueChange={handleShiftChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Shifts</SelectItem>
            <SelectItem value="Breakfast">Breakfast</SelectItem>
            <SelectItem value="Lunch">Lunch</SelectItem>
            <SelectItem value="Dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 flex-1">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by dish name..."
            value={localSearchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {(startDate || endDate || shift || localSearchTerm) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
