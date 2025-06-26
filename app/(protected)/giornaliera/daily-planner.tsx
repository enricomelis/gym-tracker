"use client";

import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useCallback,
} from "react";
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
  createEmptyTrainingSession,
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
import { format, getDaysInMonth, getISOWeek, startOfToday } from "date-fns";
import { it } from "date-fns/locale";
import DailyRoutineForm from "./daily-routine-form";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
  const [showPastEvents, setShowPastEvents] = useState(false);

  const formatItalianDate = (date: Date) => {
    const dayOfWeek = format(date, "EEEE", { locale: it });
    const dayOfMonth = format(date, "d");
    const month = format(date, "MMMM", { locale: it });
    return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${dayOfMonth} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  };

  const fetchTrainings = useCallback(() => {
    if (!selectedAthleteId) return;
    startTransition(async () => {
      const data = await getDailyTrainings(
        selectedAthleteId,
        currentYear,
        currentMonth,
      );
      setTrainings(data);
    });
  }, [selectedAthleteId, currentYear, currentMonth]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleEdit = (training: EnrichedTrainingSession) => {
    setSelectedTraining(training);
    setIsFormOpen(true);
  };

  const handleCreateSession = async (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const sessionsForDay = trainingsByDate.get(dateKey) || [];
    // Trova il massimo session_number già presente per quel giorno
    const maxSessionNumber = sessionsForDay.reduce(
      (max, s) => Math.max(max, s.session_number),
      0,
    );
    const nextSessionNumber = maxSessionNumber + 1;

    startTransition(async () => {
      const result = await createEmptyTrainingSession(
        selectedAthleteId,
        format(date, "yyyy-MM-dd"),
        nextSessionNumber,
      );
      if (result.success) {
        fetchTrainings();
      } else {
        console.error(result.error);
      }
    });
  };

  const handleCloseForm = (shouldRefetch = false) => {
    setIsFormOpen(false);
    setSelectedTraining(null);
    if (shouldRefetch) {
      fetchTrainings();
    }
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - 2 + i);
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

  const visibleDays = useMemo(() => {
    if (showPastEvents) {
      return allDaysInMonth;
    }
    const today = startOfToday();
    return allDaysInMonth.filter((day) => day >= today);
  }, [allDaysInMonth, showPastEvents]);

  const hasPastEvents = useMemo(() => {
    const today = startOfToday();
    return allDaysInMonth.some((day) => day < today);
  }, [allDaysInMonth]);

  const trainingsByDate = useMemo(() => {
    const map = new Map<string, EnrichedTrainingSession[]>();
    trainings.forEach((training) => {
      const dateKey = training.date;
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

      {hasPastEvents && !showPastEvents && (
        <div className="my-4 text-center">
          <Button variant="secondary" onClick={() => setShowPastEvents(true)}>
            Carica allenamenti precedenti
          </Button>
        </div>
      )}

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
              {visibleDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const sessionsForDay = trainingsByDate.get(dateKey) || [];

                if (selectedApparatus === "Tutti gli Attrezzi") {
                  // SUMMARY VIEW
                  if (sessionsForDay.length === 0) {
                    return (
                      <TableRow key={dateKey}>
                        <TableCell>
                          <Link href="/settimanale" className="underline">
                            {getISOWeek(day)}
                          </Link>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {formatItalianDate(day)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCreateSession(day)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    );
                  }
                  return sessionsForDay.map((training, index) => (
                    <TableRow
                      key={training.id}
                      onClick={() => handleEdit(training)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link
                          href="/settimanale"
                          className="underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {training.week_number}
                        </Link>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {formatItalianDate(new Date(training.date))}
                        <Badge variant="secondary">{`#${training.session_number}`}</Badge>
                        {index === sessionsForDay.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateSession(day);
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
                  if (sessionsForDay.length === 0) {
                    return (
                      <TableRow key={dateKey}>
                        <TableCell>
                          <Link href="/settimanale" className="underline">
                            {getISOWeek(day)}
                          </Link>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {formatItalianDate(day)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCreateSession(day)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell colSpan={4} />
                      </TableRow>
                    );
                  }

                  return sessionsForDay.map((training, sessionIndex) => {
                    const routinesForApparatus = training.routines.filter(
                      (r) => r.apparatus === selectedApparatus,
                    );
                    return (
                      <TableRow
                        key={training.id}
                        onClick={() => handleEdit(training)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="align-top">
                          <Link
                            href="/settimanale"
                            className="underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {training.week_number}
                          </Link>
                        </TableCell>
                        <TableCell className="flex items-start gap-2 align-top">
                          <div className="flex items-center gap-2">
                            {formatItalianDate(new Date(training.date))}
                            <Badge variant="secondary">{`#${training.session_number}`}</Badge>
                            {sessionIndex === sessionsForDay.length - 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateSession(day);
                                }}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        {routinesForApparatus.length > 0 ? (
                          <>
                            <TableCell className="align-top">
                              <div className="flex flex-col">
                                {routinesForApparatus.map((r) => (
                                  <div key={r.id} className="h-8">
                                    {r.type}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-col">
                                {routinesForApparatus.map((r) => (
                                  <div key={r.id} className="h-8">
                                    {r.quantity}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-col">
                                {routinesForApparatus.map((r) => (
                                  <div key={r.id} className="h-8">
                                    {r.target_sets}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-col">
                                {routinesForApparatus.map((r) => (
                                  <div key={r.id} className="h-8">
                                    {r.target_execution}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={4} className="text-center" />
                        )}
                      </TableRow>
                    );
                  });
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
      />
    </div>
  );
}
