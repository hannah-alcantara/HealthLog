"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
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
import { GenerateQuestions } from "@/components/appointments/generate-questions";
import { toast } from "sonner";
import { Plus, Sparkles, TrendingUp, Zap, TriangleAlert } from "lucide-react";

type DialogState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; symptom: Symptom };

type DeleteDialogState =
  | { type: "closed" }
  | { type: "confirm"; symptomId: string; symptomType: string };

export function Dashboard() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "log") {
      setDialogState({ type: "add" });
      router.replace("/");
    }
  }, [searchParams, router]);

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

  // Find next upcoming appointment
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  const handleDeleteRequest = (id: string) => {
    const symptom = symptoms.find((s) => s._id === id);
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

  // Calculate insights for stat cards
  const insights = (() => {
    if (symptoms.length === 0) {
      return {
        mostFrequent: null,
        coOccurring: null,
        pattern: null,
      };
    }

    // 1. Most frequent symptom this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthSymptoms = symptoms.filter(
      (s) => s.loggedAt >= monthStart.getTime(),
    );

    const typeCounts = thisMonthSymptoms.reduce(
      (acc, s) => {
        acc[s.symptomType] = (acc[s.symptomType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostFrequentEntry = Object.entries(typeCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];
    const mostFrequent = mostFrequentEntry
      ? { type: mostFrequentEntry[0], count: mostFrequentEntry[1] }
      : null;

    // 2. Co-occurring symptom/trigger (most common trigger for most frequent symptom)
    let coOccurring = null;
    if (mostFrequent) {
      const symptomsOfType = symptoms.filter(
        (s) => s.symptomType === mostFrequent.type && s.triggers,
      );
      const triggerCounts = symptomsOfType.reduce(
        (acc, s) => {
          const triggers =
            s.triggers
              ?.toLowerCase()
              .split(/[,;]+/)
              .map((t) => t.trim()) || [];
          triggers.forEach((trigger) => {
            if (trigger) acc[trigger] = (acc[trigger] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>,
      );

      const topTrigger = Object.entries(triggerCounts).sort(
        ([, a], [, b]) => b - a,
      )[0];
      if (topTrigger && topTrigger[1] >= 2) {
        coOccurring = {
          symptom: mostFrequent.type,
          trigger: topTrigger[0],
          count: topTrigger[1],
        };
      }
    }

    // 3. Pattern alert (day of week for most frequent symptom)
    let pattern = null;
    if (mostFrequent) {
      const symptomsOfType = symptoms.filter(
        (s) => s.symptomType === mostFrequent.type,
      );

      // Count symptoms by day of week (0 = Sunday, 6 = Saturday)
      const dayCounts = symptomsOfType.reduce(
        (acc, s) => {
          const day = new Date(s.loggedAt).getDay();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const sortedDays = Object.entries(dayCounts).sort(
        ([, a], [, b]) => b - a,
      );

      if (sortedDays.length > 0 && sortedDays[0][1] >= 2) {
        const peakDay = parseInt(sortedDays[0][0]);
        const peakDayName = dayNames[peakDay];

        pattern = {
          symptom: mostFrequent.type,
          peakDay: peakDayName + "s",
        };
      }
    }

    return { mostFrequent, coOccurring, pattern };
  })();

  const getDaysUntilAppointment = () => {
    if (!nextAppointment) return null;
    const date = new Date(nextAppointment.date);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilAppointment();

  if (symptomsLoading || appointmentsLoading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <p className='text-center text-muted-foreground'>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold'>
            Good Morning,{user?.firstName ? ` ${user.firstName}` : ""}! How are
            you feeling today?
          </h1>
        </div>

        {/* Stats Cards - Health Insights */}
        {symptoms.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            {/* Most Frequent Symptom */}
            <Card>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <p className='text-sm text-muted-foreground'>Most Frequent</p>
                  <div className='p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
                    <TrendingUp className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-1'>
                {insights.mostFrequent ? (
                  <>
                    <p className='text-xl font-bold capitalize'>
                      {insights.mostFrequent.type}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {insights.mostFrequent.count}{" "}
                      {insights.mostFrequent.count === 1 ? "time" : "times"}{" "}
                      this month
                    </p>
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Not enough data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Co-occurring Trigger */}
            <Card>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <p className='text-sm text-muted-foreground'>
                    Common Trigger
                  </p>
                  <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                    <Zap className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-1'>
                {insights.coOccurring ? (
                  <>
                    <p className='text-xl font-bold capitalize'>
                      {insights.coOccurring.trigger}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      usually causes{" "}
                      <span className='font-medium'>
                        {insights.coOccurring.symptom}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Add triggers to see patterns
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pattern Alert */}
            <Card>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <p className='text-sm text-muted-foreground'>Pattern Alert</p>
                  <div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                    <TriangleAlert className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-1'>
                {insights.pattern ? (
                  <>
                    <p className='text-xl font-bold capitalize'>
                      {insights.pattern.peakDay}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      is when your{" "}
                      <span className='font-medium capitalize'>
                        {insights.pattern.symptom}
                      </span>{" "}
                      peak
                    </p>
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Track more to see patterns
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {symptoms.length > 0 && (
          <div className='space-y-6 mb-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch'>
              {/* Left Column - AI Questions and Severity Trends */}
              <div className='space-y-6 flex flex-col'>
                {/* Next Appointment Countdown */}
                <Card className='gap-0'>
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
                  <CardContent className='space-y-1'>
                    {nextAppointment ? (
                      <>
                        <p className='text-3xl font-bold'>
                          {Math.max(
                            0,
                            Math.ceil(
                              (new Date(nextAppointment.date).getTime() -
                                Date.now()) /
                                (1000 * 60 * 60 * 24),
                            ),
                          )}{" "}
                        </p>
                        <p className='text-sm text-muted-foreground truncate'>
                          days away with {nextAppointment.doctorName}
                        </p>
                        <div className='flex items-center gap-1.5 text-xs pt-1'>
                          {nextAppointment.generatedQuestions?.length ? (
                            <>
                              <span className='h-2 w-2 rounded-full bg-emerald-500 shrink-0' />
                              <span className='text-muted-foreground'>
                                {nextAppointment.generatedQuestions.length}{" "}
                                question
                                {nextAppointment.generatedQuestions.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                ready
                              </span>
                            </>
                          ) : (
                            <>
                              <span className='h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0' />
                              <span className='text-muted-foreground'>
                                No questions yet
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No upcoming appointments
                      </p>
                    )}
                    <div className='pt-3'>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='btn-gradient-shift w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 text-white border-0 transition-shadow duration-200 hover:shadow-lg hover:shadow-emerald-500/25'
                        onClick={() => setShowQuestionGenerator(true)}
                      >
                        Generate Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Severity Trends */}
                <Card className='flex-1'>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>Severity Trends</h3>
                    <p className='text-sm text-muted-foreground'>
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
                    <p className='text-sm text-muted-foreground'>
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
                    <p className='text-sm text-muted-foreground'>
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

        {/* Recent Symptoms */}
        <div className='mb-8'>
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
          ) : (
            <SymptomsList
              symptoms={recentSymptoms}
              onAdd={handleAdd}
              onDelete={handleDeleteRequest}
              showViewAll={symptoms.length > 5}
            />
          )}
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

        {/* Question Generator Dialog */}
        <Dialog
          open={showQuestionGenerator}
          onOpenChange={(open) => {
            if (!open) setShowQuestionGenerator(false);
          }}
        >
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>Generate Questions</DialogTitle>
            </DialogHeader>
            <GenerateQuestions
              allAppointments={appointments}
              onCancel={() => setShowQuestionGenerator(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Floating Action Button (Mobile Only) */}
        <Button
          onClick={handleAdd}
          size='lg'
          className='sm:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg p-0'
          aria-label='Log Symptom'
        >
          <Plus className='h-6 w-6' />
        </Button>
      </div>
    </div>
  );
}
