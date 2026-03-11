import { createClient } from "@/lib/supabase";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export async function sendPushNotification(userId: number, postBody: string) {
  const supabase = createClient();

  const { data: user } = await supabase
    .from("users")
    .select("auth_id")
    .eq("id", userId)
    .single();

  if (!user?.auth_id) return;

  const response = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [user.auth_id],
      headings: {
        en: "New Reply",
      },
      contents: {
        en: `Someone replied to: "${postBody.slice(0, 50)}${postBody.length > 50 ? "..." : ""}"`,
      },
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts`,
    }),
  });

  return response.json();
}
