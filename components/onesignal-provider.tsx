"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/hooks/use-auth";

export function OneSignalProvider() {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    const initOneSignal = async () => {
      if (initialized.current) return;
      initialized.current = true;

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
        welcomeNotification: {
          message: "",
        },
      });

      // Show the permission prompt
      OneSignal.Notifications.requestPermission();

      if (user?.auth_id) {
        await OneSignal.login(user.auth_id);
      }
    };

    initOneSignal();
  }, [user?.auth_id]);

  return null;
}
