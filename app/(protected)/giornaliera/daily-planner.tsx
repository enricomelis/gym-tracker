"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  EnrichedTrainingSession,
  getDailyTrainings,
} from "@/lib/actions/daily-planning";
import { type Athlete } from "@/lib/actions/athletes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, getDaysInMonth, getISOWeek } from "date-fns";
import { it } from "date-fns/locale";
import DailyRoutineForm from "./daily-routine-form";
import { PlusCircle } from "lucide-react";

interface DailyPlannerProps {
  athletes: Athlete[];
}

const APPARATUS_OPTIONS = [
  "Tutti gli Attrezzi",
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

export default function DailyPlanner({ athletes }: DailyPlannerProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id || "",
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedApparatus, setSelectedApparatus] =
    useState<string>("Tutti gli Attrezzi");
  const [trainings, setTrainings] = useState<EnrichedTrainingSession[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] =
    useState<EnrichedTrainingSession | null>(null);
  const [newTrainingInfo, setNewTrainingInfo] = useState<{
    date: Date;
    sessionNumber: number;
  } | null>(null);

  const fetchTrainings = async () => {
    if (!selectedAthleteId) return;
    startTransition(async () => {
      const data = await getDailyTrainings(
        selectedAthleteId,
        currentYear,
        currentMonth,
      );
      setTrainings(data);
    });
  };

  useEffect(() => {
    fetchTrainings();
  }, [selectedAthleteId, currentYear, currentMonth]);

  const handleEdit = (training: EnrichedTrainingSession) => {
    setSelectedTraining(training);
    setNewTrainingInfo(null);
    setIsFormOpen(true);
  };

  const handleAddNewSession = (date: Date, sessionNumber: number) => {
    setSelectedTraining(null);
    setNewTrainingInfo({ date, sessionNumber });
    setIsFormOpen(true);
  };

  const handleCloseForm = (shouldRefetch = false) => {
    setIsFormOpen(false);
    setSelectedTraining(null);
    setNewTrainingInfo(null);
    if (shouldRefetch) {
      fetchTrainings();
    }
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - i);
  }, []);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(0, i).toLocaleString("it-IT", { month: "long" }),
    }));
  }, []);

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));
  const allDaysInMonth = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(currentYear, currentMonth - 1, i + 1),
  );

  const trainingsByDate = useMemo(() => {
    const map = new Map<string, EnrichedTrainingSession[]>();
    trainings.forEach((training) => {
      const dateKey = format(new Date(training.date), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(training);
    });
    // sort sessions within each day
    map.forEach((sessions) => {
      sessions.sort((a, b) => a.session_number - b.session_number);
    });
    return map;
  }, [trainings]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona Atleta" />
          </SelectTrigger>
          <SelectContent>
            {athletes.map((athlete) => (
              <SelectItem key={athlete.id} value={athlete.id}>
                {athlete.first_name} {athlete.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentMonth)}
          onValueChange={(value) => setCurrentMonth(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona Mese" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentYear)}
          onValueChange={(value) => setCurrentYear(Number(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Seleziona Anno" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedApparatus} onValueChange={setSelectedApparatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona Attrezzo" />
          </SelectTrigger>
          <SelectContent>
            {APPARATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto">
        {isPending ? (
          <p className="text-center">Caricamento...</p>
        ) : (
          <Table>
            <TableHeader>
              {selectedApparatus === "Tutti gli Attrezzi" ? (
                <TableRow>
                  <TableHead className="w-[100px]">Settimana</TableHead>
                  <TableHead className="w-[250px]">Giorno</TableHead>
                  <TableHead>Volume Totale</TableHead>
                  <TableHead>Intensità Media</TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead className="w-[100px]">Settimana</TableHead>
                  <TableHead className="w-[250px]">Giorno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantità</TableHead>
                  <TableHead>N. Salite</TableHead>
                  <TableHead>Esecuzione</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {allDaysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const sessionsForDay = trainingsByDate.get(dateKey) || [];

                if (selectedApparatus === "Tutti gli Attrezzi") {
                  // SUMMARY VIEW
                  if (sessionsForDay.length === 0) {
                    return (
                      <TableRow
                        key={dateKey}
                        onClick={() => handleAddNewSession(day, 1)}
                        className="cursor-pointer"
                      >
                        <TableCell>{getISOWeek(day)}</TableCell>
                        <TableCell>
                          {format(day, "EEEE, d MMMM", { locale: it })}
                        </TableCell>
                        <TableCell colSpan={2}>-</TableCell>
                      </TableRow>
                    );
                  }
                  return sessionsForDay.map((training, index) => (
                    <TableRow
                      key={training.id}
                      onClick={() => handleEdit(training)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        {index === 0 ? training.week_number : ""}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {index === 0
                          ? format(new Date(training.date), "EEEE, d MMMM", {
                              locale: it,
                            })
                          : ""}
                        {index === 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNewSession(
                                day,
                                sessionsForDay.length + 1,
                              );
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{training.total_volume}</TableCell>
                      <TableCell>{training.average_intensity}</TableCell>
                    </TableRow>
                  ));
                } else {
                  // APPARATUS-SPECIFIC VIEW
                  const routinesForApparatus = sessionsForDay.flatMap(
                    (training) =>
                      training.routines
                        .filter((r) => r.apparatus === selectedApparatus)
                        .map((routine) => ({
                          ...routine,
                          parentTraining: training,
                        })),
                  );

                  if (routinesForApparatus.length === 0) {
                    return (
                      <TableRow
                        key={dateKey}
                        onClick={() => handleAddNewSession(day, 1)}
                        className="cursor-pointer"
                      >
                        <TableCell>{getISOWeek(day)}</TableCell>
                        <TableCell>
                          {format(day, "EEEE, d MMMM", { locale: it })}
                        </TableCell>
                        <TableCell colSpan={4}>-</TableCell>
                      </TableRow>
                    );
                  }
                  return routinesForApparatus.map((routine, index) => (
                    <TableRow
                      key={routine.id}
                      onClick={() => handleEdit(routine.parentTraining)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        {index === 0 ? getISOWeek(day) : ""}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {index === 0
                          ? format(day, "EEEE, d MMMM", { locale: it })
                          : ""}
                        {index === 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNewSession(
                                day,
                                sessionsForDay.length + 1,
                              );
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{routine.type}</TableCell>
                      <TableCell>{routine.quantity}</TableCell>
                      <TableCell>{routine.target_sets}</TableCell>
                      <TableCell>{routine.target_execution}</TableCell>
                    </TableRow>
                  ));
                }
              })}
            </TableBody>
          </Table>
        )}
      </div>
      <DailyRoutineForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        trainingData={selectedTraining}
        athleteId={selectedAthleteId}
        year={currentYear}
        month={currentMonth}
        newTrainingInfo={newTrainingInfo}
      />
    </div>
  );
}
