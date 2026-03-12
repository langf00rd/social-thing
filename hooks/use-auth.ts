"use client";

import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { User } from "@/lib/types";



const USER_COOKIE = "user_data";

export function getStoredUser(): User | null {
  const stored = Cookies.get(USER_COOKIE);
  return stored ? JSON.parse(stored) : null;
}

function setStoredUser(user: User | null) {
  if (user) {
    Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 7 });
  } else {
    Cookies.remove(USER_COOKIE);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      setStoredUser(null);
      setUser(null);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("id, auth_id, email, first_name, last_name, photo_url, latitude, longitude, city, country")
      .eq("email", authUser.email)
      .single();

    if (data) {
      const userData: User = {
        id: data.id,
        auth_id: data.auth_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        photo_url: data.photo_url,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
      };
      setStoredUser(userData);
      setUser(userData);
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setStoredUser(null);
    setUser(null);
    router.push("/sign-in");
  };

  return { user, loading, fetchUser, signOut };
}
