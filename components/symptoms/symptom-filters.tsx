"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SymptomFilters, SortOption } from "@/lib/utils/symptom-filters";

interface SymptomFiltersProps {
  filters: SymptomFilters;
  sortOption: SortOption;
  onFiltersChange: (filters: SymptomFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

export function SymptomFiltersComponent({
  filters,
  sortOption,
  onFiltersChange,
  onSortChange,
  onReset,
}: SymptomFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SymptomFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, searchText: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSeverityChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : parseInt(value);
    const newFilters = {
      ...localFilters,
      [type === "min" ? "minSeverity" : "maxSeverity"]: numValue,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    const newFilters = {
      ...localFilters,
      [type === "start" ? "startDate" : "endDate"]: value
        ? new Date(value)
        : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters =
    localFilters.searchText ||
    localFilters.minSeverity !== undefined ||
    localFilters.maxSeverity !== undefined ||
    localFilters.startDate ||
    localFilters.endDate;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Filter & Sort</h3>
          <div className='flex items-center gap-2'>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={onReset}>
                Clear Filters
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Search and Sort - Always Visible */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='search'>Search</Label>
            <Input
              id='search'
              type='text'
              placeholder='Search symptoms, notes, triggers...'
              value={localFilters.searchText || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='sort'>Sort By</Label>
            <select
              id='sort'
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
            >
              <option value='date-desc'>Newest First</option>
              <option value='date-asc'>Oldest First</option>
              <option value='severity-desc'>Highest Severity</option>
              <option value='severity-asc'>Lowest Severity</option>
              <option value='type-asc'>Symptom Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <>
            <div className='border-t pt-4' />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Severity Range</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    min='1'
                    max='10'
                    placeholder='Min'
                    value={localFilters.minSeverity ?? ""}
                    onChange={(e) =>
                      handleSeverityChange("min", e.target.value)
                    }
                    className='w-20'
                  />
                  <span className='text-sm text-muted-foreground'>to</span>
                  <Input
                    type='number'
                    min='1'
                    max='10'
                    placeholder='Max'
                    value={localFilters.maxSeverity ?? ""}
                    onChange={(e) =>
                      handleSeverityChange("max", e.target.value)
                    }
                    className='w-20'
                  />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input
                  id='startDate'
                  type='date'
                  value={
                    localFilters.startDate
                      ? localFilters.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleDateChange("start", e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='endDate'>End Date</Label>
                <Input
                  id='endDate'
                  type='date'
                  value={
                    localFilters.endDate
                      ? localFilters.endDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleDateChange("end", e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
