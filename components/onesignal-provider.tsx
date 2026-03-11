"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

declare global {
  interface Window {
    OneSignal: any;
  }
}

export function OneSignalProvider() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.auth_id) return;

    const initOneSignal = async () => {
      if (window.OneSignal) {
        await window.OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
        });

        await window.OneSignal.setExternalUserId(user.auth_id);
      }
    };

    // Initialize OneSignal array if not already done
    window.OneSignal = window.OneSignal || [];

    // Load OneSignal SDK
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
    script.async = true;
    script.onload = initOneSignal;
    document.head.appendChild(script);

    return () => {
      if (window.OneSignal) {
        window.OneSignal.slideHook = null;
      }
    };
  }, [user?.auth_id]);

  return null;
}
