// Rules for a new activity post (FR-06 and FR-07 of Requirements Specification v1.1).
// The backend (WBS-4.2, WBS-4.4) repeats every check; these give early feedback in the form.

import type { ActivityCategory } from "../prototype/PrototypeData";

// Predefined İTÜ campus venues per category. WBS-4.3b loads them from the venue API (WBS-4.1).
export const VENUES: Record<ActivityCategory, string[]> = {
  Library: ["Mustafa İnan Library", "Central Library"],
  Gym: ["Ayazağa Campus Gym", "Indoor Sports Hall"],
  Cafeteria: ["Central Cafeteria", "Faculty Cafeteria"],
};

export type PostDraft = {
  category: ActivityCategory;
  venue: string | null;
  /** Planned date as YYYY-MM-DD in local time. */
  date: string;
  start: string;
  end: string;
};

export type PostErrors = Partial<Record<"venue" | "start" | "end", string>>;

const MINUTES_PER_DAY = 24 * 60;
const TIME = /^(\d{1,2}):(\d{2})$/;

export function parseTime(value: string): number | undefined {
  const match = TIME.exec(value.trim());
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return undefined;
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function atMinutes(isoDate: string, minutes: number): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
}

function startOfMinute(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
}

export function validatePost(draft: PostDraft, now: Date): PostErrors {
  const errors: PostErrors = {};
  if (!draft.venue || !VENUES[draft.category].includes(draft.venue)) {
    errors.venue = "Choose a venue from the list.";
  }

  const start = parseTime(draft.start);
  const end = parseTime(draft.end);
  if (start === undefined) errors.start = "Enter the start time as HH:MM, e.g. 19:00.";
  if (end === undefined) errors.end = "Enter the end time as HH:MM, e.g. 23:00.";
  if (start === undefined || end === undefined) return errors;

  if (end <= start) {
    // An end time "before" the start reads as an overnight plan when that plan would be
    // at most 12 hours long (22:00–01:00); otherwise it is a mistyped window (19:00–18:00).
    const overnightLength = end + MINUTES_PER_DAY - start;
    errors.end =
      end < start && overnightLength <= MINUTES_PER_DAY / 2
        ? "The activity must end by 23:59 of the planned day."
        : "The end time must be after the start time.";
  } else if (atMinutes(draft.date, end) <= now) {
    errors.end = "This time window has already passed. Choose a later time.";
  } else if (atMinutes(draft.date, start) < startOfMinute(now)) {
    // A post invites others to join, so it cannot start in the past (FR-07).
    errors.start = "The start time has already passed. Choose a time from now on.";
  }
  return errors;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toIsoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateLabel(isoDate: string, now: Date): string {
  const date = atMinutes(isoDate, 0);
  const today = atMinutes(toIsoDate(now), 0);
  const days = Math.round((date.getTime() - today.getTime()) / (MINUTES_PER_DAY * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function upcomingDates(now: Date, count = 7): { iso: string; label: string }[] {
  return Array.from({ length: count }, (_, offset) => {
    const iso = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
    return { iso, label: dateLabel(iso, now) };
  });
}

export function periodOf(startMinutes: number): "Morning" | "Afternoon" | "Evening" {
  if (startMinutes < 12 * 60) return "Morning";
  if (startMinutes < 17 * 60) return "Afternoon";
  return "Evening";
}
