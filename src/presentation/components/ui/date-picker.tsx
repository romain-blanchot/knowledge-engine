"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // format YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: "fr" | "en";
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionnez une date",
  disabled = false,
  minDate,
  maxDate,
  locale = "fr",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string value to Date
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const date = new Date(value + "T00:00:00");
    return isNaN(date.getTime()) ? undefined : date;
  }, [value]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
    setOpen(false);
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return null;
    return format(selectedDate, "EEEE d MMMM yyyy", {
      locale: locale === "fr" ? fr : undefined,
    });
  }, [selectedDate, locale]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue ? (
            <span className="capitalize">{displayValue}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          locale={locale === "fr" ? fr : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
