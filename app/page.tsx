"use client";

import { useState } from "react";
import { useSymptoms } from "@/lib/hooks/use-symptoms";
import { useAppointments } from "@/lib/hooks/use-appointments";
import { SymptomsList } from "@/components/symptoms/symptoms-list";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { SeverityTrendChart } from "@/components/dashboard/severity-trend-chart";
import { TimeDistributionChart } from "@/components/dashboard/time-distribution-chart";
import { SymptomHeatmap } from "@/components/dashboard/symptom-heatmap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Symptom, CreateSymptomInput } from "@/lib/schemas/symptom";
import Link from "next/link";
import { StorageWarningBanner } from "@/components/storage-warning-banner";
import { toast } from "sonner";
import { Sparkles, TrendingUp, TriangleAlert } from "lucide-react";

type DialogState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; symptom: Symptom };

type DeleteDialogState =
  | { type: "closed" }
  | { type: "confirm"; symptomId: string; symptomType: string };

export default function DashboardPage() {
  const {
    symptoms,
    loading: symptomsLoading,
    create,
    update,
    remove,
    getStats,
  } = useSymptoms();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "closed",
  });
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>(
    {
      type: "closed",
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = !symptomsLoading
    ? getStats()
    : {
        total: 0,
        averageSeverity: 0,
        mostCommonSymptom: null,
      };

  // Sort symptoms by date (newest first) and take the 5 most recent
  const recentSymptoms = [...symptoms]
    .sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    )
    .slice(0, 5);

  // Calculate symptom-free days (last 30 days)
  const symptomFreeDays = (() => {
    const last30Days = new Set<string>();
    const daysWithSymptoms = new Set<string>();
    const now = new Date();

    // Generate all dates in last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last30Days.add(date.toISOString().split("T")[0]);
    }

    // Track days with symptoms
    symptoms.forEach((symptom) => {
      const symptomDate = new Date(symptom.loggedAt);
      const daysDiff = Math.floor(
        (now.getTime() - symptomDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff < 30) {
        daysWithSymptoms.add(symptomDate.toISOString().split("T")[0]);
      }
    });

    return last30Days.size - daysWithSymptoms.size;
  })();

  // Calculate current streak (consecutive days without severe symptoms)
  const currentStreak = (() => {
    const severeSymptoms = symptoms.filter((s) => s.severity >= 7);

    if (severeSymptoms.length === 0) return 0;

    const sortedSevereSymptoms = [...severeSymptoms].sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    );

    const now = new Date();
    const mostRecentSevere = new Date(sortedSevereSymptoms[0].loggedAt);
    const daysSinceLastSevere = Math.floor(
      (now.getTime() - mostRecentSevere.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceLastSevere;
  })();

  // Calculate this week vs last week
  const weekComparison = (() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekCount = symptoms.filter((s) => {
      const date = new Date(s.loggedAt);
      return date >= thisWeekStart;
    }).length;

    const lastWeekCount = symptoms.filter((s) => {
      const date = new Date(s.loggedAt);
      return date >= lastWeekStart && date < thisWeekStart;
    }).length;

    const diff = thisWeekCount - lastWeekCount;
    const percentage =
      lastWeekCount > 0
        ? Math.round((diff / lastWeekCount) * 100)
        : thisWeekCount > 0
          ? 100
          : 0;

    return {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      diff,
      percentage,
    };
  })();

  // Find next upcoming appointment
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.appointmentDate) > now)
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    );
  const nextAppointment = upcomingAppointments[0];

  const closeDialog = () => {
    setDialogState({ type: "closed" });
  };

  const closeDeleteDialog = () => {
    setDeleteDialogState({ type: "closed" });
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
        await update(dialogState.symptom.id, data);
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

  const handleDeleteRequest = (id: string) => {
    const symptom = symptoms.find((s) => s.id === id);
    if (symptom) {
      setDeleteDialogState({
        type: "confirm",
        symptomId: id,
        symptomType: symptom.symptomType,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteDialogState.type !== "confirm") return;

    setIsDeleting(true);
    try {
      await remove(deleteDialogState.symptomId);
      toast.success("Symptom deleted successfully");
      closeDeleteDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete symptom",
      );
    } finally {
      setIsDeleting(false);
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
      <div className='container mx-auto py-8 px-4'>
        <p className='text-center text-gray-600 dark:text-gray-400'>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>
            Good Morning Hannah! How are you feeling today?
          </h1>
          <Button onClick={handleAdd} size='lg'>
            + Log Symptom
          </Button>
        </div>

        <StorageWarningBanner />

        {/* Charts Section */}
        {symptoms.length > 0 && (
          <div className='space-y-6 mb-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch'>
              {/* Left Column - AI Questions and Severity Trends */}
              <div className='space-y-6 flex flex-col'>
                {/* AI Generated Questions */}
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <h3 className='text-lg font-semibold'>
                        Ready for your next appointment?
                      </h3>
                      <div className='p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
                        <Sparkles className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-4xl font-bold'>
                      {nextAppointment?.generatedQuestions?.length || 0}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      AI Generated Questions
                    </p>
                    <Link href='/appointments'>
                      <Button variant='secondary' size='sm' className='w-full'>
                        Prepare for Visit
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Severity Trends */}
                <Card className='flex-1'>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>Severity Trends</h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Top 3 symptoms by week over the past month
                    </p>
                  </CardHeader>
                  <CardContent>
                    <SeverityTrendChart symptoms={symptoms} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Time Distribution and Heatmap */}
              <div className='space-y-6 flex flex-col'>
                <Card>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>
                      Time of Day Distribution
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      When symptoms occur throughout the day
                    </p>
                  </CardHeader>
                  <CardContent>
                    <TimeDistributionChart symptoms={symptoms} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>
                      Symptom Activity Calendar
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Daily symptom count over the past 3 months
                    </p>
                  </CardHeader>
                  <CardContent>
                    <SymptomHeatmap symptoms={symptoms} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Next Appointment Countdown */}
        {nextAppointment && daysUntil !== null && (
          <Card className='mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold'>Next Appointment</h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    {nextAppointment.doctorName} -{" "}
                    {new Date(
                      nextAppointment.appointmentDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                    {daysUntil === 0
                      ? "Today"
                      : daysUntil === 1
                        ? "Tomorrow"
                        : `${daysUntil} days`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href='/appointments'>
                <Button variant='outline' className='w-full'>
                  {nextAppointment.generatedQuestions &&
                  nextAppointment.generatedQuestions.length > 0
                    ? "View Prepared Questions"
                    : "Prepare Questions for Visit"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Symptoms */}
        <div className='mb-8'>
          {symptoms.length === 0 ? (
            <Card>
              <CardContent className='px-6 py-12 text-center'>
                <p className='text-xl text-gray-500 mb-4'>
                  No symptoms logged yet
                </p>
                <p className='text-gray-400 mb-6'>
                  Start tracking your symptoms to see patterns and insights
                </p>
                <Button onClick={handleAdd} size='lg'>
                  Log Your First Symptom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SymptomsList
              symptoms={recentSymptoms}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              showViewAll={symptoms.length > 5}
            />
          )}
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Symptom-Free Days */}
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <p className='text-sm text-muted-foreground'>
                  Symptom-Free Days
                </p>
                <div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/30'>
                  <svg
                    className='h-5 w-5 text-green-600 dark:text-green-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-1'>
              <p className='text-3xl font-bold'>{symptomFreeDays}</p>
              <p className='text-sm text-muted-foreground'>
                out of last 30 days
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <p className='text-sm text-muted-foreground'>Current Streak</p>
                <div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30'>
                  <svg
                    className='h-5 w-5 text-orange-600 dark:text-orange-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z'
                    />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-1'>
              <p className='text-3xl font-bold'>{currentStreak}</p>
              <p className='text-sm text-muted-foreground'>
                {currentStreak === 1 ? "day" : "days"} since severe symptom
              </p>
            </CardContent>
          </Card>

          {/* This Week vs Last Week */}
          <Card>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <p className='text-sm text-muted-foreground'>
                  Symptoms Logged This Week
                </p>
                <div
                  className={`p-2 rounded-lg ${
                    weekComparison.diff > 0
                      ? "bg-red-100 dark:bg-red-900/30"
                      : weekComparison.diff < 0
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <TrendingUp
                    className={`h-5 w-5 ${
                      weekComparison.diff > 0
                        ? "text-red-600 dark:text-red-400"
                        : weekComparison.diff < 0
                          ? "text-green-600 dark:text-green-400 rotate-180"
                          : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-1'>
              <p className='text-3xl font-bold'>{weekComparison.thisWeek}</p>
              <p className='text-sm text-muted-foreground'>
                {weekComparison.diff === 0
                  ? "Same as last week"
                  : weekComparison.diff > 0
                    ? `${Math.abs(weekComparison.diff)} more than last week`
                    : `${Math.abs(weekComparison.diff)} fewer than last week`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Symptom Dialog */}
        <Dialog
          open={dialogState.type !== "closed"}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent className='max-w-5xl sm:max-w-2xl max-h-[95vh] overflow-y-auto py-8'>
            <DialogHeader className='px-4'>
              <DialogTitle>
                {dialogState.type === "edit" ? "Edit Symptom" : "Log a Symptom"}
              </DialogTitle>
              <p className='text-sm text-muted-foreground'>
                Capture details of your symptom to generate better questions for
                your next visit.
              </p>
            </DialogHeader>
            <SymptomForm
              defaultValues={
                dialogState.type === "edit"
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogState.type !== "closed"}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
        >
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Delete Symptom</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Are you sure you want to delete{" "}
                <span className='font-semibold text-foreground'>
                  {deleteDialogState.type === "confirm"
                    ? deleteDialogState.symptomType
                    : ""}
                </span>
                ? This action cannot be undone.
              </p>
              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={closeDeleteDialog}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
