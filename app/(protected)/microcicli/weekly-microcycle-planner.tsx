"use client";

import { useCallback, useEffect, useState } from "react";
import { getWeek } from "date-fns";
import { getWeeksInYear } from "@/lib/utils";
import React from "react";

import { getGroupedMicrocycles } from "@/lib/actions/microcycle-planning";
import { getDailyRoutinePresets } from "@/lib/actions/presets";
import type { WeeklyMicrocycle } from "@/lib/actions/microcycle-planning";
import type { DailyRoutinePreset } from "@/lib/types";
import { getWeekDateRange } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MicrocycleWeekForm from "./microcycle-week-form";
import { useRole } from "@/lib/hooks/use-role";

interface Props {
  year: number;
}

const weekdayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default function WeeklyMicrocyclePlanner({ year }: Props) {
  const [grouped, setGrouped] = useState<Record<number, WeeklyMicrocycle[]>>(
    {},
  );
  const [dailyMap, setDailyMap] = useState<Map<string, DailyRoutinePreset>>(
    new Map(),
  );
  const [isFetching, setIsFetching] = useState(false);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [viewWeek, setViewWeek] = useState<number | null>(null);

  const weeksInYear = getWeeksInYear(year);
  const weeks = Array.from({ length: weeksInYear }, (_, i) => i + 1);
  const today = new Date();
  const currentWeek =
    today.getFullYear() === year ? getWeek(today, { weekStartsOn: 1 }) : null;

  const { role } = useRole();
  const isReadOnly = role === "athlete";

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    const [groupedPlans, dailyPresets] = await Promise.all([
      getGroupedMicrocycles(year),
      getDailyRoutinePresets(),
    ]);
    setGrouped(groupedPlans);
    const map = new Map<string, DailyRoutinePreset>();
    dailyPresets.forEach((p: DailyRoutinePreset) => map.set(p.id, p));
    setDailyMap(map);
    setIsFetching(false);
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCellContent = (
    allenamentoId: string | null | undefined,
  ): React.ReactNode => {
    if (!allenamentoId) return null;
    const preset = dailyMap.get(allenamentoId);
    if (!preset) return null;
    // Example output: "8 I+ FX"
    return (
      <span className="whitespace-nowrap text-xs font-medium">
        {preset.quantity} {preset.type} {preset.apparatus}
      </span>
    );
  };

  const handleSave = async () => {
    setEditingWeek(null);
    await fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="relative max-h-[calc(100vh-200px)] overflow-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="sticky left-0 z-20 w-32 border-r bg-inherit">
                Settimana
              </TableHead>
              {weekdayLabels.map((d) => (
                <TableHead key={d} className="text-center">
                  {d}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : (
              weeks.map((week) => {
                const plan = (grouped[week] || [])[0] as
                  | WeeklyMicrocycle
                  | undefined;
                const isCurrent = currentWeek === week;
                const baseRowClass = isReadOnly
                  ? ""
                  : "cursor-pointer hover:bg-muted/50";
                const highlightClass = isCurrent ? "bg-muted font-bold" : "";
                return (
                  <TableRow
                    key={week}
                    className={`${baseRowClass} ${highlightClass}`.trim()}
                    onClick={() => {
                      if (isReadOnly) return;
                      if (plan) {
                        setViewWeek(week);
                      } else {
                        setEditingWeek(week);
                      }
                    }}
                  >
                    <TableCell className="sticky left-0 z-10 w-32 border-r bg-background font-medium">
                      <div>Sett. {week}</div>
                      <div className="text-xs text-muted-foreground">
                        {getWeekDateRange(year, week)}
                      </div>
                    </TableCell>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <TableCell key={day} className="text-center">
                        {plan
                          ? renderCellContent(
                              plan[
                                `allenamento_${day}` as keyof WeeklyMicrocycle
                              ] as string | null | undefined,
                            )
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={viewWeek !== null}
        onOpenChange={(isOpen) => !isOpen && setViewWeek(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Dettaglio Settimana {viewWeek}, {year}
            </DialogTitle>
          </DialogHeader>
          {viewWeek !== null && (
            <div className="space-y-2">
              {weekdayLabels.map((label, idx) => {
                const plan = (grouped[viewWeek!] || [])[0] as
                  | WeeklyMicrocycle
                  | undefined;
                const allenamentoId = plan?.[
                  `allenamento_${idx + 1}` as keyof WeeklyMicrocycle
                ] as string | null | undefined;
                const preset = allenamentoId
                  ? dailyMap.get(allenamentoId)
                  : null;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-12 font-semibold">{label}</span>
                    {preset ? (
                      <span>
                        {preset.quantity} {preset.type} {preset.apparatus} –{" "}
                        {preset.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Nessun allenamento
                      </span>
                    )}
                  </div>
                );
              })}
              {!isReadOnly && (
                <Button
                  onClick={() => {
                    setEditingWeek(viewWeek);
                    setViewWeek(null);
                  }}
                >
                  Modifica settimana
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {!isReadOnly && (
        <Dialog
          open={editingWeek !== null}
          onOpenChange={(isOpen) => !isOpen && setEditingWeek(null)}
        >
          <DialogContent className="overflow-y-auto p-4 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Modifica Settimana {editingWeek}, {year}
              </DialogTitle>
              <DialogDescription>
                Seleziona gli allenamenti per ogni giorno. I dati possono essere
                modificati in seguito.
              </DialogDescription>
            </DialogHeader>
            {editingWeek !== null && (
              <MicrocycleWeekForm
                weekNumber={editingWeek}
                year={year}
                onSave={handleSave}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
