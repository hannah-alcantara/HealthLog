'use client';

import { useState, useMemo } from 'react';
import { useSymptoms } from '@/lib/hooks/use-symptoms';
import { SymptomsList } from '@/components/symptoms/symptoms-list';
import { SymptomForm } from '@/components/symptoms/symptom-form';
import { SymptomFiltersComponent } from '@/components/symptoms/symptom-filters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Symptom, CreateSymptomInput } from '@/lib/schemas/symptom';
import {
  filterSymptoms,
  sortSymptoms,
  getUniqueBodyParts,
  type SymptomFilters,
  type SortOption,
} from '@/lib/utils/symptom-filters';
import { toast } from 'sonner';

type DialogState = { type: 'closed' } | { type: 'add' } | { type: 'edit'; symptom: Symptom };

export default function SymptomsPage() {
  const { symptoms, loading, create, update, remove } = useSymptoms();

  const [dialogState, setDialogState] = useState<DialogState>({ type: 'closed' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<SymptomFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  // Filter and sort symptoms
  const filteredAndSortedSymptoms = useMemo(() => {
    const filtered = filterSymptoms(symptoms, filters);
    return sortSymptoms(filtered, sortOption);
  }, [symptoms, filters, sortOption]);

  // Get unique body parts for filter dropdown
  const availableBodyParts = useMemo(() => getUniqueBodyParts(symptoms), [symptoms]);

  const handleResetFilters = () => {
    setFilters({});
    setSortOption('date-desc');
  };

  const closeDialog = () => {
    setDialogState({ type: 'closed' });
  };

  const handleAdd = () => {
    setDialogState({ type: 'add' });
  };

  const handleEdit = (symptom: Symptom) => {
    setDialogState({ type: 'edit', symptom });
  };

  const handleSubmit = async (data: CreateSymptomInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === 'edit') {
        await update(dialogState.symptom.id, data);
        toast.success('Symptom updated successfully');
      } else {
        await create(data);
        toast.success('Symptom added successfully');
      }
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save symptom');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Symptom deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete symptom');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading symptoms...</p>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SymptomFilters];
    return value !== undefined && value !== '';
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Symptoms</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredAndSortedSymptoms.length} {filteredAndSortedSymptoms.length === 1 ? 'symptom' : 'symptoms'}
              {hasActiveFilters && symptoms.length !== filteredAndSortedSymptoms.length &&
                ` (${symptoms.length} total)`
              }
            </p>
          </div>
          <Button onClick={handleAdd} size="lg">+ Log Symptom</Button>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <SymptomFiltersComponent
            filters={filters}
            sortOption={sortOption}
            onFiltersChange={setFilters}
            onSortChange={setSortOption}
            availableBodyParts={availableBodyParts}
            onReset={handleResetFilters}
          />
        </div>

        {/* Symptoms List */}
        {symptoms.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-12 text-center">
              <p className="text-xl text-gray-500 mb-4">No symptoms logged yet</p>
              <p className="text-gray-400 mb-6">Start tracking your symptoms to see patterns and insights</p>
              <Button onClick={handleAdd} size="lg">Log Your First Symptom</Button>
            </CardContent>
          </Card>
        ) : filteredAndSortedSymptoms.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-12 text-center">
              <p className="text-xl text-gray-500 mb-4">No symptoms match your filters</p>
              <p className="text-gray-400 mb-6">Try adjusting your filter criteria</p>
              <Button onClick={handleResetFilters} variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <SymptomsList
            symptoms={filteredAndSortedSymptoms}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Add/Edit Symptom Dialog */}
        <Dialog
          open={dialogState.type !== 'closed'}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogState.type === 'edit' ? 'Edit Symptom' : 'Log New Symptom'}
              </DialogTitle>
            </DialogHeader>
            <SymptomForm
              defaultValues={
                dialogState.type === 'edit'
                  ? {
                      symptomType: dialogState.symptom.symptomType,
                      severity: dialogState.symptom.severity,
                      bodyPart: dialogState.symptom.bodyPart,
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
