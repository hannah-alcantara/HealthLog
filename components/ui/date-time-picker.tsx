'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  disabled,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, 'HH:mm') : '12:00'
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTimeValue(format(value, 'HH:mm'));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange(undefined);
      return;
    }

    // Preserve the time when selecting a new date
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (!selectedDate) {
      // If no date selected, use today
      const today = new Date();
      const [hours, minutes] = newTime.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      setSelectedDate(today);
      onChange(today);
      return;
    }

    const [hours, minutes] = newTime.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    setSelectedDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="flex gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex-1 justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="flex flex-col gap-1.5">
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="w-32"
        />
      </div>
    </div>
  );
}
