"use client";

import { useState, useMemo } from "react";
import { useSymptoms } from "@/lib/hooks/use-symptoms";
import { SymptomsList } from "@/components/symptoms/symptoms-list";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { SymptomFiltersComponent } from "@/components/symptoms/symptom-filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Symptom,
  CreateSymptomInput,
} from "@/lib/schemas/symptom";
import {
  filterSymptoms,
  sortSymptoms,
  type SymptomFilters,
  type SortOption,
} from "@/lib/utils/symptom-filters";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type DialogState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; symptom: Symptom };

export default function SymptomsPage() {
  const { symptoms, loading, create, update, remove } = useSymptoms();

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "closed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<SymptomFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  // Filter and sort symptoms
  const filteredAndSortedSymptoms = useMemo(() => {
    const filtered = filterSymptoms(symptoms, filters);
    return sortSymptoms(filtered, sortOption);
  }, [symptoms, filters, sortOption]);

  const handleResetFilters = () => {
    setFilters({});
    setSortOption("date-desc");
  };

  const closeDialog = () => {
    setDialogState({ type: "closed" });
  };

  const handleAdd = () => {
    setDialogState({ type: "add" });
  };

  const handleEdit = (symptom: Symptom) => {
    setDialogState({ type: "edit", symptom });
  };

  const handleSubmit = async (data: CreateSymptomInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === "edit") {
        await update(dialogState.symptom._id, data);
        toast.success("Symptom updated successfully");
      } else {
        await create(data);
        toast.success("Symptom added successfully");
      }
      closeDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save symptom",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success("Symptom deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete symptom",
      );
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <p className='text-center text-muted-foreground'>
          Loading symptoms...
        </p>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof SymptomFilters];
    return value !== undefined && value !== "";
  });

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>All Symptoms</h1>
            <p className='text-muted-foreground mt-1'>
              {filteredAndSortedSymptoms.length}{" "}
              {filteredAndSortedSymptoms.length === 1 ? "symptom" : "symptoms"}
              {hasActiveFilters &&
                symptoms.length !== filteredAndSortedSymptoms.length &&
                ` (${symptoms.length} total)`}
            </p>
          </div>
          <Button
            onClick={handleAdd}
            size='lg'
            className='flex items-center gap-2'
          >
            <Plus className='h-5 w-5' />
            Log Symptom
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-8'>
          <SymptomFiltersComponent
            filters={filters}
            sortOption={sortOption}
            onFiltersChange={setFilters}
            onSortChange={setSortOption}
            onReset={handleResetFilters}
          />
        </div>

        {/* Symptoms List */}
        {symptoms.length === 0 ? (
          <Card>
            <CardContent className='px-6 py-12 text-center'>
              <p className='text-xl text-muted-foreground mb-4'>
                No symptoms logged yet
              </p>
              <p className='text-muted-foreground mb-6'>
                Start tracking your symptoms to see patterns and insights
              </p>
            </CardContent>
          </Card>
        ) : filteredAndSortedSymptoms.length === 0 ? (
          <Card>
            <CardContent className='px-6 py-12 text-center'>
              <p className='text-xl text-muted-foreground mb-4'>
                No symptoms match your filters
              </p>
              <p className='text-muted-foreground mb-6'>
                Try adjusting your filter criteria
              </p>
              <Button onClick={handleResetFilters} variant='outline'>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SymptomsList
            symptoms={filteredAndSortedSymptoms}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        )}

        {/* Add/Edit Symptom Dialog */}
        <Dialog
          open={dialogState.type !== "closed"}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent className='max-w-5xl sm:max-w-2xl max-h-[95vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {dialogState.type === "edit"
                  ? "Edit Symptom"
                  : "Log New Symptom"}
              </DialogTitle>
            </DialogHeader>
            <SymptomForm
              defaultValues={
                dialogState.type === "edit"
                  ? {
                      symptomType: dialogState.symptom.symptomType,
                      severity: dialogState.symptom.severity,
                      triggers: dialogState.symptom.triggers,
                      notes: dialogState.symptom.notes,
                      loggedAt: dialogState.symptom.loggedAt,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              onCancel={closeDialog}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
