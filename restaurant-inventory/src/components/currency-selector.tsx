"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/currency";

export function CurrencySelector() {
  // Since we\'re now standardized on Swedish Krona, this component will
  // just display the current currency without allowing changes

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">SEK</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 data-[state=open]:bg-muted flex items-center gap-1 px-2"
        disabled
      >
        <span className="text-sm">kr</span>
      </Button>
    </div>
  );
}
