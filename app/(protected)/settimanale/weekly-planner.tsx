"use client";

import { useState, useEffect, useCallback } from "react";
import { getWeek } from "date-fns";
import React from "react";

import type { WeeklyGoal, Competition, Athlete } from "@/lib/types";
import { getGroupedWeeklyGoals } from "@/lib/actions/weekly-planning";
import { getWeeksInYear, getWeekDateRange } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WeeklyGoalForm from "./weekly-goal-form";
import AthleteSelectSwitcher from "@/components/athlete-select-switcher";
import { useRole } from "@/lib/hooks/use-role";

type GroupedGoals = Record<number, WeeklyGoal[]>;

const apparatusList: Array<WeeklyGoal["apparatus"]> = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

export default function WeeklyPlanner({
  athletes,
  competitions,
  year,
}: {
  athletes: Athlete[];
  competitions: Competition[];
  year: number;
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id || "",
  );
  const [groupedGoals, setGroupedGoals] = useState<GroupedGoals>({});
  const [editingWeek, setEditingWeek] = useState<number | null>(null);

  const weeksInYear = getWeeksInYear(year);
  const weeks = Array.from({ length: weeksInYear }, (_, i) => i + 1);

  const { role } = useRole();
  const isReadOnly = role === "athlete";
  const currentWeek = (() => {
    const today = new Date();
    if (year !== today.getFullYear()) return null;
    const week =
      getWeeksInYear(today.getFullYear()) === weeksInYear
        ? getWeek(today, { weekStartsOn: 1 })
        : null;
    return week;
  })();

  const fetchGoals = useCallback(async () => {
    if (!selectedAthleteId) return;

    setIsFetching(true);
    const goals = await getGroupedWeeklyGoals(selectedAthleteId, year);
    setGroupedGoals(goals);
    setIsFetching(false);
  }, [selectedAthleteId, year]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSave = async () => {
    setEditingWeek(null);
    await fetchGoals();
  };

  const handleCloseDialog = () => {
    setEditingWeek(null);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 py-2">
        {isReadOnly ? (
          <div className="w-full rounded border bg-muted px-3 py-2 text-center font-semibold md:w-[200px]">
            {athletes[0]?.first_name} {athletes[0]?.last_name}
          </div>
        ) : athletes.length === 0 ? null : (
          <AthleteSelectSwitcher
            athletes={athletes}
            selectedAthleteId={selectedAthleteId}
            onChange={setSelectedAthleteId}
          />
        )}
      </div>

      <div className="relative max-h-[calc(100vh-200px)] overflow-auto rounded-md border">
        {/* Desktop Table */}
        <Table className="hidden min-w-max md:table">
          <TableHeader className="sticky top-0 z-10 cursor-default bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead
                rowSpan={2}
                className="sticky left-0 z-20 w-40 border-r bg-inherit align-middle"
              >
                Settimana
              </TableHead>
              {apparatusList.map((app) => (
                <TableHead
                  key={app}
                  colSpan={3}
                  className="border-r text-center"
                >
                  {app}
                </TableHead>
              ))}
              <TableHead rowSpan={2} className="border-r">
                Macrociclo
              </TableHead>
              <TableHead rowSpan={2} className="border-r">
                Microciclo
              </TableHead>
              <TableHead rowSpan={2}>Evento</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {apparatusList.map((app) => (
                <React.Fragment key={app}>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">
                    {app === "VT" ? "B" : "U"}
                  </TableHead>
                  <TableHead className="border-r text-center">P</TableHead>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={22} className="h-48 text-center">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : (
              weeks.map((week) => {
                const weekGoals = groupedGoals[week] || [];
                const goalsByApparatus = new Map(
                  weekGoals.map((g) => [g.apparatus, g]),
                );
                const firstGoal = weekGoals[0];

                const eventDisplay: React.ReactNode[] = [];
                if (firstGoal?.competition_id) {
                  const competition = competitions.find(
                    (c) => c.id === firstGoal.competition_id,
                  );
                  if (competition) {
                    eventDisplay.push(
                      <span key="comp" className="font-semibold">
                        {competition.location}
                      </span>,
                    );
                  }
                }
                if (firstGoal?.camp) {
                  eventDisplay.push(<span key="camp">{firstGoal.camp}</span>);
                }

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
                      if (!isReadOnly) setEditingWeek(week);
                    }}
                  >
                    <TableCell className="sticky left-0 z-10 border-r bg-background font-medium">
                      <div>Sett. {week}</div>
                      <div className="text-xs text-muted-foreground">
                        {getWeekDateRange(year, week)}
                      </div>
                    </TableCell>

                    {apparatusList.map((app) => {
                      const goal = goalsByApparatus.get(app);
                      return (
                        <React.Fragment key={app}>
                          <TableCell className="text-center">
                            {goal?.exercise_volume}
                          </TableCell>
                          <TableCell className="text-center">
                            {app === "VT"
                              ? goal?.base_volume
                              : goal?.dismount_volume}
                          </TableCell>
                          <TableCell className="border-r text-center">
                            {goal?.target_penalty}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}

                    <TableCell className="border-r">
                      {firstGoal?.macro}
                    </TableCell>
                    <TableCell className="border-r">
                      {firstGoal?.micro}
                    </TableCell>
                    <TableCell>
                      {eventDisplay.length > 0
                        ? eventDisplay.map((event, index) => (
                            <div key={index}>{event}</div>
                          ))
                        : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {isFetching ? (
            <div className="h-48 p-4 text-center">Caricamento...</div>
          ) : (
            weeks.map((week) => {
              const weekGoals = groupedGoals[week] || [];
              const firstGoal = weekGoals[0];

              const eventDisplay: React.ReactNode[] = [];
              if (firstGoal?.competition_id) {
                const competition = competitions.find(
                  (c) => c.id === firstGoal.competition_id,
                );
                if (competition) {
                  eventDisplay.push(
                    <span key="comp" className="font-semibold">
                      {competition.location}
                    </span>,
                  );
                }
              }
              if (firstGoal?.camp) {
                eventDisplay.push(<span key="camp">{firstGoal.camp}</span>);
              }

              const isCurrent = currentWeek === week;
              return (
                <div
                  key={week}
                  className={`${
                    isReadOnly ? "" : "cursor-pointer hover:bg-muted/50"
                  } border-b p-4 ${isCurrent ? "bg-muted font-bold" : ""}`.trim()}
                  onClick={() => {
                    if (!isReadOnly) setEditingWeek(week);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold">Sett. {week}</div>
                    <div className="text-sm text-muted-foreground">
                      {getWeekDateRange(year, week)}
                    </div>
                  </div>
                  {eventDisplay.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm">
                      {eventDisplay.map((event, index) => (
                        <div key={index}>{event}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!isReadOnly && (
        <Dialog
          open={editingWeek !== null}
          onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        >
          <DialogContent className="w-full max-w-full overflow-y-auto p-2 sm:max-w-lg sm:p-6 md:max-w-2xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Programmazione Settimana {editingWeek}, {year}
              </DialogTitle>
              <DialogDescription>
                Compila i campi per la settimana selezionata. Tutti i dati
                possono essere modificati in seguito.
              </DialogDescription>
            </DialogHeader>
            {editingWeek !== null && (
              <WeeklyGoalForm
                athleteId={selectedAthleteId}
                year={year}
                weekNumber={editingWeek}
                initialGoals={groupedGoals[editingWeek] || []}
                competitions={competitions}
                onSave={handleSave}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
