import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase";

export const runtime = "edge";

export const alt = "social thing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient();
  
  const { data: post } = await supabase
    .from("posts")
    .select("id, body, theme, user")
    .eq("id", id)
    .single();

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "#5C5AED",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Post not found
        </div>
      ),
      { ...size }
    );
  }

  const { data: user } = await supabase
    .from("users")
    .select("first_name, last_name, photo_url")
    .eq("id", post.user)
    .single();

  const theme = post.theme || "#5C5AED";

  return new ImageResponse(
    (
      <div
        style={{
          background: theme,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 32,
            boxShadow: "0 0 40px rgba(0,0,0,0.2)",
            width: "100%",
            maxWidth: 900,
            height: "100%",
            maxHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: "#1a1a1a",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {post.body}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 32,
          }}
        >
          {user?.photo_url && (
            <img
              src={user.photo_url}
              alt=""
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
              }}
            />
          )}
          <span
            style={{
              fontSize: 24,
              color: "white",
              fontWeight: 500,
            }}
          >
            {user?.first_name} {user?.last_name}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
