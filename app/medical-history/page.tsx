'use client';

import { useState } from 'react';
import { useConditions } from '@/lib/hooks/use-conditions';
import { useMedications } from '@/lib/hooks/use-medications';
import { useAllergies } from '@/lib/hooks/use-allergies';
import { MedicalHistoryList } from '@/components/medical-history/medical-history-list';
import { ConditionForm } from '@/components/medical-history/condition-form';
import { MedicationForm } from '@/components/medical-history/medication-form';
import { AllergyForm } from '@/components/medical-history/allergy-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Condition, Medication, Allergy, CreateConditionInput, CreateMedicationInput, CreateAllergyInput } from '@/lib/schemas/medical-history';

type DialogState =
  | { type: 'closed' }
  | { type: 'add-condition' }
  | { type: 'edit-condition'; condition: Condition }
  | { type: 'add-medication' }
  | { type: 'edit-medication'; medication: Medication }
  | { type: 'add-allergy' }
  | { type: 'edit-allergy'; allergy: Allergy };

export default function MedicalHistoryPage() {
  const { conditions, loading: conditionsLoading, error: conditionsError, create: createCondition, update: updateCondition, remove: removeCondition } = useConditions();
  const { medications, loading: medicationsLoading, error: medicationsError, create: createMedication, update: updateMedication, remove: removeMedication } = useMedications();
  const { allergies, loading: allergiesLoading, error: allergiesError, create: createAllergy, update: updateAllergy, remove: removeAllergy } = useAllergies();

  const [dialogState, setDialogState] = useState<DialogState>({ type: 'closed' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDialog = () => setDialogState({ type: 'closed' });

  // Condition handlers
  const handleAddCondition = () => setDialogState({ type: 'add-condition' });
  const handleEditCondition = (condition: Condition) => setDialogState({ type: 'edit-condition', condition });
  const handleDeleteCondition = async (id: string) => {
    if (confirm('Are you sure you want to delete this condition?')) {
      try {
        await removeCondition(id);
      } catch (error) {
        alert('Failed to delete condition');
      }
    }
  };
  const handleSubmitCondition = async (data: CreateConditionInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === 'edit-condition') {
        await updateCondition(dialogState.condition.id, data);
      } else {
        await createCondition(data);
      }
      closeDialog();
    } catch (error) {
      alert('Failed to save condition');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Medication handlers
  const handleAddMedication = () => setDialogState({ type: 'add-medication' });
  const handleEditMedication = (medication: Medication) => setDialogState({ type: 'edit-medication', medication });
  const handleDeleteMedication = async (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      try {
        await removeMedication(id);
      } catch (error) {
        alert('Failed to delete medication');
      }
    }
  };
  const handleSubmitMedication = async (data: CreateMedicationInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === 'edit-medication') {
        await updateMedication(dialogState.medication.id, data);
      } else {
        await createMedication(data);
      }
      closeDialog();
    } catch (error) {
      alert('Failed to save medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allergy handlers
  const handleAddAllergy = () => setDialogState({ type: 'add-allergy' });
  const handleEditAllergy = (allergy: Allergy) => setDialogState({ type: 'edit-allergy', allergy });
  const handleDeleteAllergy = async (id: string) => {
    if (confirm('Are you sure you want to delete this allergy?')) {
      try {
        await removeAllergy(id);
      } catch (error) {
        alert('Failed to delete allergy');
      }
    }
  };
  const handleSubmitAllergy = async (data: CreateAllergyInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === 'edit-allergy') {
        await updateAllergy(dialogState.allergy.id, data);
      } else {
        await createAllergy(data);
      }
      closeDialog();
    } catch (error) {
      alert('Failed to save allergy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = conditionsLoading || medicationsLoading || allergiesLoading;
  const error = conditionsError || medicationsError || allergiesError;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Medical History</h1>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && (
        <MedicalHistoryList
          conditions={conditions}
          medications={medications}
          allergies={allergies}
          onEditCondition={handleEditCondition}
          onDeleteCondition={handleDeleteCondition}
          onEditMedication={handleEditMedication}
          onDeleteMedication={handleDeleteMedication}
          onEditAllergy={handleEditAllergy}
          onDeleteAllergy={handleDeleteAllergy}
          onAddCondition={handleAddCondition}
          onAddMedication={handleAddMedication}
          onAddAllergy={handleAddAllergy}
        />
      )}

      {/* Condition Dialog */}
      <Dialog
        open={dialogState.type === 'add-condition' || dialogState.type === 'edit-condition'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'edit-condition' ? 'Edit Condition' : 'Add Condition'}
            </DialogTitle>
          </DialogHeader>
          <ConditionForm
            defaultValues={
              dialogState.type === 'edit-condition'
                ? {
                    name: dialogState.condition.name,
                    diagnosisDate: dialogState.condition.diagnosisDate,
                    notes: dialogState.condition.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmitCondition}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Medication Dialog */}
      <Dialog
        open={dialogState.type === 'add-medication' || dialogState.type === 'edit-medication'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'edit-medication' ? 'Edit Medication' : 'Add Medication'}
            </DialogTitle>
          </DialogHeader>
          <MedicationForm
            defaultValues={
              dialogState.type === 'edit-medication'
                ? {
                    name: dialogState.medication.name,
                    dosage: dialogState.medication.dosage,
                    frequency: dialogState.medication.frequency,
                    startDate: dialogState.medication.startDate,
                    notes: dialogState.medication.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmitMedication}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Allergy Dialog */}
      <Dialog
        open={dialogState.type === 'add-allergy' || dialogState.type === 'edit-allergy'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'edit-allergy' ? 'Edit Allergy' : 'Add Allergy'}
            </DialogTitle>
          </DialogHeader>
          <AllergyForm
            defaultValues={
              dialogState.type === 'edit-allergy'
                ? {
                    allergen: dialogState.allergy.allergen,
                    severity: dialogState.allergy.severity,
                    reaction: dialogState.allergy.reaction,
                  }
                : undefined
            }
            onSubmit={handleSubmitAllergy}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
