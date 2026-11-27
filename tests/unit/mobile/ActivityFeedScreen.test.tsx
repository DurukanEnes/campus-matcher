import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import type { Activity } from "../../../mobile/src/prototype/PrototypeData";
import ActivityFeedScreen, { filterFeed } from "../../../mobile/src/screens/ActivityFeedScreen";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

beforeEach(() => mockNavigate.mockClear());

function post(overrides: Partial<Activity>): Activity {
  return {
    id: "post",
    category: "Library",
    venue: "Central Library",
    date: "Today",
    time: "19:00–23:00",
    period: "Evening",
    note: "",
    hostId: "member-zeynep",
    host: "Zeynep Arslan",
    initials: "ZA",
    status: "open",
    ...overrides,
  };
}

const anyFilter = { category: "All", hour: "Any time", venue: "" } as const;

describe("filterFeed", () => {
  test("US-07: filtering by Library and after 18:00 shows only the evening library post", () => {
    const library = post({ id: "library", category: "Library", time: "19:00–23:00" });
    const gym = post({ id: "gym", category: "Gym", venue: "Ayazağa Campus Gym", time: "07:00–08:00" });

    const result = filterFeed([library, gym], { category: "Library", hour: "After 18:00", venue: "" });

    expect(result.map((item) => item.id)).toEqual(["library"]);
  });

  test("each hour range matches on the start hour of the time window", () => {
    const morning = post({ id: "morning", time: "07:00–08:00" });
    const noon = post({ id: "noon", time: "12:00–13:00" });
    const afternoon = post({ id: "afternoon", time: "17:59–18:30" });
    const evening = post({ id: "evening", time: "18:00–19:00" });
    const all = [morning, noon, afternoon, evening];

    const ids = (hour: Parameters<typeof filterFeed>[1]["hour"]) =>
      filterFeed(all, { ...anyFilter, hour }).map((item) => item.id);

    expect(ids("Before 12:00")).toEqual(["morning"]);
    expect(ids("12:00–15:00")).toEqual(["noon"]);
    expect(ids("15:00–18:00")).toEqual(["afternoon"]);
    expect(ids("After 18:00")).toEqual(["evening"]);
    expect(ids("Any time")).toEqual(["morning", "noon", "afternoon", "evening"]);
  });

  test("FR-10: own posts and matched posts are hidden, and the order is kept", () => {
    const newest = post({ id: "newest" });
    const own = post({ id: "own", hostId: "me", host: "You" });
    const matched = post({ id: "matched", status: "matched" });
    const oldest = post({ id: "oldest" });

    const result = filterFeed([newest, own, matched, oldest], anyFilter);

    expect(result.map((item) => item.id)).toEqual(["newest", "oldest"]);
  });

  test("FR-12: the venue filter is case-insensitive and combines with category", () => {
    const library = post({ id: "library", venue: "Central Library" });
    const gym = post({ id: "gym", category: "Gym", venue: "Central Gym" });

    expect(filterFeed([library, gym], { ...anyFilter, venue: "  central " }).map((item) => item.id))
      .toEqual(["library", "gym"]);
    expect(filterFeed([library, gym], { ...anyFilter, category: "Gym", venue: "central" }).map((item) => item.id))
      .toEqual(["gym"]);
  });
});

describe("ActivityFeedScreen", () => {
  const renderFeed = () => render(<PrototypeProvider><ActivityFeedScreen /></PrototypeProvider>);

  test("shows other members' open posts and narrows them with combined filters", async () => {
    await renderFeed();

    expect(screen.getByText("4 plans")).toBeTruthy();
    expect(screen.queryByText("Lunch between lectures?")).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Library" }));
    expect(screen.getByText("2 plans")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Library" }).props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole("button", { name: "After 18:00" }));
    expect(screen.getByText("1 plan")).toBeTruthy();
    expect(screen.getByLabelText("Library at Central Library, Today 19:00–23:00")).toBeTruthy();
    expect(screen.queryByLabelText(/Mustafa İnan Library/)).toBeNull();
  });

  test("shows an empty state when nothing matches and clears all filters", async () => {
    await renderFeed();

    await fireEvent.press(screen.getByRole("button", { name: "Cafeteria" }));
    await fireEvent.changeText(screen.getByLabelText("Search campus venues"), "gym");

    expect(screen.getByText("No plans match just yet.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByText("4 plans")).toBeTruthy();
    expect(screen.getByLabelText("Search campus venues").props.value).toBe("");
    expect(screen.getByRole("button", { name: "All" }).props.accessibilityState.selected).toBe(true);
  });

  test("opening a post navigates to its detail screen", async () => {
    await renderFeed();

    await fireEvent.press(screen.getByLabelText("Gym at Ayazağa Campus Gym, Tomorrow 07:00–08:00"));

    expect(mockNavigate).toHaveBeenCalledWith("ActivityDetail", { activityId: "activity-gym-morning" });
  });
});
