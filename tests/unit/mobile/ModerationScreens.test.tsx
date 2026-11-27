import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { AlertButton } from "react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import ActivityDetailScreen from "../../../mobile/src/screens/ActivityDetailScreen";
import ActivityFeedScreen from "../../../mobile/src/screens/ActivityFeedScreen";
import { AdminReportsScreen, MemberProfileScreen, SafetyScreen } from "../../../mobile/src/screens/ModerationScreens";
import { ProfileScreen } from "../../../mobile/src/screens/ProfileScreens";
import ReportScreen from "../../../mobile/src/screens/ReportScreen";
import RequestsScreen from "../../../mobile/src/screens/RequestsScreen";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockParams: Record<string, string> | undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockParams }),
}));

const alertSpy = jest.spyOn(Alert, "alert");

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  alertSpy.mockClear();
  mockParams = undefined;
});

/** Presses a button of the last native Alert, as the user would on the device. */
async function pressAlertButton(text: string) {
  const buttons = (alertSpy.mock.calls.at(-1)?.[2] ?? []) as AlertButton[];
  const button = buttons.find((item) => item.text === text);
  if (!button) throw new Error(`No alert button "${text}"`);
  await act(async () => button.onPress?.());
}

const plans = (count: number) => screen.getByText(`${count} ${count === 1 ? "plan" : "plans"}`);

describe("blocking (US-12, FR-20)", () => {
  test("blocking from a member profile hides their posts and lists them in the block list", async () => {
    mockParams = { memberId: "member-mert" };
    await render(
      <PrototypeProvider>
        <MemberProfileScreen />
        <ActivityFeedScreen />
        <SafetyScreen />
      </PrototypeProvider>,
    );

    expect(plans(4)).toBeTruthy();
    expect(screen.getByText("Your block list is clear.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Block Mert Kaya" }));
    expect(alertSpy).toHaveBeenCalledWith("Block Mert Kaya?", expect.any(String), expect.any(Array));
    await pressAlertButton("Block");

    expect(screen.getByText("You’ve blocked Mert Kaya")).toBeTruthy();
    expect(plans(3)).toBeTruthy();
    expect(screen.queryByLabelText(/Mustafa İnan Library/)).toBeNull();

    // Unblock from the block list (the second "Unblock" control; the first is on the profile).
    const unblock = screen.getAllByRole("button", { name: "Unblock Mert Kaya" });
    expect(unblock).toHaveLength(2);
    await fireEvent.press(unblock[1]);

    expect(plans(4)).toBeTruthy();
    expect(screen.getByText("Your block list is clear.")).toBeTruthy();
  });

  test("cancelling the confirmation does not block", async () => {
    mockParams = { memberId: "member-mert" };
    await render(
      <PrototypeProvider>
        <MemberProfileScreen />
        <ActivityFeedScreen />
      </PrototypeProvider>,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Block Mert Kaya" }));
    await pressAlertButton("Cancel");

    expect(plans(4)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Block Mert Kaya" })).toBeTruthy();
  });

  test("a blocked member's post cannot be requested", async () => {
    mockParams = { memberId: "member-mert", activityId: "activity-library" };
    await render(
      <PrototypeProvider>
        <MemberProfileScreen />
        <ActivityDetailScreen />
      </PrototypeProvider>,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Block Mert Kaya" }));
    await pressAlertButton("Block");

    expect(screen.getByText("You blocked this member")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Send join request/ })).toBeNull();
  });

  test("join requests from a blocked member leave the inbox", async () => {
    mockParams = { memberId: "member-deniz" };
    await render(
      <PrototypeProvider>
        <MemberProfileScreen />
        <RequestsScreen />
      </PrototypeProvider>,
    );

    expect(screen.getByText("“Hi! I have a free hour after class. Mind if I join?”")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Block Deniz Aydın" }));
    await pressAlertButton("Block");

    expect(screen.queryByText("“Hi! I have a free hour after class. Mind if I join?”")).toBeNull();
    expect(screen.getByText("Selin Yıldız")).toBeTruthy();
  });

  test("the member profile opens the report form for that member", async () => {
    mockParams = { memberId: "member-mert" };
    await render(<PrototypeProvider><MemberProfileScreen /></PrototypeProvider>);

    await fireEvent.press(screen.getByRole("button", { name: "Report Mert Kaya" }));

    expect(mockNavigate).toHaveBeenCalledWith("Report", { memberId: "member-mert" });
  });
});

describe("reporting (US-13, FR-21)", () => {
  test("a member report with a reason appears in the administrator's report list", async () => {
    mockParams = { memberId: "member-mert" };
    await render(
      <PrototypeProvider>
        <ReportScreen />
        <ProfileScreen />
        <AdminReportsScreen />
      </PrototypeProvider>,
    );

    expect(screen.getByText("REPORTING A MEMBER")).toBeTruthy();

    // No reason chosen yet: nothing is submitted.
    await fireEvent.press(screen.getByRole("button", { name: "Submit private report" }));
    expect(alertSpy).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole("button", { name: "Harassment" }));
    await fireEvent.changeText(screen.getByLabelText("Anything else we should know?"), "Rude message in a request.");
    await fireEvent.press(screen.getByRole("button", { name: "Submit private report" }));

    expect(alertSpy).toHaveBeenCalledWith("Report received", expect.any(String));
    expect(mockGoBack).toHaveBeenCalled();

    // Switch the prototype role to administrator to see the list.
    expect(screen.queryByRole("button", { name: /Review reports/ })).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Administrator" }));
    expect(screen.getByRole("button", { name: /Review reports/ })).toBeTruthy();

    expect(screen.getByText("Harassment · Just now")).toBeTruthy();
    expect(screen.getByText("Reported by Erinç Özarı · Just now")).toBeTruthy();
    expect(screen.getByText("“Rude message in a request.”")).toBeTruthy();
  });

  test("a post report names the post and its host", async () => {
    mockParams = { activityId: "activity-library" };
    await render(
      <PrototypeProvider>
        <ReportScreen />
        <ProfileScreen />
        <AdminReportsScreen />
      </PrototypeProvider>,
    );

    expect(screen.getByText("REPORTING AN ACTIVITY")).toBeTruthy();
    expect(screen.getByText("Posted by Mert Kaya")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Spam" }));
    await fireEvent.press(screen.getByRole("button", { name: "Submit private report" }));
    await fireEvent.press(screen.getByRole("button", { name: "Administrator" }));

    expect(screen.getAllByText("Activity post · Mustafa İnan Library").length).toBeGreaterThan(0);
    expect(screen.getByText("Reported member: Mert Kaya")).toBeTruthy();
  });

  test("members cannot report themselves", async () => {
    mockParams = { memberId: "me" };
    await render(<PrototypeProvider><ReportScreen /></PrototypeProvider>);

    expect(screen.getByText("You can’t report yourself")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit private report" })).toBeNull();
  });

  test("a report needs a member or a post as its target", async () => {
    await render(<PrototypeProvider><ReportScreen /></PrototypeProvider>);

    expect(screen.getByText("Choose who to report")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit private report" })).toBeNull();
  });
});

describe("admin review (US-14, FR-22, FR-23)", () => {
  const renderAsAdmin = async (extra?: React.ReactNode) => {
    await render(
      <PrototypeProvider>
        <ProfileScreen />
        <AdminReportsScreen />
        {extra}
      </PrototypeProvider>,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Administrator" }));
  };

  test("a member without the administrator role cannot open the report list", async () => {
    await render(<PrototypeProvider><AdminReportsScreen /></PrototypeProvider>);

    expect(screen.getByText("Access refused")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Suspend account" })).toBeNull();
    expect(screen.queryByText("Spam · Today")).toBeNull();
  });

  test("suspending a reported member hides their posts and marks the report handled", async () => {
    mockParams = { activityId: "activity-gym-morning" };
    await renderAsAdmin(
      <>
        <ActivityFeedScreen />
        <ActivityDetailScreen />
      </>,
    );

    expect(plans(4)).toBeTruthy();
    expect(screen.getByText("Spam · Today")).toBeTruthy();
    expect(screen.getByText("Reported member: Can Öztürk")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Suspend account" }));
    expect(alertSpy).toHaveBeenCalledWith("Suspend Can Öztürk?", expect.any(String), expect.any(Array));
    await pressAlertButton("Suspend");

    // FR-23: Can's open post leaves the feed, and its detail is no longer available.
    expect(plans(3)).toBeTruthy();
    expect(screen.getByText("Plan not found")).toBeTruthy();
    // The report moved out of the open list.
    expect(screen.queryByText("Spam · Today")).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Handled" }));
    expect(screen.getByText("Spam · Today")).toBeTruthy();
    expect(screen.getByText("RESOLVED")).toBeTruthy();
    expect(screen.getByText("Account suspended")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Suspend account" })).toBeNull();
  });

  test("cancelling a suspension changes nothing", async () => {
    await renderAsAdmin(<ActivityFeedScreen />);

    await fireEvent.press(screen.getByRole("button", { name: "Suspend account" }));
    await pressAlertButton("Cancel");

    expect(plans(4)).toBeTruthy();
    expect(screen.getByText("Spam · Today")).toBeTruthy();
  });

  test("dismissing a report closes it without suspending the member", async () => {
    await renderAsAdmin(<ActivityFeedScreen />);

    await fireEvent.press(screen.getByRole("button", { name: /Activity post · Ayazağa Campus Gym/ }));
    expect(screen.getByText("Reported member: Ada Demir")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Dismiss report" }));

    expect(plans(4)).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Handled" }));
    expect(screen.getByText("DISMISSED")).toBeTruthy();
    expect(screen.queryByText("Account suspended")).toBeNull();
  });

  test("shows an empty state when every report is handled", async () => {
    await renderAsAdmin();

    await fireEvent.press(screen.getByRole("button", { name: "Dismiss report" }));
    await fireEvent.press(screen.getByRole("button", { name: "Dismiss report" }));

    expect(screen.getByText("No open reports.")).toBeTruthy();
  });
});
