// Device token registration (WBS-7.2). The steps follow the Expo SDK 58 docs: on Android
// the notification channel must exist before the permission prompt and the token request.
// The platform values match DeviceTokenIn of the backend (app/notifications/schemas.py).

export type PushPlatform = "ANDROID" | "IOS";

export type PushRegistrationDeps = {
  isDevice: boolean;
  platform: string;
  createAndroidChannel: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  getDeviceToken: () => Promise<string>;
  sendToken: (token: string, platform: PushPlatform) => Promise<void>;
};

/**
 * registered: the backend stored the token.
 * denied: the member did not allow notifications.
 * unavailable: a simulator or emulator, which cannot receive push notifications.
 * failed: no token (for example in Expo Go) or the backend rejected it; the app keeps working.
 */
export type PushRegistrationResult = "registered" | "denied" | "unavailable" | "failed";

export async function registerForPushNotifications(deps: PushRegistrationDeps): Promise<PushRegistrationResult> {
  if (!deps.isDevice) return "unavailable";
  const android = deps.platform === "android";

  try {
    if (android) await deps.createAndroidChannel();
    if (!(await deps.requestPermission())) return "denied";
    const token = await deps.getDeviceToken();
    await deps.sendToken(token, android ? "ANDROID" : "IOS");
    return "registered";
  } catch {
    return "failed";
  }
}
