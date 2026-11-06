
import { render, screen } from "@testing-library/react-native";
import AppNavigator from "../../../mobile/src/navigation/AppNavigator";

jest.mock("@react-navigation/native", () => ({
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@react-navigation/native-stack", () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: { children: React.ReactNode }) => children,
        Screen: ({ component: Component }: { component: React.ComponentType }) => (
            <Component />
        ),
    }),
}));

test("renders the Home screen through AppNavigator", async () => {
    await render(<AppNavigator />);
    expect(screen.getByText("CampusMatcher")).toBeTruthy();
});
