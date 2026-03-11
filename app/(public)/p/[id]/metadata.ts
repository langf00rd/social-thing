import { createClient } from "@/lib/supabase";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, body, theme")
    .eq("id", id)
    .single();

  return {
    title: post?.body || "social thing",
    description: "Ask questions, chat, make friends",
    openGraph: {
      title: post?.body || "social thing",
      description: "Ask questions, chat, make friends",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post?.body || "social thing",
      description: "Ask questions, chat, make friends",
    },
  };
}
