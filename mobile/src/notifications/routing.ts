// Which screen a tapped notification opens (WBS-7.2, FR-18).
// The backend (WBS-7.1) sends `type` and string data fields; chat and request
// notifications carry the `request_id` of the join request, because a chat belongs to it.

import type { RootStackParamList } from "../navigation/types";

export type NotificationRoute =
  | { name: "Requests"; params: RootStackParamList["Requests"] }
  | { name: "Chat"; params: RootStackParamList["Chat"] };

export function routeForNotification(data: Record<string, unknown> | undefined): NotificationRoute | undefined {
  const type = data?.type;
  const requestId = typeof data?.request_id === "string" ? data.request_id : undefined;

  switch (type) {
    case "JOIN_REQUEST":
      return { name: "Requests", params: { tab: "Incoming" } };
    case "REQUEST_RESPONSE":
      return { name: "Requests", params: { tab: "Sent" } };
    case "MESSAGE":
      return requestId ? { name: "Chat", params: { requestId } } : { name: "Requests", params: undefined };
    default:
      return undefined;
  }
}
