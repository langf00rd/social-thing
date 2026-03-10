"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Balancer from "react-wrap-balancer";

type Post = {
  id: number;
  body: string;
  theme: string;
  created_at: string;
};

type Reply = {
  id: number;
  body: string;
  created_at: string;
};

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
        .select("*")
        .eq("id", params.id)
        .single();

      if (postData) {
        setPost(postData);

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
    if (!replyText.trim() || sending) return;

    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.from("replies").insert({
      post: post?.id,
      body: replyText,
    });

    if (!error) {
      const { data } = await supabase
        .from("replies")
        .select("*")
        .eq("post", post?.id)
        .order("created_at", { ascending: false });
      if (data) setReplies(data);
      setReplyText("");
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
    <div className="overflow-y-scroll h-full">
      <div className="max-w-lg mx-auto py-20">
        <h2 className="text-[1.5rem] md:text-3xl max-w-100">
          <Balancer>{post.body}</Balancer>
        </h2>
      </div>

      <div className="max-w-lg mx-auto pb-32 space-y-4">
        {replies.length === 0 ? (
          <p className="text-center text-neutral-400">No replies yet</p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className="flex-col gap-2 border justify-between flex border-neutral-200/60 cursor-pointer shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl"
            >
              <p className="text-neutral-700">{reply.body}</p>
              <p className="text-xs text-neutral-400 mt-2">
                {new Date(reply.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="fixed w-screen bottom-0 left-0 flex items-center justify-center">
        <div className="w-full bg-white h-full max-w-225">
          <div className="flex p-5 gap-2">
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
