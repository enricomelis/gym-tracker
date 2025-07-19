"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import type { TrainingSession } from "@/lib/types";

type AllenamentoSwitcherProps = {
  sessions: TrainingSession[];
  selectedSessionId: string;
  onChange: (sessionId: string) => void;
};

const AllenamentoSwitcher: React.FC<AllenamentoSwitcherProps> = ({
  sessions,
  selectedSessionId,
  onChange,
}) => {
  if (sessions.length <= 1) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="mr-2 text-sm font-semibold text-muted-foreground">
        Seleziona allenamento:
      </span>
      <div className="flex gap-2">
        {sessions.map((session) => (
          <Button
            key={session.id}
            variant={session.id === selectedSessionId ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(session.id)}
            disabled={session.id === selectedSessionId}
            className="min-w-[90px]"
          >
            {`Allenamento #${session.session_number}`}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AllenamentoSwitcher;
