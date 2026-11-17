import { render, screen } from "@testing-library/react-native";
import { PrototypeProvider } from "../../../mobile/src/prototype/PrototypeData";
import HomeScreen from "../../../mobile/src/screens/HomeScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

test("shows the app name", async () => {
  await render(<PrototypeProvider><HomeScreen /></PrototypeProvider>);
  expect(screen.getByText("CampusMatcher")).toBeTruthy();
});
