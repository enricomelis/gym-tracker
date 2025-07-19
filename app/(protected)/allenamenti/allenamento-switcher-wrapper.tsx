"use client";

import AllenamentoSwitcher from "@/components/allenamento-switcher";
import type { TrainingSession } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface AllenamentoSwitcherWrapperProps {
  sessions: TrainingSession[];
  selectedSessionId: string;
  athlete?: { id: string };
}

const AllenamentoSwitcherWrapper: React.FC<AllenamentoSwitcherWrapperProps> = ({
  sessions,
  selectedSessionId,
  athlete,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (sessionId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("session", sessionId);
    if (athlete) params.set("athlete", athlete.id);
    router.replace(`?${params.toString()}`);
  };

  return (
    <AllenamentoSwitcher
      sessions={sessions}
      selectedSessionId={selectedSessionId}
      onChange={handleChange}
    />
  );
};

export default AllenamentoSwitcherWrapper;
