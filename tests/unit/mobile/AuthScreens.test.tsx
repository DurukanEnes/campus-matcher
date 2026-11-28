import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../../../mobile/src/auth/AuthContext";
import { createMockAuthService, type AuthService } from "../../../mobile/src/auth/mockAuthService";
import { LoginScreen, RegisterScreen, VerifyEmailScreen } from "../../../mobile/src/screens/AuthScreens";
import { Text } from "react-native";

const mockNavigate = jest.fn();
const mockReset = jest.fn();
let mockRouteParams: Record<string, unknown> | undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset, goBack: jest.fn() }),
  useRoute: () => ({ params: mockRouteParams }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockReset.mockClear();
  mockRouteParams = undefined;
});

function SignedInAs() {
  const { session } = useAuth();
  return <Text>{session ? `Signed in as ${session.user.email}` : "Signed out"}</Text>;
}

async function renderWithAuth(ui: React.ReactElement, service: AuthService = createMockAuthService()) {
  await render(
    <AuthProvider service={service}>
      {ui}
      <SignedInAs />
    </AuthProvider>,
  );
  return service;
}

async function fillRegistration(email: string) {
  await fireEvent.changeText(screen.getByLabelText("Your name"), "Zeynep");
  await fireEvent.changeText(screen.getByLabelText("İTÜ e-mail"), email);
  await fireEvent.changeText(screen.getByLabelText("Password"), "campus123");
  await fireEvent.press(screen.getByRole("button", { name: "Continue to verification" }));
}

describe("RegisterScreen", () => {
  test("rejects a non-İTÜ address and explains why", async () => {
    await renderWithAuth(<RegisterScreen />);
    await fillRegistration("zeynep@gmail.com");

    expect(await screen.findByText("Only @itu.edu.tr addresses can register.")).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows an error for every missing field", async () => {
    await renderWithAuth(<RegisterScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "Continue to verification" }));

    expect(screen.getByText("Enter your name.")).toBeTruthy();
    expect(screen.getByText("Only @itu.edu.tr addresses can register.")).toBeTruthy();
    expect(screen.getByText("Use at least 8 characters with a letter and a digit.")).toBeTruthy();
  });

  test("rejects a weak password and explains the rule", async () => {
    await renderWithAuth(<RegisterScreen />);
    await fireEvent.changeText(screen.getByLabelText("Your name"), "Zeynep");
    await fireEvent.changeText(screen.getByLabelText("İTÜ e-mail"), "zeynep@itu.edu.tr");
    await fireEvent.changeText(screen.getByLabelText("Password"), "abc12");
    await fireEvent.press(screen.getByRole("button", { name: "Continue to verification" }));

    expect(screen.getByText("Use at least 8 characters with a letter and a digit.")).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("an İTÜ address continues to verification with the normalized e-mail", async () => {
    await renderWithAuth(<RegisterScreen />);
    await fillRegistration("  Zeynep@ITU.edu.tr ");

    await screen.findByText("Signed out");
    expect(mockNavigate).toHaveBeenCalledWith("VerifyEmail", { email: "zeynep@itu.edu.tr" });
  });

  test("an address that already has an account is rejected", async () => {
    await renderWithAuth(<RegisterScreen />);
    await fillRegistration("demo@itu.edu.tr");

    expect(await screen.findByText("An account with this e-mail already exists. Log in instead.")).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("VerifyEmailScreen", () => {
  let now = 0;

  async function renderVerify() {
    mockRouteParams = { email: "zeynep@itu.edu.tr" };
    now = 0;
    let next = 100000;
    const service = createMockAuthService({ generateCode: () => String(next++), now: () => now });
    await service.register({ displayName: "Zeynep", email: "zeynep@itu.edu.tr", password: "campus123" });
    await renderWithAuth(<VerifyEmailScreen />, service);
  }

  test("shows the address the code was sent to", async () => {
    await renderVerify();
    expect(screen.getByText(/zeynep@itu\.edu\.tr/)).toBeTruthy();
  });

  test("the correct code signs the member in and opens Home", async () => {
    await renderVerify();
    await fireEvent.changeText(screen.getByLabelText("Verification code"), "100000");
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));

    expect(await screen.findByText("Signed in as zeynep@itu.edu.tr")).toBeTruthy();
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Home" }] });
  });

  test("a code that is not six digits is rejected before sending", async () => {
    await renderVerify();
    await fireEvent.changeText(screen.getByLabelText("Verification code"), "123");
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));

    expect(screen.getByText("Enter the 6-digit code.")).toBeTruthy();
  });

  test("a wrong code is rejected", async () => {
    await renderVerify();
    await fireEvent.changeText(screen.getByLabelText("Verification code"), "999999");
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));

    expect(
      await screen.findByText("The code is wrong or expired. Use the latest code or request a new one."),
    ).toBeTruthy();
    expect(screen.getByText("Signed out")).toBeTruthy();
    expect(mockReset).not.toHaveBeenCalled();
  });

  async function enterCode(code: string) {
    await fireEvent.changeText(screen.getByLabelText("Verification code"), code);
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));
  }

  test("an expired code is rejected and a new code is offered", async () => {
    await renderVerify();
    now = 11 * 60 * 1000;
    await enterCode("100000");

    expect(await screen.findByText("This code has expired. Request a new code.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resend code" })).toBeTruthy();
    expect(screen.getByText("Signed out")).toBeTruthy();
  });

  test("after 5 wrong codes the member has to request a new code", async () => {
    await renderVerify();
    for (let attempt = 0; attempt < 5; attempt++) await enterCode("999999");
    await enterCode("100000");

    expect(await screen.findByText("Too many wrong codes. Request a new code.")).toBeTruthy();
    expect(screen.getByText("Signed out")).toBeTruthy();
  });

  test("a resent code replaces the old one", async () => {
    await renderVerify();
    await fireEvent.press(screen.getByRole("button", { name: "Resend code" }));
    expect(await screen.findByText("A new code is on its way. The previous code no longer works.")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Verification code"), "100000");
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));
    expect(
      await screen.findByText("The code is wrong or expired. Use the latest code or request a new one."),
    ).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Verification code"), "100001");
    await fireEvent.press(screen.getByRole("button", { name: "Verify and continue" }));
    expect(await screen.findByText("Signed in as zeynep@itu.edu.tr")).toBeTruthy();
  });
});

describe("LoginScreen", () => {
  async function logIn(email: string, password: string) {
    await fireEvent.changeText(screen.getByLabelText("İTÜ e-mail"), email);
    await fireEvent.changeText(screen.getByLabelText("Password"), password);
    await fireEvent.press(screen.getByRole("button", { name: "Log in" }));
  }

  test("a verified member logs in and opens Home", async () => {
    await renderWithAuth(<LoginScreen />);
    await logIn("demo@itu.edu.tr", "campus123");

    expect(await screen.findByText("Signed in as demo@itu.edu.tr")).toBeTruthy();
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Home" }] });
  });

  test("a wrong password is rejected with an error message", async () => {
    await renderWithAuth(<LoginScreen />);
    await logIn("demo@itu.edu.tr", "wrong-password");

    expect(await screen.findByText("E-mail or password is wrong.")).toBeTruthy();
    expect(screen.getByText("Signed out")).toBeTruthy();
    expect(mockReset).not.toHaveBeenCalled();
  });

  test("empty fields are rejected before sending", async () => {
    await renderWithAuth(<LoginScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Enter your @itu.edu.tr address.")).toBeTruthy();
    expect(screen.getByText("Enter your password.")).toBeTruthy();
  });

  test("an unverified account is sent to verification", async () => {
    const service = createMockAuthService();
    await service.register({ displayName: "Zeynep", email: "zeynep@itu.edu.tr", password: "campus123" });
    await renderWithAuth(<LoginScreen />, service);
    await logIn("zeynep@itu.edu.tr", "campus123");

    expect(await screen.findByText("Verify your e-mail before logging in.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Enter verification code" }));
    expect(mockNavigate).toHaveBeenCalledWith("VerifyEmail", { email: "zeynep@itu.edu.tr" });
  });

  test("the button is disabled while the request is pending", async () => {
    const service = createMockAuthService();
    const realLogin = service.login;
    let release!: () => void;
    service.login = (email, password) =>
      new Promise((resolve) => {
        release = () => resolve(realLogin(email, password));
      });
    await renderWithAuth(<LoginScreen />, service);
    await fireEvent.changeText(screen.getByLabelText("İTÜ e-mail"), "demo@itu.edu.tr");
    await fireEvent.changeText(screen.getByLabelText("Password"), "campus123");
    const pressed = fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Logging in…" })).toBeDisabled();
    await act(async () => release());

    expect(await screen.findByText("Signed in as demo@itu.edu.tr")).toBeTruthy();
  });
});
