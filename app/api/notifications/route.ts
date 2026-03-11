import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export async function POST(request: Request) {
  try {
    const { userId, postBody } = await request.json();

    const supabase = createClient();

    const { data: user } = await supabase
      .from("users")
      .select("auth_id")
      .eq("id", userId)
      .single();

    if (!user?.auth_id || !ONESIGNAL_APP_ID) {
      return NextResponse.json({ success: false });
    }

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
        url:
          process.env.NEXT_PUBLIC_SITE_URL || "https://socialthing.com/posts",
      }),
    });

    const data = await response.json();

    console.log("data", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ success: false, error });
  }
}
