import { fireEvent, render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import { EditProfileScreen, ProfileScreen } from "../../../mobile/src/screens/ProfileScreens";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

test("profile edits and selected activity preferences appear on the profile screen", async () => {
  await render(
    <PrototypeProvider>
      <ProfileScreen />
      <EditProfileScreen />
    </PrototypeProvider>,
  );

  expect(screen.getByText("Erinç Özarı")).toBeTruthy();
  expect(screen.getByText("Library · Cafeteria")).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText("Name"), "Ada Kaya");
  await fireEvent.changeText(screen.getByLabelText("Faculty or department"), "Mechanical Engineering");
  await fireEvent.changeText(screen.getByLabelText("Interests"), "Climbing, music");
  await fireEvent.press(screen.getByRole("button", { name: "Library" }));
  await fireEvent.press(screen.getByRole("button", { name: "Gym" }));

  expect(screen.getByRole("button", { name: "Library" }).props.accessibilityState.selected).toBe(false);
  expect(screen.getByRole("button", { name: "Gym" }).props.accessibilityState.selected).toBe(true);

  await fireEvent.press(screen.getByRole("button", { name: "Save preview" }));

  expect(screen.getByText("Ada Kaya")).toBeTruthy();
  expect(screen.getByText("Mechanical Engineering · İTÜ member")).toBeTruthy();
  expect(screen.getByText("CLIMBING")).toBeTruthy();
  expect(screen.getByText("MUSIC")).toBeTruthy();
  expect(screen.getByText("Gym · Cafeteria")).toBeTruthy();
});
