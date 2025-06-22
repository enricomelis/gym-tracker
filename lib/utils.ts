import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfWeek,
  endOfWeek,
  differenceInDays,
  addDays,
  getYear,
  format,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const month = monthNames[date.getUTCMonth()];

  return `${day} ${month} ${year}`;
}

export const getWeeksInYear = (year: number) => {
  const firstDay = new Date(year, 0, 1);
  const startOfFirstWeek = startOfWeek(firstDay, { weekStartsOn: 1 });

  let lastDay = new Date(year, 11, 31); // Dec 31

  // The week that contains Dec 31
  const endOfLastWeek = endOfWeek(lastDay, { weekStartsOn: 1 });

  // If the week of Dec 31 extends into the next year, it's week 1 of the next year.
  // So we consider the previous week as the last week of the current year.
  if (getYear(endOfLastWeek) > year) {
    lastDay = addDays(lastDay, -7);
  }

  const startOfLastWeek = startOfWeek(lastDay, { weekStartsOn: 1 });
  const weeks =
    Math.round(differenceInDays(startOfLastWeek, startOfFirstWeek) / 7) + 1;
  return weeks;
};

export const getWeekDateRange = (year: number, weekNumber: number) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const startOfWeek1 = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });

  const startDate = addDays(startOfWeek1, (weekNumber - 1) * 7);
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

  return `${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM")}`;
};
