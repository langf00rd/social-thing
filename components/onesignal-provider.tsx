"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import OneSignal from "react-onesignal";

export function OneSignalProvider() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.auth_id) return;
    if (typeof window !== "undefined") {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      });
    }
  }, [user?.auth_id]);

  return null;
}
