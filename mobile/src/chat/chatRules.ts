// Chat rules of FR-16 (Requirements Specification v1.1) for the mock chat of WBS-6.2a.

import type { Activity, JoinRequest } from "../prototype/PrototypeData";

export const MAX_MESSAGE_LENGTH = 1000;

export type ChatMessage = { id: string; text: string; mine: boolean; time: string };

/**
 * open: the request is pending or matched, so both members can write.
 * read-only: the request was declined.
 * ended: the activity (and with it the request and chat) was deleted at 23:59.
 */
export type ChatState = "open" | "read-only" | "ended";

export function chatState(request: JoinRequest | undefined, activity: Activity | undefined): ChatState {
  if (!request || !activity) return "ended";
  return request.status === "declined" ? "read-only" : "open";
}

export function validateMessage(text: string): string | undefined {
  return text.trim().length > MAX_MESSAGE_LENGTH
    ? `A message can have at most ${MAX_MESSAGE_LENGTH} characters.`
    : undefined;
}

export function formatClock(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The chat starts with the join request message, written by the requester. */
export function firstMessage(request: JoinRequest): ChatMessage {
  return {
    id: `${request.id}-request`,
    text: request.message,
    mine: request.direction === "outgoing",
    time: "Request",
  };
}
