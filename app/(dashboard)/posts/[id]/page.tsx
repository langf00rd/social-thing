"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  body: string;
  theme: string;
  created_at: string;
};

export default function Page() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setPost(data);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!post || deleting) return;

    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (!error) router.push("/posts");

    setDeleting(false);
  };

  if (loading) return <Header showBackButton slotRight={<Spinner />} />;

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
      <div className="mt-8 flex justify-center">
        <div
          style={{ backgroundColor: post.theme }}
          className="p-10 max-w-150 h-100 w-full md:p-18 shadow-[0px_0px_512px_#bcbcbc5c]"
        >
          <div className="shadow-[0_0_20px_0px_#33333363] h-full rounded-2xl overflow-clip">
            <div className="w-full h-full bg-white flex items-center justify-center">
              <p className="h-[50%] font-medium px-8 text-center w-full p-4 md:text-3xl leading-normal">
                {post.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
