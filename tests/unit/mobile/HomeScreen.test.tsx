import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import HomeScreen from "../../../mobile/src/screens/HomeScreen";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

// Friday, 27 November 2026.
const now = () => new Date(2026, 10, 27, 15, 0);

beforeEach(() => mockNavigate.mockClear());

async function renderHome() {
  await render(
    <PrototypeProvider>
      <HomeScreen now={now} />
    </PrototypeProvider>,
  );
}

test("shows the app name", async () => {
  await renderHome();
  expect(screen.getByText("CampusMatcher")).toBeTruthy();
});

test("shows today's date", async () => {
  await renderHome();
  expect(screen.getByText("FRIDAY, NOVEMBER 27")).toBeTruthy();
});

test("Add Activity opens the Add Activity flow", async () => {
  await renderHome();
  await fireEvent.press(screen.getByRole("button", { name: "Add Activity" }));
  expect(mockNavigate).toHaveBeenCalledWith("CreateActivity");
});

test("Join Activity opens the activity feed", async () => {
  await renderHome();
  await fireEvent.press(screen.getByRole("button", { name: "Join Activity" }));
  expect(mockNavigate).toHaveBeenCalledWith("ActivityFeed");
});
