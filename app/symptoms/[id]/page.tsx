"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  Timer,
  CalendarDays,
  Zap,
  FileText,
} from "lucide-react";
import { useSymptomById, useSymptoms } from "@/lib/hooks/use-symptoms";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateSymptomInput } from "@/lib/schemas/symptom";
import { toast } from "sonner";

function getSeverityLabel(severity: number): string {
  if (severity <= 3) return "LOW SEVERITY";
  if (severity <= 6) return "MODERATE SEVERITY";
  if (severity <= 8) return "HIGH SEVERITY";
  return "CRITICAL SEVERITY";
}

function getSeverityColors(severity: number) {
  if (severity <= 3)
    return {
      badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      ring: "stroke-green-500",
      icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    };
  if (severity <= 6)
    return {
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      ring: "stroke-yellow-500",
      icon: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  return {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    ring: "stroke-red-500",
    icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };
}

/** Circular progress ring for the severity dial */
function SeverityDial({ severity }: { severity: number }) {
  const colors = getSeverityColors(severity);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = (severity / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Pain Level
      </p>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
          {/* Track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            className={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">{severity}</span>
          <span className="text-sm text-muted-foreground mt-3">/10</span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold tracking-widest px-3 py-1 rounded-full uppercase ${colors.badge}`}
      >
        {getSeverityLabel(severity)}
      </span>
    </div>
  );
}

export default function SymptomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;

  const { symptom, loading } = useSymptomById(id);
  const { update, remove } = useSymptoms();

  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (data: CreateSymptomInput) => {
    if (!symptom) return;
    setIsSubmitting(true);
    try {
      await update(symptom._id, data);
      toast.success("Symptom updated successfully");
      setEditOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update symptom"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!symptom) return;
    setIsDeleting(true);
    try {
      await remove(symptom._id);
      toast.success("Symptom deleted");
      router.push("/symptoms");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete symptom"
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-10 bg-muted rounded w-72" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!symptom) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">Symptom not found</p>
          <Link href="/symptoms">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const loggedDate = new Date(symptom.loggedAt);
  const createdDate = new Date(symptom._creationTime);

  const timeOfOnset = loggedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const eventDate = loggedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const loggedOn = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Parse triggers as comma-separated tags
  const triggers = symptom.triggers
    ? symptom.triggers.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const colors = getSeverityColors(symptom.severity);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/symptoms"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          History
        </Link>
        <span>/</span>
        <span className="text-foreground">Symptom Detail</span>
      </nav>

      {/* Title row */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {symptom.symptomType}{" "}
          </h1>
          <p className="text-muted-foreground mt-1">Logged on {loggedOn}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Entry
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            aria-label="Delete symptom"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Pain Level dial */}
        <Card className="border">
          <CardContent className="p-4">
            <SeverityDial severity={symptom.severity} />
          </CardContent>
        </Card>

        {/* Right-side info cards */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Time of Onset */}
          <Card className="border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-full ${colors.icon}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  Time of Onset
                </p>
                <p className="text-xl font-semibold">{timeOfOnset}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Duration placeholder — stored as notes/not in schema */}
          <Card className="border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-full ${colors.icon}`}>
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  Severity Score
                </p>
                <p className="text-xl font-semibold">{symptom.severity} / 10</p>
              </div>
            </CardContent>
          </Card>

          {/* Event Date */}
          <Card className="border sm:col-span-2">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-full ${colors.icon}`}>
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  Event Date
                </p>
                <p className="text-xl font-semibold">{eventDate}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Triggers */}
      <Card className="border mb-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Triggers Identified</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {triggers.length > 0 ? (
              triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium text-foreground"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {trigger}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No triggers recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Notes */}
      <Card className="border mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Detailed Notes</h2>
          </div>
          <div className="bg-muted/40 rounded-lg p-4">
            {symptom.notes ? (
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{symptom.notes}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No notes recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between">
        <Link href="/symptoms">
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-5xl sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Symptom</DialogTitle>
          </DialogHeader>
          <SymptomForm
            defaultValues={{
              symptomType: symptom.symptomType,
              severity: symptom.severity,
              triggers: symptom.triggers,
              notes: symptom.notes,
              loggedAt: symptom.loggedAt,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
