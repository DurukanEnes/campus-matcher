import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import ActivityDetailScreen from "../../../mobile/src/screens/ActivityDetailScreen";

const mockNavigate = jest.fn();
let mockParams: { activityId: string } = { activityId: "activity-library" };

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: mockParams }),
}));

beforeEach(() => mockNavigate.mockClear());

const renderDetail = (activityId: string) => {
  mockParams = { activityId };
  return render(<PrototypeProvider><ActivityDetailScreen /></PrototypeProvider>);
};

test("shows the post details and the host", async () => {
  await renderDetail("activity-library");

  expect(screen.getByText("Mustafa İnan Library")).toBeTruthy();
  expect(screen.getByText("Today · 16:30–18:00")).toBeTruthy();
  expect(screen.getByText("Mert Kaya")).toBeTruthy();
  expect(screen.getByText("Quiet focus session. Bring your own coffee!")).toBeTruthy();
});

test("US-08: sends a join request with a message and blocks a second request", async () => {
  await renderDetail("activity-library");

  await fireEvent.changeText(screen.getByLabelText("Message"), "Can I join you?");
  await fireEvent.press(screen.getByRole("button", { name: /Send join request/ }));

  expect(mockNavigate).toHaveBeenCalledWith("Requests", { tab: "Sent" });
  expect(screen.getByText("Request sent")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Send join request/ })).toBeNull();
  expect(screen.queryByLabelText("Message")).toBeNull();
});

test("does not send a request with an empty message", async () => {
  await renderDetail("activity-library");

  await fireEvent.changeText(screen.getByLabelText("Message"), "   ");
  await fireEvent.press(screen.getByRole("button", { name: /Send join request/ }));

  expect(mockNavigate).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Message")).toBeTruthy();
});

test("FR-13: the owner cannot request their own post", async () => {
  await renderDetail("activity-cafe");

  expect(screen.getByText("This is your plan")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Send join request/ })).toBeNull();

  await fireEvent.press(screen.getByRole("button", { name: "See requests for your plans" }));
  expect(mockNavigate).toHaveBeenCalledWith("Requests", { tab: "Incoming" });
});

test("shows a not-found state for an unknown post", async () => {
  await renderDetail("missing-post");

  expect(screen.getByText("Plan not found")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Send join request/ })).toBeNull();
});
