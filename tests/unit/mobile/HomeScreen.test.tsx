import { render, screen } from "@testing-library/react-native";
import HomeScreen from "../../../mobile/src/screens/HomeScreen";

test("shows the app name", async () => {
  await render(<HomeScreen />);
  expect(screen.getByText("CampusMatcher")).toBeTruthy();
});
