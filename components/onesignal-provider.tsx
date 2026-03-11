"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/hooks/use-auth";

export function OneSignalProvider() {
  const { user } = useAuth();

  useEffect(() => {
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      });

      if (user?.auth_id) {
        await OneSignal.login(user.auth_id);
      }
    };

    initOneSignal();
  }, [user?.auth_id]);

  return null;
}
