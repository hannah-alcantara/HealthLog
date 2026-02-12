"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disableFuture?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled,
  disableFuture = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "hh:mm a") : "12:00 PM",
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTimeValue(format(value, "hh:mm a"));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange(undefined);
      return;
    }

    // Preserve the time when selecting a new date
    const timeMatch = timeValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);

      // Prevent future date/time if disableFuture is enabled
      if (disableFuture) {
        const now = new Date();
        if (newDate > now) {
          // Set to current time instead
          const current = new Date();
          setSelectedDate(current);
          setTimeValue(format(current, "hh:mm a"));
          onChange(current);
          return;
        }
      }

      setSelectedDate(newDate);
      onChange(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value.toUpperCase();

    // Allow only valid 12-hour time format (HH:mm AM/PM)
    if (!/^\d{0,2}:?\d{0,2}\s?[AP]?[M]?$/.test(newTime)) {
      return;
    }

    setTimeValue(newTime);

    // Only process if we have a complete time (HH:mm AM/PM format)
    const timeMatch = newTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!timeMatch) {
      return;
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3];

    // Validate time values
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return;
    }

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    if (!selectedDate) {
      // If no date selected, use today
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      setSelectedDate(today);
      onChange(today);
      return;
    }

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    // Prevent future date/time if disableFuture is enabled
    if (disableFuture) {
      const now = new Date();
      if (newDate > now) {
        // Set to current time instead
        const current = new Date();
        setSelectedDate(current);
        setTimeValue(format(current, "hh:mm a"));
        onChange(current);
        return;
      }
    }

    setSelectedDate(newDate);
    onChange(newDate);
  };

  return (
    <div className='flex gap-2'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disableFuture ? { after: new Date() } : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className='flex flex-col gap-1.5'>
        <Input
          type='text'
          value={timeValue}
          onChange={handleTimeChange}
          placeholder='12:00 PM'
          disabled={disabled}
          className='w-32'
          maxLength={8}
        />
      </div>
    </div>
  );
}
