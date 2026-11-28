import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import CreateActivityScreen from "../../../mobile/src/screens/CreateActivityScreen";
import HomeScreen from "../../../mobile/src/screens/HomeScreen";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

// Friday, 27 November 2026, 15:00 local time.
const now = () => new Date(2026, 10, 27, 15, 0);

beforeEach(() => mockNavigate.mockClear());

async function renderCreate() {
  await render(
    <PrototypeProvider>
      <CreateActivityScreen now={now} />
      <HomeScreen now={now} />
    </PrototypeProvider>,
  );
}

async function fillPost({ venue, date = "Today", start, end }: { venue?: string; date?: string; start: string; end: string }) {
  if (venue) await fireEvent.press(screen.getByRole("button", { name: venue }));
  await fireEvent.press(screen.getByRole("button", { name: date }));
  await fireEvent.changeText(screen.getByLabelText("Start time"), start);
  await fireEvent.changeText(screen.getByLabelText("End time"), end);
  await fireEvent.press(screen.getByRole("button", { name: "Publish activity" }));
}

test("a library activity for today appears in the member's own posts on Home", async () => {
  await renderCreate();
  await fillPost({ venue: "Mustafa İnan Library", start: "19:00", end: "23:00" });

  expect(mockNavigate).toHaveBeenCalledWith("Home");
  expect(screen.getByLabelText("Library at Mustafa İnan Library, Today 19:00–23:00")).toBeTruthy();
});

test("a post for a later day keeps the date label and the note", async () => {
  await renderCreate();
  await fireEvent.press(screen.getByRole("button", { name: "Cafeteria" }));
  await fireEvent.changeText(screen.getByLabelText("A note for your campus buddy"), "Lunch after the lab");
  await fillPost({ venue: "Central Cafeteria", date: "Sun 29 Nov", start: "12:00", end: "13:00" });

  expect(mockNavigate).toHaveBeenCalledWith("Home");
  expect(screen.getByLabelText("Cafeteria at Central Cafeteria, Sun 29 Nov 12:00–13:00")).toBeTruthy();
});

test("only the venues of the selected category can be chosen", async () => {
  await renderCreate();
  expect(screen.getByRole("button", { name: "Mustafa İnan Library" })).toBeTruthy();

  await fireEvent.press(screen.getByRole("button", { name: "Gym" }));

  expect(screen.queryByRole("button", { name: "Mustafa İnan Library" })).toBeNull();
  expect(screen.getByRole("button", { name: "Ayazağa Campus Gym" })).toBeTruthy();
  expect(screen.queryByLabelText("Campus venue")).toBeNull();
});

test("a post without a venue is not published", async () => {
  await renderCreate();
  await fillPost({ start: "19:00", end: "23:00" });

  expect(screen.getByText("Choose a venue from the list.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("a window whose end is before its start is not published", async () => {
  await renderCreate();
  await fillPost({ venue: "Mustafa İnan Library", start: "19:00", end: "18:00" });

  expect(screen.getByText("The end time must be after the start time.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("a window that crosses midnight is not published", async () => {
  await renderCreate();
  await fillPost({ venue: "Mustafa İnan Library", start: "22:00", end: "01:00" });

  expect(screen.getByText("The activity must end by 23:59 of the planned day.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("a window that has already passed today is not published", async () => {
  await renderCreate();
  await fillPost({ venue: "Mustafa İnan Library", start: "08:00", end: "09:00" });

  expect(screen.getByText("This time window has already passed. Choose a later time.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("a window that started earlier today is not published", async () => {
  await renderCreate();
  await fillPost({ venue: "Mustafa İnan Library", start: "14:00", end: "23:00" });

  expect(screen.getByText("The start time has already passed. Choose a time from now on.")).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("the preview shows the chosen details", async () => {
  await renderCreate();
  await fireEvent.press(screen.getByRole("button", { name: "Mustafa İnan Library" }));
  await fireEvent.press(screen.getByRole("button", { name: "Tomorrow" }));
  await fireEvent.changeText(screen.getByLabelText("Start time"), "09:00");
  await fireEvent.changeText(screen.getByLabelText("End time"), "11:30");

  expect(screen.getByText("Library · Mustafa İnan Library")).toBeTruthy();
  expect(screen.getByText("Tomorrow · 09:00–11:30")).toBeTruthy();
});
