"use client";

import Header from "@/components/header";
import { PublicPostView } from "@/components/post-view";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { toPng } from "html-to-image";
import { Copy, Share2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  useRequireAuth();

  const params = useParams();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();
      if (!error && data) setPost(data);
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 6 });
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();
  };

  if (loading)
    return <Header title="Post" showBackButton slotRight={<Spinner />} />;

  if (!post) return <Header title="Post not found" showBackButton />;

  return (
    <>
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
        <PublicPostView post={post} ref={cardRef} />
      </div>
      <div className="flex items-center gap-4 justify-center w-full">
        <Button variant="outline">
          <Share2 className="opacity-50" />
          Share
        </Button>
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="opacity-50" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Share2 className="opacity-50" />
          Download image
        </Button>
      </div>
    </>
  );
}
