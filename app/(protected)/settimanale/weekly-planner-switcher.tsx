"use client";
import { useState } from "react";
import WeeklyPlanner from "./weekly-planner";
import type { Athlete, Competition } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

export function ModeToggle({
  mode,
  setMode,
}: {
  mode: "generica" | "specifica";
  setMode: (m: "generica" | "specifica") => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(val) => val && setMode(val as "generica" | "specifica")}
      className="ml-2"
    >
      <ToggleGroupItem value="generica" className="px-4">
        Generica
      </ToggleGroupItem>
      <ToggleGroupItem value="specifica" className="px-4">
        Specifica
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default function WeeklyPlannerSwitcher({
  athletes,
  competitions,
}: {
  athletes: Athlete[];
  competitions: Competition[];
}) {
  const [mode, setMode] = useState<"generica" | "specifica">("specifica");
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
      <ModeToggle mode={mode} setMode={setMode} />
        <div
          className={`flex items-center gap-2 ${mode === "generica" ? "w-full justify-end" : ""}`}
        >
          <Button
            variant="outline"
            className="aspect-square h-8 w-8"
            onClick={() => setYear(year - 1)}
          >
            &lt;
          </Button>
          <span className="w-14 text-center font-semibold">{year}</span>
          <Button
            variant="outline"
            className="aspect-square h-8 w-8"
            onClick={() => setYear(year + 1)}
          >
            &gt;
          </Button>
        </div>
      </div>
      {mode === "specifica" && athletes.length > 0 ? (
        <WeeklyPlanner
          athletes={athletes}
          competitions={competitions}
          year={year}
        />
      ) : mode === "generica" ? (
        <WeeklyPlanner athletes={[]} competitions={competitions} year={year} />
      ) : (
        <p>
          Non hai ancora aggiunto nessun atleta. Aggiungine uno dalla pagina{" "}
          <a href="/atleti" className="underline">
            Atleti
          </a>
          .
        </p>
      )}
    </>
  );
}
