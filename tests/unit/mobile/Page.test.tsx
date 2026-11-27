import { render, screen, within } from "@testing-library/react-native";
import { Text } from "react-native";
import { Page } from "../../../mobile/src/components/DesignSystem";

// KeyboardAvoidingView compares its own layout (relative to its parent) with the keyboard
// position on the screen. Inside the safe area it starts below the top inset, so it would
// lift the content too little; it must wrap the safe area and start at the top of the screen.
test("a page that avoids the keyboard wraps the whole safe area", async () => {
  await render(
    <Page showTabs={false} scrollable={false} avoidKeyboard>
      <Text>Chat content</Text>
    </Page>,
  );

  const avoider = screen.getByTestId("page-keyboard-avoider");
  expect(within(avoider).getByTestId("page-safe-area")).toBeTruthy();
  expect(within(avoider).getByText("Chat content")).toBeTruthy();
});

test("a normal page has no keyboard avoider", async () => {
  await render(
    <Page showTabs={false}>
      <Text>Content</Text>
    </Page>,
  );

  expect(screen.queryByTestId("page-keyboard-avoider")).toBeNull();
  expect(screen.getByTestId("page-safe-area")).toBeTruthy();
});
