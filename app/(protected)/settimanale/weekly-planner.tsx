"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  getYear,
  startOfYear,
  getWeek,
  add,
  format,
  startOfWeek,
  endOfWeek,
  getISOWeeksInYear,
  startOfISOWeek,
  endOfISOWeek,
} from "date-fns";
import { it } from "date-fns/locale";
import React from "react";

import type { WeeklyGoal } from "@/lib/actions/planning";
import { getGroupedWeeklyGoals } from "@/lib/actions/planning";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WeeklyGoalForm from "./weekly-goal-form";

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
};

type Competition = {
  id: string;
  location: string;
  date: string;
};

type GroupedGoals = Record<number, WeeklyGoal[]>;

const apparatusList: Array<WeeklyGoal["apparatus"]> = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

const getWeekDateRange = (year: number, weekNumber: number) => {
  const yearStart = new Date(year, 0, 1);
  const weekStartOffset = (weekNumber - 1) * 7;
  const dateWithOffset = new Date(
    yearStart.setDate(yearStart.getDate() + weekStartOffset),
  );

  const startDate = startOfISOWeek(dateWithOffset);
  const endDate = endOfISOWeek(dateWithOffset);

  // Handle edge case where the first week of a year might belong to the previous year
  if (getYear(startDate) < year && weekNumber === 1) {
    const realStartDate = new Date(year, 0, 1);
    return `${format(realStartDate, "dd MMM")} - ${format(endDate, "dd MMM")}`;
  }

  // Handle edge case where the last week of a year might belong to the next year
  if (getYear(endDate) > year) {
    const realEndDate = new Date(year, 11, 31);
    return `${format(startDate, "dd MMM")} - ${format(realEndDate, "dd MMM")}`;
  }

  return `${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM")}`;
};

export default function WeeklyPlanner({
  athletes,
  competitions,
}: {
  athletes: Athlete[];
  competitions: Competition[];
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0].id,
  );
  const [year, setYear] = useState(getYear(new Date()));
  const [groupedGoals, setGroupedGoals] = useState<GroupedGoals>({});
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const weeksInYear = getISOWeeksInYear(year);
  const weeks = Array.from({ length: weeksInYear }, (_, i) => i + 1);

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
    setIsFetching(true);
    const goals = await getGroupedWeeklyGoals(selectedAthleteId, year);
    setGroupedGoals(goals);
    setIsFetching(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select onValueChange={setSelectedAthleteId} value={selectedAthleteId}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Seleziona Atleta" />
          </SelectTrigger>
          <SelectContent>
            {athletes.map((athlete) => (
              <SelectItem key={athlete.id} value={athlete.id}>
                {`${athlete.first_name} ${athlete.last_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear(year - 1)}
          >
            &lt;
          </Button>
          <span className="w-24 text-center font-semibold">{year}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear(year + 1)}
          >
            &gt;
          </Button>
        </div>
      </div>

      <div className="relative max-h-[calc(100vh-200px)] overflow-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 z-40 cursor-default bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead
                rowSpan={2}
                className="sticky left-0 z-50 w-40 border-r bg-inherit align-middle"
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

                return (
                  <TableRow
                    key={week}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setEditingWeek(week)}
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
      </div>

      <Dialog
        open={editingWeek !== null}
        onOpenChange={(isOpen) => !isOpen && setEditingWeek(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Programmazione Settimana {editingWeek}, {year}
            </DialogTitle>
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
    </div>
  );
}
