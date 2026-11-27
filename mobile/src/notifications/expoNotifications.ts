// expo-notifications adapter (Expo SDK 58). Remote push needs a development build:
// in Expo Go the token request fails, and registration reports "failed" without breaking the app.

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiClient } from "../api/client";
import type { NotificationSource } from "./hooks";
import type { PushRegistrationDeps } from "./registration";

/** Shows notifications that arrive while the app is open. Called once at startup. */
export function showNotificationsInForeground() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const expoPushDeps: PushRegistrationDeps = {
  isDevice: Device.isDevice,
  platform: Platform.OS,
  createAndroidChannel: async () => {
    await Notifications.setNotificationChannelAsync("default", {
      name: "CampusMatcher",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  },
  requestPermission: async () => {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  },
  getDeviceToken: async () => String((await Notifications.getDevicePushTokenAsync()).data),
  sendToken: async (token, platform) => {
    await apiClient.post("/notifications/device-tokens", { token, platform });
  },
};

const dataOf = (response: Notifications.NotificationResponse | null | undefined) =>
  response?.notification.request.content.data ?? undefined;

export const expoNotificationSource: NotificationSource = {
  getInitialData: async () => dataOf(await Notifications.getLastNotificationResponseAsync()),
  subscribe: (onTap) => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => onTap(dataOf(response)));
    return () => subscription.remove();
  },
};
