import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  registerForPushNotifications,
  type PushRegistrationDeps,
} from "../../../mobile/src/notifications/registration";
import { routeForNotification } from "../../../mobile/src/notifications/routing";
import {
  useNotificationNavigation,
  usePushRegistration,
  type NotificationSource,
} from "../../../mobile/src/notifications/hooks";

describe("routeForNotification", () => {
  test("a new join request opens the owner's incoming requests", () => {
    expect(routeForNotification({ type: "JOIN_REQUEST", request_id: "request-demo" })).toEqual({
      name: "Requests",
      params: { tab: "Incoming" },
    });
  });

  test("a request response opens the requester's sent requests", () => {
    expect(routeForNotification({ type: "REQUEST_RESPONSE", request_id: "request-demo" })).toEqual({
      name: "Requests",
      params: { tab: "Sent" },
    });
  });

  test("a new message opens the chat of its join request", () => {
    expect(routeForNotification({ type: "MESSAGE", request_id: "request-demo" })).toEqual({
      name: "Chat",
      params: { requestId: "request-demo" },
    });
  });

  test("a message without a request opens the request inbox", () => {
    expect(routeForNotification({ type: "MESSAGE" })).toEqual({ name: "Requests", params: undefined });
  });

  test("test and unknown notifications open nothing", () => {
    expect(routeForNotification({ type: "TEST" })).toBeUndefined();
    expect(routeForNotification({ type: "SOMETHING_NEW" })).toBeUndefined();
    expect(routeForNotification(undefined)).toBeUndefined();
    expect(routeForNotification({ type: 42 })).toBeUndefined();
  });
});

function fakeDeps(overrides: Partial<PushRegistrationDeps> = {}): PushRegistrationDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    isDevice: true,
    platform: "android",
    createAndroidChannel: async () => {
      calls.push("channel");
    },
    requestPermission: async () => {
      calls.push("permission");
      return true;
    },
    getDeviceToken: async () => {
      calls.push("token");
      return "fcm-token-1";
    },
    sendToken: async (token, platform) => {
      calls.push(`send ${token} ${platform}`);
    },
    ...overrides,
  };
}

describe("registerForPushNotifications", () => {
  test("creates the Android channel before asking and sends the token with its platform", async () => {
    const deps = fakeDeps();
    await expect(registerForPushNotifications(deps)).resolves.toBe("registered");
    expect(deps.calls).toEqual(["channel", "permission", "token", "send fcm-token-1 ANDROID"]);
  });

  test("sends IOS as the platform on iOS and skips the Android channel", async () => {
    const deps = fakeDeps({ platform: "ios" });
    await registerForPushNotifications(deps);
    expect(deps.calls).toEqual(["permission", "token", "send fcm-token-1 IOS"]);
  });

  test("does nothing on a simulator or emulator", async () => {
    const deps = fakeDeps({ isDevice: false });
    await expect(registerForPushNotifications(deps)).resolves.toBe("unavailable");
    expect(deps.calls).toEqual([]);
  });

  test("stops when the member denies the permission", async () => {
    const deps = fakeDeps({ requestPermission: async () => false });
    await expect(registerForPushNotifications(deps)).resolves.toBe("denied");
    expect(deps.calls).toEqual(["channel"]);
  });

  test("reports a failure instead of throwing, for example in Expo Go", async () => {
    const deps = fakeDeps({
      getDeviceToken: async () => {
        throw new Error("Remote notifications are not supported in Expo Go");
      },
    });
    await expect(registerForPushNotifications(deps)).resolves.toBe("failed");
  });

  test("reports a failure when the backend rejects the token", async () => {
    const deps = fakeDeps({
      sendToken: async () => {
        throw new Error("Request failed with status code 401");
      },
    });
    await expect(registerForPushNotifications(deps)).resolves.toBe("failed");
  });
});

function fakeSource(initial?: Record<string, unknown>) {
  let listener: ((data: Record<string, unknown> | undefined) => void) | undefined;
  const source: NotificationSource & { tap: (data: Record<string, unknown>) => void; removed: boolean } = {
    removed: false,
    getInitialData: async () => initial,
    subscribe: (onTap) => {
      listener = onTap;
      return () => {
        source.removed = true;
      };
    },
    tap: (data) => listener?.(data),
  };
  return source;
}

function NavigationProbe({ source, navigate }: { source: NotificationSource; navigate: jest.Mock }) {
  useNotificationNavigation(source, navigate);
  return null;
}

describe("useNotificationNavigation", () => {
  test("opens the related screen when a notification is tapped", async () => {
    const source = fakeSource();
    const navigate = jest.fn();
    await render(<NavigationProbe source={source} navigate={navigate} />);

    source.tap({ type: "MESSAGE", request_id: "request-demo" });

    expect(navigate).toHaveBeenCalledWith("Chat", { requestId: "request-demo" });
  });

  test("opens the screen of the notification that started the app", async () => {
    const source = fakeSource({ type: "JOIN_REQUEST", request_id: "request-demo" });
    const navigate = jest.fn();
    await render(<NavigationProbe source={source} navigate={navigate} />);

    expect(navigate).toHaveBeenCalledWith("Requests", { tab: "Incoming" });
  });

  test("ignores taps on notifications without a screen and stops listening on unmount", async () => {
    const source = fakeSource();
    const navigate = jest.fn();
    const view = await render(<NavigationProbe source={source} navigate={navigate} />);

    source.tap({ type: "TEST" });
    expect(navigate).not.toHaveBeenCalled();

    await view.unmount();
    expect(source.removed).toBe(true);
  });
});

function RegistrationProbe({ signedIn, register }: { signedIn: boolean; register: jest.Mock }) {
  const status = usePushRegistration(signedIn, register);
  return <Text>{`status: ${status ?? "none"}`}</Text>;
}

describe("usePushRegistration", () => {
  test("registers once after the member signs in", async () => {
    const register = jest.fn(async () => "registered" as const);
    await render(<RegistrationProbe signedIn={false} register={register} />);
    expect(register).not.toHaveBeenCalled();

    await screen.rerender(<RegistrationProbe signedIn register={register} />);
    expect(await screen.findByText("status: registered")).toBeTruthy();

    await screen.rerender(<RegistrationProbe signedIn register={register} />);
    expect(register).toHaveBeenCalledTimes(1);
  });
});
