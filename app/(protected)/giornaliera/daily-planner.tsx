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
import { format } from "date-fns";
import { it } from "date-fns/locale";
import DailyRoutineForm from "./daily-routine-form";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] =
    useState<EnrichedTrainingSession | null>(null);

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
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTraining(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTraining(null);
    fetchTrainings(); // Refetch data after form is closed
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
        <Button onClick={handleAddNew}>Aggiungi Allenamento</Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        {isPending ? (
          <p className="text-center">Caricamento...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Giorno</TableHead>
                <TableHead className="w-[100px]">Settimana</TableHead>
                {selectedApparatus === "Tutti gli Attrezzi" ? (
                  <>
                    <TableHead>Volume Totale</TableHead>
                    <TableHead>Intensità Media</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Tipo di Salita</TableHead>
                    <TableHead>Quantità</TableHead>
                    <TableHead>Numero di Salite</TableHead>
                    <TableHead>Esecuzione</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.length > 0 ? (
                trainings.map((training) =>
                  selectedApparatus === "Tutti gli Attrezzi" ? (
                    <TableRow
                      key={training.id}
                      onClick={() => handleEdit(training)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        {format(new Date(training.date), "EEEE, d MMMM", {
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell>{training.week_number}</TableCell>
                      <TableCell>{training.total_volume}</TableCell>
                      <TableCell>{training.average_intensity}</TableCell>
                    </TableRow>
                  ) : (
                    training.routines
                      .filter((r) => r.apparatus === selectedApparatus)
                      .map((routine) => (
                        <TableRow
                          key={routine.id}
                          onClick={() => handleEdit(training)}
                          className="cursor-pointer"
                        >
                          <TableCell>
                            {format(new Date(training.date), "EEEE, d MMMM", {
                              locale: it,
                            })}
                          </TableCell>
                          <TableCell>{training.week_number}</TableCell>
                          <TableCell>{routine.type}</TableCell>
                          <TableCell>{routine.quantity}</TableCell>
                          <TableCell>{routine.target_sets}</TableCell>
                          <TableCell>{routine.target_execution}</TableCell>
                        </TableRow>
                      ))
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={selectedApparatus === "Tutti gli Attrezzi" ? 4 : 6}
                    className="h-24 text-center"
                  >
                    Nessun allenamento trovato per questo mese.
                  </TableCell>
                </TableRow>
              )}
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
      />
    </div>
  );
}
