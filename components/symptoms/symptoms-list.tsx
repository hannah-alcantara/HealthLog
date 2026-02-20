"use client";

import * as React from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Symptom } from "@/lib/schemas/symptom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface SymptomsListProps {
  symptoms: Symptom[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  showViewAll?: boolean;
}

function formatDateTime(timestamp: number): React.JSX.Element {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className='flex flex-col'>
      <span>{dateStr}</span>
      <span className='text-xs text-muted-foreground'>{timeStr}</span>
    </div>
  );
}

function getSeverityColor(severity: number): string {
  if (severity <= 3)
    return "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30";
  if (severity <= 6)
    return "text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30";
  return "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30";
}

export function SymptomsList({
  symptoms,
  onDelete,
  showViewAll = false,
}: SymptomsListProps) {
  if (symptoms.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        No symptoms logged yet. Add your first symptom to get started.
      </div>
    );
  }

  return (
    <Card className='pb-0'>
      <CardHeader className='px-4'>
        <div className='flex justify-between items-start'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Recent Symptoms</h2>
            <p className='text-sm text-muted-foreground'>
              Track and monitor your health symptoms
            </p>
          </div>
          {showViewAll && (
            <Link href='/symptoms'>
              <Button>View All</Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className='px-0 border-t'>
        {/* Mobile: card list */}
        <ul className='divide-y sm:hidden'>
          {symptoms.map((symptom) => (
            <li
              key={symptom._id}
              className='flex items-center justify-between gap-3 px-4 py-3'
            >
              <Link
                href={`/symptoms/${symptom._id}`}
                className='flex-1 min-w-0'
              >
                <p className='font-medium truncate hover:text-primary transition-colors'>
                  {symptom.symptomType}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {new Date(symptom.loggedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {symptom.triggers && (
                  <p className='text-xs text-muted-foreground truncate mt-0.5'>
                    {symptom.triggers}
                  </p>
                )}
              </Link>
              <div className='flex items-center gap-2 flex-shrink-0'>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${getSeverityColor(symptom.severity)}`}
                >
                  {symptom.severity}/10
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      aria-label={`Actions for ${symptom.symptomType}`}
                    >
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/symptoms/${symptom._id}`} aria-label={`View details for ${symptom.symptomType}`}>
                        <Pencil className='h-4 w-4' />
                        Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(symptom._id)}
                      className='text-destructive focus:text-destructive focus:bg-destructive/10'
                    >
                      <Trash2 className='h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <Table className='hidden sm:table'>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead className='pl-8'>Date and Time</TableHead>
              <TableHead>Symptom</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Triggers</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className='w-[50px] pr-6'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {symptoms.map((symptom) => (
              <TableRow key={symptom._id}>
                <TableCell className='text-sm pl-8'>
                  {formatDateTime(symptom.loggedAt)}
                </TableCell>
                <TableCell className='font-medium'>
                  <Link
                    href={`/symptoms/${symptom._id}`}
                    className='hover:text-primary hover:underline transition-colors'
                  >
                    {symptom.symptomType}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold px-2 py-1 rounded-md ${getSeverityColor(symptom.severity)}`}
                  >
                    {symptom.severity}/10
                  </span>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {symptom.triggers || "-"}
                </TableCell>
                <TableCell className='text-sm text-muted-foreground max-w-[300px] truncate'>
                  {symptom.notes || "-"}
                </TableCell>
                <TableCell className='pr-8'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        aria-label={`Actions for ${symptom.symptomType}`}
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/symptoms/${symptom._id}`} aria-label={`View details for ${symptom.symptomType}`}>
                          <Pencil className='h-4 w-4' />
                          Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(symptom._id)}
                        className='text-destructive focus:text-destructive focus:bg-destructive/10'
                      >
                        <Trash2 className='h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
