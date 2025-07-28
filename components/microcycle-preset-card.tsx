"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MicrocyclePresetWithDetails } from "@/lib/types";

const weekDays = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Gio" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sab" },
  { value: 7, label: "Dom" },
];

export default function MicrocyclePresetCard({
  microcycle,
}: {
  microcycle: MicrocyclePresetWithDetails;
}) {
  const getWeekdayLabel = (dayNumber: number) => {
    return (
      weekDays.find((day) => day.value === dayNumber)?.label || `G${dayNumber}`
    );
  };

  const getApparatusCount = (
    session: MicrocyclePresetWithDetails["presets_microcycles_sessions"][0]["presets_training_sessions"],
  ) => {
    if (!session) return 0;

    const apparatuses = [
      session.fx_preset,
      session.ph_preset,
      session.sr_preset,
      session.vt_preset,
      session.pb_preset,
      session.hb_preset,
    ];

    return apparatuses.filter(Boolean).length;
  };

  const getApparatusList = (
    session: MicrocyclePresetWithDetails["presets_microcycles_sessions"][0]["presets_training_sessions"],
  ) => {
    if (!session) return [];

    const apparatuses = [
      { preset: session.fx_preset, code: "FX" },
      { preset: session.ph_preset, code: "PH" },
      { preset: session.sr_preset, code: "SR" },
      { preset: session.vt_preset, code: "VT" },
      { preset: session.pb_preset, code: "PB" },
      { preset: session.hb_preset, code: "HB" },
    ];

    return apparatuses
      .filter(({ preset }) => preset !== null)
      .map(({ code }) => code);
  };

  // Group sessions by day
  const sessionsByDay = microcycle.presets_microcycles_sessions.reduce(
    (acc, session) => {
      const dayNumber = session.day_number;
      if (!acc[dayNumber]) {
        acc[dayNumber] = [];
      }
      acc[dayNumber].push(session);
      return acc;
    },
    {} as Record<number, typeof microcycle.presets_microcycles_sessions>,
  );

  const totalDays = Object.keys(sessionsByDay).length;
  const totalSessions = microcycle.presets_microcycles_sessions.length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium">{microcycle.name}</h4>
              <p className="text-xs text-muted-foreground">
                {microcycle.created_at
                  ? new Date(microcycle.created_at).toLocaleDateString("it-IT")
                  : "Data non disponibile"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {totalDays} giorni
              </div>
              <div className="text-xs text-muted-foreground">
                {totalSessions} allenamenti
              </div>
            </div>
          </div>

          {/* Days and Sessions */}
          <div className="space-y-2">
            {Object.entries(sessionsByDay)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([dayNumber, sessions]) => {
                const dayLabel = getWeekdayLabel(parseInt(dayNumber));
                const sessionCount = sessions.length;

                return (
                  <div key={dayNumber} className="text-xs">
                    <div className="font-medium text-muted-foreground">
                      {dayLabel} ({sessionCount} allenamento
                      {sessionCount > 1 ? "i" : ""})
                    </div>
                    {sessions
                      .sort((a, b) => a.session_order - b.session_order)
                      .map((session) => {
                        const trainingSession =
                          session.presets_training_sessions;
                        if (!trainingSession) return null;

                        const apparatusCount =
                          getApparatusCount(trainingSession);
                        const apparatusList = getApparatusList(trainingSession);

                        return (
                          <div
                            key={session.id}
                            className="ml-2 text-xs text-muted-foreground"
                          >
                            • {trainingSession.name} ({apparatusCount} attrezzi:{" "}
                            {apparatusList.join(", ")})
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
