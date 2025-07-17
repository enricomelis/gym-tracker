import WeeklyMicrocyclePlanner from "./weekly-microcycle-planner";
import { getYear } from "date-fns";

export default function SettimanaleNuova() {
  const year = getYear(new Date());
  return <WeeklyMicrocyclePlanner year={year} />;
}
