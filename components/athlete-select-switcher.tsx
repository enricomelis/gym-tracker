"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { FC } from "react";

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
};

interface AthleteSelectSwitcherProps {
  athletes: Athlete[];
  selectedAthleteId: string;
  onChange?: (id: string) => void; // opzionale per compatibilità futura
}

const AthleteSelectSwitcher: FC<AthleteSelectSwitcherProps> = ({
  athletes,
  selectedAthleteId,
  onChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("athlete", id);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">Seleziona atleta:</span>
      <Select value={selectedAthleteId} onValueChange={handleChange}>
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
    </div>
  );
};

export default AthleteSelectSwitcher;
