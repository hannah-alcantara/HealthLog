'use client';

import { useState } from 'react';
import type { Condition, Medication, Allergy } from '@/lib/schemas/medical-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MedicalHistoryListProps {
  conditions: Condition[];
  medications: Medication[];
  allergies: Allergy[];
  onEditCondition: (condition: Condition) => void;
  onDeleteCondition: (id: string) => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onEditAllergy: (allergy: Allergy) => void;
  onDeleteAllergy: (id: string) => void;
  onAddCondition: () => void;
  onAddMedication: () => void;
  onAddAllergy: () => void;
}

type Tab = 'conditions' | 'medications' | 'allergies';

export function MedicalHistoryList({
  conditions,
  medications,
  allergies,
  onEditCondition,
  onDeleteCondition,
  onEditMedication,
  onDeleteMedication,
  onEditAllergy,
  onDeleteAllergy,
  onAddCondition,
  onAddMedication,
  onAddAllergy,
}: MedicalHistoryListProps) {
  const [activeTab, setActiveTab] = useState<Tab>('conditions');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('conditions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'conditions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Conditions ({conditions.length})
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'medications'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Medications ({medications.length})
        </button>
        <button
          onClick={() => setActiveTab('allergies')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'allergies'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Allergies ({allergies.length})
        </button>
      </div>

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Conditions</h2>
            <Button onClick={onAddCondition}>Add Condition</Button>
          </div>

          {conditions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No conditions recorded. Click &quot;Add Condition&quot; to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <Card key={condition.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{condition.name}</CardTitle>
                        {condition.diagnosisDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEditCondition(condition)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDeleteCondition(condition.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {condition.notes && (
                    <CardContent>
                      <p className="text-sm text-gray-700">{condition.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medications Tab */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Medications</h2>
            <Button onClick={onAddMedication}>Add Medication</Button>
          </div>

          {medications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No medications recorded. Click &quot;Add Medication&quot; to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {medications.map((medication) => (
                <Card key={medication.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{medication.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        {medication.startDate && (
                          <p className="text-sm text-gray-500">
                            Started: {new Date(medication.startDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEditMedication(medication)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDeleteMedication(medication.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {medication.notes && (
                    <CardContent>
                      <p className="text-sm text-gray-700">{medication.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Allergies Tab */}
      {activeTab === 'allergies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Allergies</h2>
            <Button onClick={onAddAllergy}>Add Allergy</Button>
          </div>

          {allergies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No allergies recorded. Click &quot;Add Allergy&quot; to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allergies.map((allergy) => (
                <Card key={allergy.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{allergy.allergen}</CardTitle>
                        {allergy.severity && (
                          <p className="text-sm text-gray-500 mt-1 capitalize">
                            Severity: {allergy.severity}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEditAllergy(allergy)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDeleteAllergy(allergy.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {allergy.reaction && (
                    <CardContent>
                      <p className="text-sm text-gray-700">{allergy.reaction}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
