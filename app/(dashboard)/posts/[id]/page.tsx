"use client";

import Header from "@/components/header";
import { PublicPostView } from "@/components/post-view";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Post, Reply } from "@/lib/types";
import { Copy, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  useRequireAuth();

  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:users (
            first_name,
            last_name,
            photo_url
          )
        `,
        )
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setPost(data);

        const { data: repliesData } = await supabase
          .from("replies")
          .select("*")
          .eq("post", data.id)
          .order("created_at", { ascending: false });

        if (repliesData) setReplies(repliesData);
      }
      setLoading(false);
    };

    if (params.id) fetchPost();
  }, [params.id]);

  const handleDelete = async () => {
    if (!post || deleting) return;

    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) router.push("/posts");

    setDeleting(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/p/${post?.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return <Header title="Post" showBackButton slotRight={<Spinner />} />;

  if (!post) return <Header title="Post not found" showBackButton />;

  return (
    <div className="h-full overflow-y-scroll">
      <Header
        title="Post"
        showBackButton
        slotRight={
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="text-destructive/30" />
            {deleting ? "Deleting..." : "Delete post"}
          </Button>
        }
      />
      <div className="my-10 flex justify-center">
        <PublicPostView post={post} />
      </div>
      <div className="flex flex-wrap items-center gap-4 justify-center w-full mb-8">
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="opacity-50" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>

      <div className="max-w-xl mx-auto pb-32 space-y-4">
        <h3 className="font-medium text-lg">Replies ({replies.length})</h3>
        {replies.length === 0 ? (
          <p className="text-center text-neutral-400">No replies yet</p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className="flex-col gap-2 border justify-between flex border-neutral-200/60 shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl"
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
    </div>
  );
}
