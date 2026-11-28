import { useEffect, useRef, useState } from "react";
import type { PushRegistrationResult } from "./registration";
import { routeForNotification, type NotificationRoute } from "./routing";

export type NotificationSource = {
  /** Data of the notification that opened the app, if the app was started by a tap. */
  getInitialData: () => Promise<Record<string, unknown> | undefined>;
  /** Calls onTap with the data of every tapped notification; returns an unsubscribe function. */
  subscribe: (onTap: (data: Record<string, unknown> | undefined) => void) => () => void;
};

export type Navigate = (name: NotificationRoute["name"], params: NotificationRoute["params"]) => void;

export function useNotificationNavigation(source: NotificationSource, navigate: Navigate) {
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    let active = true;
    const open = (data: Record<string, unknown> | undefined) => {
      const route = routeForNotification(data);
      if (active && route) navigateRef.current(route.name, route.params);
    };

    source.getInitialData().then(open, () => undefined);
    const unsubscribe = source.subscribe(open);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [source]);
}

/** Registers the device token once per sign-in. */
export function usePushRegistration(signedIn: boolean, register: () => Promise<PushRegistrationResult>) {
  const [status, setStatus] = useState<PushRegistrationResult>();
  const registerRef = useRef(register);
  registerRef.current = register;

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    registerRef.current().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, [signedIn]);

  return signedIn ? status : undefined;
}
