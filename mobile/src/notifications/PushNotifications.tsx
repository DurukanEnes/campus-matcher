import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { expoNotificationSource, expoPushDeps, showNotificationsInForeground } from "./expoNotifications";
import { useNotificationNavigation, usePushRegistration } from "./hooks";
import { registerForPushNotifications } from "./registration";
import type { NotificationRoute } from "./routing";

export type PushNotificationsHandle = { onNavigationReady: () => void };

function open(navigation: NavigationContainerRefWithCurrent<RootStackParamList>, route: NotificationRoute) {
  if (route.name === "Chat") navigation.navigate("Chat", route.params);
  else navigation.navigate("Requests", route.params);
}

/**
 * Registers the device token after sign-in and opens the related screen when a
 * notification is tapped. A tap that arrives before navigation is ready (the app was
 * started by the notification) is kept and opened in onNavigationReady.
 */
export function PushNotifications({
  navigation,
  ref,
}: {
  navigation: NavigationContainerRefWithCurrent<RootStackParamList>;
  ref?: Ref<PushNotificationsHandle>;
}) {
  const { session } = useAuth();
  const pending = useRef<NotificationRoute>(undefined);

  useEffect(showNotificationsInForeground, []);

  const navigate = useCallback(
    (name: NotificationRoute["name"], params: NotificationRoute["params"]) => {
      const route = { name, params } as NotificationRoute;
      if (navigation.isReady()) open(navigation, route);
      else pending.current = route;
    },
    [navigation],
  );

  useImperativeHandle(ref, () => ({
    onNavigationReady: () => {
      if (pending.current) open(navigation, pending.current);
      pending.current = undefined;
    },
  }));

  useNotificationNavigation(expoNotificationSource, navigate);
  usePushRegistration(session !== null, () => registerForPushNotifications(expoPushDeps));
  return null;
}
