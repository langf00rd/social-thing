"use client";

import Header from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  body: string;
  theme: string;
  created_at: string;
  reply_count?: number;
};

export default function Page() {
  useRequireAuth();
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.id) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const postsWithCounts = await Promise.all(
          data.map(async (post) => {
            const { count } = await supabase
              .from("replies")
              .select("*", { count: "exact", head: true })
              .eq("post", post.id);
            return { ...post, reply_count: count || 0 };
          }),
        );
        setPosts(postsWithCounts);
      }
      setLoading(false);
    };

    if (user?.id) {
      fetchPosts();
    }
  }, [user?.id]);

  return (
    <div>
      <Header
        title="My posts"
        slotRight={
          <div className="flex gap-2">
            <Link href="/posts/new" className="block">
              <Button>
                <PlusIcon />
                New post
              </Button>
            </Link>
            <Popover>
              <PopoverTrigger>
                <Avatar>
                  <AvatarImage src={user?.photo_url || ""} />
                  <AvatarFallback>
                    {user?.first_name?.[0] || "U"}
                    {user?.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="min-w-60">
                <PopoverHeader>
                  <PopoverTitle>
                    {user?.first_name} {user?.last_name}
                  </PopoverTitle>
                  <PopoverDescription>{user?.email}</PopoverDescription>
                </PopoverHeader>
                <Button variant="destructive" onClick={signOut}>
                  Sign out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        }
      />
      {loading ? (
        <Spinner className="mx-auto" />
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">
            You haven&apos;t created any posts yet.
          </p>
          <Link href="/posts/new">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-2 md:gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <div className="flex-col gap-6 border justify-between flex border-neutral-200/60 cursor-pointer md:hover:-rotate-3 transition-transform shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl">
                <p className="text-neutral-600">{post.body}</p>
                <div className="text-neutral-400 font-mono text-sm flex justify-between">
                  <p>
                    {new Date(post.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p>
                    {post.reply_count}{" "}
                    {post.reply_count === 1 ? "reply" : "replies"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
