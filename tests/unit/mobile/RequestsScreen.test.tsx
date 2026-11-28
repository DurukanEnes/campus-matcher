import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider, checkJoinRequest } from "../../../mobile/src/prototype/PrototypeData";
import type { Activity, JoinRequest } from "../../../mobile/src/prototype/PrototypeData";
import ActivityDetailScreen from "../../../mobile/src/screens/ActivityDetailScreen";
import RequestsScreen from "../../../mobile/src/screens/RequestsScreen";

const mockNavigate = jest.fn();
let mockParams: Record<string, string> | undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: mockParams }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockParams = undefined;
});

const renderInbox = () => render(<PrototypeProvider><RequestsScreen /></PrototypeProvider>);

test("FR-14: the owner sees each incoming request with its message and requester profile", async () => {
  await renderInbox();

  expect(screen.getByText("Deniz Aydın")).toBeTruthy();
  expect(screen.getByText("Computer Engineering · İTÜ member")).toBeTruthy();
  expect(screen.getByText("“Hi! I have a free hour after class. Mind if I join?”")).toBeTruthy();
  expect(screen.getByText("Selin Yıldız")).toBeTruthy();
  expect(screen.getAllByText("PENDING")).toHaveLength(2);
});

test("US-09: accepting one request opens the chat and declines the other pending request", async () => {
  await renderInbox();

  await fireEvent.press(screen.getAllByRole("button", { name: /Accept & open chat/ })[0]);

  expect(mockNavigate).toHaveBeenCalledWith("Chat", { requestId: "request-demo" });
  expect(screen.getByText("ACCEPTED")).toBeTruthy();
  expect(screen.getByText("DECLINED")).toBeTruthy();
  expect(screen.queryByText("PENDING")).toBeNull();
  expect(screen.queryByRole("button", { name: /Accept & open chat/ })).toBeNull();
  expect(screen.getByRole("button", { name: "Open activity chat" })).toBeTruthy();
});

test("declining a request leaves the other request pending", async () => {
  await renderInbox();

  await fireEvent.press(screen.getAllByRole("button", { name: "Decline" })[0]);

  expect(screen.getByText("DECLINED")).toBeTruthy();
  expect(screen.getAllByText("PENDING")).toHaveLength(1);
  expect(screen.getAllByRole("button", { name: /Accept & open chat/ })).toHaveLength(1);
});

test("opens on the Sent tab when asked and shows an empty state", async () => {
  mockParams = { tab: "Sent" };
  await renderInbox();

  expect(screen.getByRole("button", { name: "Sent" }).props.accessibilityState.selected).toBe(true);
  expect(screen.getByText("No sent requests yet.")).toBeTruthy();
});

test("a request sent from a post detail appears in the Sent tab as pending", async () => {
  mockParams = { activityId: "activity-gym", tab: "Sent" };
  await render(
    <PrototypeProvider>
      <ActivityDetailScreen />
      <RequestsScreen />
    </PrototypeProvider>,
  );

  await fireEvent.changeText(screen.getByLabelText("Message"), "Can I join you?");
  await fireEvent.press(screen.getByRole("button", { name: /Send join request/ }));

  expect(screen.getByText("“Can I join you?”")).toBeTruthy();
  expect(screen.getByText("To Ada Demir")).toBeTruthy();
  expect(screen.getByText("Waiting for Ada Demir to answer.")).toBeTruthy();
});

describe("checkJoinRequest (FR-13)", () => {
  const activity = (overrides: Partial<Activity>): Activity => ({
    id: "post",
    category: "Gym",
    venue: "Ayazağa Campus Gym",
    date: "Today",
    time: "18:30–19:30",
    period: "Evening",
    note: "",
    hostId: "member-ada",
    host: "Ada Demir",
    initials: "AD",
    status: "open",
    ...overrides,
  });
  const outgoing = (status: JoinRequest["status"]): JoinRequest => ({
    id: "request",
    activityId: "post",
    requesterId: "me",
    requester: "You",
    requesterDepartment: "Architecture",
    initials: "EO",
    message: "Hi",
    status,
    direction: "outgoing",
  });

  test("allows a request to another member's open post", () => {
    expect(checkJoinRequest([activity({})], [], "post")).toBe("sent");
  });

  test("rejects own, matched, missing, and already-requested posts", () => {
    expect(checkJoinRequest([activity({ hostId: "me", host: "You" })], [], "post")).toBe("own-post");
    expect(checkJoinRequest([activity({ status: "matched" })], [], "post")).toBe("closed");
    expect(checkJoinRequest([activity({})], [], "other")).toBe("not-found");
    expect(checkJoinRequest([activity({})], [outgoing("pending")], "post")).toBe("duplicate");
  });

  test("a declined request does not block a new one", () => {
    expect(checkJoinRequest([activity({})], [outgoing("declined")], "post")).toBe("sent");
  });
});
