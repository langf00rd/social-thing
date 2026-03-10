"use client";

import { createClient } from "@/lib/supabase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const USER_COOKIE = "user_data";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userCookie = Cookies.get(USER_COOKIE);

      if (!userCookie) {
        router.push("/sign-in");
        return;
      }

      try {
        const user = JSON.parse(userCookie);

        if (!user?.email) {
          router.push("/sign-in");
          return;
        }

        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          Cookies.remove(USER_COOKIE);
          router.push("/sign-in");
        }
      } catch {
        Cookies.remove(USER_COOKIE);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);
}

export function clearUserCookie() {
  Cookies.remove(USER_COOKIE);
}
