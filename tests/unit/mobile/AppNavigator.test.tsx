import { render, screen } from "@testing-library/react-native";
import AppNavigator from "../../../mobile/src/navigation/AppNavigator";

jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { activityId: "activity-library" } }),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({
      component: Component,
      name,
    }: {
      component: React.ComponentType;
      name: string;
    }) => name === "Home" ? <Component /> : null,
  }),
}));

test("renders the Home screen through AppNavigator", async () => {
  await render(<AppNavigator />);
  expect(screen.getByText("CampusMatcher")).toBeTruthy();
  expect(screen.getByText(/Make today a little/)).toBeTruthy();
});
