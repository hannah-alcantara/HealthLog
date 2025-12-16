'use client';

import { useState } from 'react';
import { useSymptoms } from '@/lib/hooks/use-symptoms';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { SymptomsList } from '@/components/symptoms/symptoms-list';
import { SymptomForm } from '@/components/symptoms/symptom-form';
import { SymptomFrequencyChart } from '@/components/dashboard/symptom-frequency-chart';
import { CategoryBreakdownChart } from '@/components/dashboard/category-breakdown-chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Symptom, CreateSymptomInput } from '@/lib/schemas/symptom';
import { symptomCategoryLabels } from '@/lib/schemas/symptom';
import Link from 'next/link';

type DialogState = { type: 'closed' } | { type: 'add' } | { type: 'edit'; symptom: Symptom };

export default function DashboardPage() {
  const { symptoms, loading: symptomsLoading, create, update, remove, getStats } = useSymptoms();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  const [dialogState, setDialogState] = useState<DialogState>({ type: 'closed' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = !symptomsLoading ? getStats() : { total: 0, averageSeverity: 0, mostCommonSymptom: null, mostCommonCategory: null };

  // Sort symptoms by date (newest first) and take the 5 most recent
  const recentSymptoms = [...symptoms]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .slice(0, 5);

  // Find next upcoming appointment
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointmentDate) > now)
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  const nextAppointment = upcomingAppointments[0];

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
      } else {
        await create(data);
      }
      closeDialog();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save symptom');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete symptom');
    }
  };

  const getDaysUntilAppointment = () => {
    if (!nextAppointment) return null;
    const appointmentDate = new Date(nextAppointment.appointmentDate);
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilAppointment();

  if (symptomsLoading || appointmentsLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Symptom Dashboard</h1>
          <Button onClick={handleAdd} size="lg">+ Log Symptom</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Symptoms</p>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.averageSeverity}/10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Common</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold truncate">{stats.mostCommonSymptom || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Category</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {stats.mostCommonCategory ? symptomCategoryLabels[stats.mostCommonCategory as keyof typeof symptomCategoryLabels] : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {symptoms.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold">Symptom Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Symptom Trends</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most frequently logged symptoms (top 10)
                  </p>
                </CardHeader>
                <CardContent>
                  <SymptomFrequencyChart symptoms={symptoms} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Category Breakdown</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Distribution of symptoms by category
                  </p>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdownChart symptoms={symptoms} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Next Appointment Countdown */}
        {nextAppointment && daysUntil !== null && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Next Appointment</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {nextAppointment.doctorName} - {new Date(nextAppointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/appointments">
                <Button variant="outline" className="w-full">
                  {nextAppointment.generatedQuestions && nextAppointment.generatedQuestions.length > 0
                    ? 'View Prepared Questions'
                    : 'Prepare Questions for Visit'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}


        {/* Recent Symptoms */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recent Symptoms</h2>
            {symptoms.length > 5 && (
              <Link href="/symptoms">
                <Button variant="outline">View All Symptoms</Button>
              </Link>
            )}
          </div>

          {symptoms.length === 0 ? (
            <Card>
              <CardContent className="px-6 py-12 text-center">
                <p className="text-xl text-gray-500 mb-4">No symptoms logged yet</p>
                <p className="text-gray-400 mb-6">Start tracking your symptoms to see patterns and insights</p>
                <Button onClick={handleAdd} size="lg">Log Your First Symptom</Button>
              </CardContent>
            </Card>
          ) : (
            <SymptomsList
              symptoms={recentSymptoms}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/appointments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <h3 className="text-lg font-semibold">📅 Appointments</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} logged
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/medical-history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <h3 className="text-lg font-semibold">📋 Medical History</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  View conditions, medications, and allergies
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gray-50 dark:bg-gray-900">
            <CardHeader>
              <h3 className="text-lg font-semibold">💡 Tip</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Log symptoms daily for better pattern recognition
              </p>
            </CardContent>
          </Card>
        </div>

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
                      category: dialogState.symptom.category,
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
