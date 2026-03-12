"use client";

import { createClient } from "@/lib/supabase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const USER_COOKIE = "user_data";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("Error: Could not get user");
        return;
      }

      const email = user.email;
      const fullName = user.user_metadata?.full_name || "";
      const firstName = fullName.split(" ")[0] || "";
      const lastName = fullName.split(" ").slice(1).join(" ") || "";
      const photoUrl = user.user_metadata?.avatar_url || "";
      const authId = user.id;

      const { error: upsertError } = await supabase.from("users").upsert(
        {
          auth_id: authId,
          email,
          first_name: firstName,
          last_name: lastName,
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

      if (upsertError) {
        setStatus("Error: Could not save user");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id, auth_id, email, first_name, last_name, photo_url, latitude, longitude, city, country")
        .eq("email", email)
        .single();

      const hasLocation = userData?.latitude && userData?.longitude;

      if (userData) {
        Cookies.set(
          USER_COOKIE,
          JSON.stringify({
            id: userData.id,
            auth_id: userData.auth_id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            photo_url: userData.photo_url,
            latitude: userData.latitude,
            longitude: userData.longitude,
            city: userData.city,
            country: userData.country,
          }),
          { expires: 7 },
        );
      }

      setStatus("Success!");
      router.push(hasLocation ? "/posts" : "/location");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center">
      <p className="font-mono text-destructive text-sm">{status}</p>
    </div>
  );
}
