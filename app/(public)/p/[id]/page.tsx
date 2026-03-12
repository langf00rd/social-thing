"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getStoredUser } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase";
import { Post, Reply } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Balancer from "react-wrap-balancer";

export default function Page() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const { data: postData } = await supabase
        .from("posts")
        .select("id, body, theme, slug, created_at, user")
        .eq("id", params.id)
        .single();

      if (postData) {
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, photo_url, id")
          .eq("id", postData.user)
          .single();

        const postWithUser = {
          ...postData,
          user: userData || null,
        };

        setPost(postWithUser);

        const { data: repliesData } = await supabase
          .from("replies")
          .select("*")
          .eq("post", postData.id)
          .order("created_at", { ascending: false });

        if (repliesData) setReplies(repliesData);
      }
      setLoading(false);
    };

    if (params.id) fetchPost();
  }, [params.id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending || !post?.id) return;

    setSending(true);
    const supabase = createClient();
    const user = getStoredUser();

    const replyData: { post: number; body: string; user?: number } = {
      post: post.id,
      body: replyText,
    };

    if (user?.id) {
      replyData.user = user.id;
    }

    const { error } = await supabase.from("replies").insert(replyData);

    if (!error) {
      // Send push notification to post owner
      if (post?.user) {
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: post.user.id,
            postBody: post.body,
          }),
        });
      }

      const { data } = await supabase
        .from("replies")
        .select("*")
        .eq("post", post?.id)
        .order("created_at", { ascending: false });
      if (data) setReplies(data);
      setReplyText("");
    } else {
      alert("Error sending");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="py-20">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll bg-white space-y-8 fixed top-0 left-0 right-0 bottom-0 h-full">
      <div
        className="max-w-lg mx-auto p-4"
        style={{
          backgroundColor: post.theme + 10,
          color: post.theme,
        }}
      >
        <div className="flex items-center gap-2 pt-12 pb-4">
          {post.user?.photo_url && (
            <Avatar>
              <AvatarImage src={post.user.photo_url || ""} />
              <AvatarFallback>
                {post.user?.first_name?.[0] || "U"}
                {post.user?.last_name?.[0] || ""}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium text-neutral-600">
            From {post.user?.first_name}
          </span>
        </div>
        <h2 className="text-xl max-w-100">
          <Balancer>{post.body}</Balancer>
        </h2>
      </div>

      <div className="max-w-lg mx-auto pb-32 space-y-4 md:px-0 px-5">
        <h3 className="font-medium text-lg">Replies ({replies.length})</h3>
        {replies.length === 0 ? (
          <p className="text-center text-neutral-400 text-sm">
            Be the first to reply
          </p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className="flex-col gap-2 border justify-between flex border-neutral-200/60 cursor-pointer shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl"
            >
              <p className="text-neutral-700">{reply.body}</p>
              <p className="text-xs text-neutral-400 mt-2">
                {new Date(reply.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="fixed w-screen bottom-0 left-0 flex items-center justify-center">
        <div className="w-full bg-white h-full max-w-lg">
          <div className="flex p-5 py-2 gap-2">
            <Input
              className="bg-neutral-200/60 rounded-full border-none"
              placeholder="Type message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            />
            <Button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
            >
              {sending ? "Sending..." : "Send"}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
