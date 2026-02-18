"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppointments } from "@/lib/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Appointment } from "@/lib/schemas/appointment";

interface StandaloneQuestionGeneratorProps {
  appointments: Appointment[];
  onClose: () => void;
}

export function StandaloneQuestionGenerator({
  appointments,
  onClose,
}: StandaloneQuestionGeneratorProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const generateQuestions = useAction(api.ai.generateAppointmentQuestions);
  const { update } = useAppointments();

  const sortedAppointments = [...appointments].sort(
    (a, b) => a.date - b.date
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateQuestions({
        appointmentDate: Date.now(),
      });
      setQuestions(generated);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAppointmentId || questions.length === 0) return;
    setIsSaving(true);
    try {
      await update(selectedAppointmentId, { generatedQuestions: questions });
      toast.success("Questions saved to appointment");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save questions"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatAppointmentLabel = (appt: Appointment) => {
    const date = new Date(appt.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${appt.doctorName} — ${date}`;
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Generate questions based on your symptom history from the last 30 days.
        You can optionally save them to an upcoming appointment.
      </p>

      {questions.length === 0 ? (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating…" : "Generate Questions"}
        </Button>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Generated Questions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Regenerating…" : "Regenerate"}
              </Button>
            </div>
            <ol className="space-y-2 list-decimal list-inside bg-muted/40 rounded-lg p-4">
              {questions.map((q, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed">
                  {q}
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Save to appointment{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            {sortedAppointments.length > 0 ? (
              <Select
                value={selectedAppointmentId ?? ""}
                onValueChange={(val) => setSelectedAppointmentId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an appointment…" />
                </SelectTrigger>
                <SelectContent>
                  {sortedAppointments.map((appt) => (
                    <SelectItem key={appt._id} value={appt._id}>
                      {formatAppointmentLabel(appt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No appointments found — add one to save these questions.
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              {selectedAppointmentId ? "Cancel" : "Done"}
            </Button>
            {selectedAppointmentId && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save to Appointment"}
              </Button>
            )}
          </div>
        </>
      )}

      {questions.length === 0 && !isGenerating && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
