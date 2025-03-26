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
  const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...getCurrentFilters(),
      shift: e.target.value as ShiftType,
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
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Start Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full md:w-[200px] justify-start text-left bg-white rounded border-base-300",
                !startDate && "text-neutral-400"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white rounded-lg shadow-lg"
            align="start"
          >
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateSelect("start", date)}
              initialFocus
              className="bg-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          End Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full md:w-[200px] justify-start text-left bg-white rounded border-base-300",
                !endDate && "text-neutral-400"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white rounded-lg shadow-lg"
            align="start"
          >
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => handleDateSelect("end", date)}
              initialFocus
              className="bg-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Shift
        </Label>
        <select
          value={shift}
          onChange={handleShiftChange}
          className="select select-bordered w-full md:w-[150px] h-10 bg-white"
        >
          <option value="All">All Shifts</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
        </select>
      </div>

      <div className="grid gap-1.5 flex-1">
        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by dish name..."
            value={localSearchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white rounded border-base-300"
          />
        </div>
      </div>

      {(startDate || endDate || shift || localSearchTerm) && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="btn btn-circle btn-sm btn-ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
