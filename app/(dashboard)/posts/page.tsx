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
import { Post } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// type Post = {
//   id: number;
//   body: string;
//   theme: string;
//   created_at: string;
//   reply_count?: number;
//   user: number;
//   user?: {
//     first_name: string;
//     last_name: string;
//     photo_url: string;
//     city?: string;
//     country?: string;
//     latitude?: number;
//     longitude?: number;
//   };
// };

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Page() {
  useRequireAuth();
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('posts', posts)

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.id) return;

      const supabase = createClient();

      let nearbyUserIds: number[] = [];
      const userLocations: Map<number, { lat: number; lng: number }> = new Map();

      if (user.latitude && user.longitude) {
        const { data: allUsers } = await supabase
          .from("users")
          .select("id, latitude, longitude, city, country")
          .neq("id", user.id)
          .not("latitude", "is", null);

        if (allUsers) {
          allUsers.forEach((u) => {
            if (u.latitude && u.longitude) {
              userLocations.set(u.id, { lat: u.latitude, lng: u.longitude });
            }
          });

          nearbyUserIds = allUsers
            .filter((u) => {
              const location = userLocations.get(u.id);
              if (!location) return false;
              const distance = calculateDistance(
                user.latitude!,
                user.longitude!,
                location.lat,
                location.lng
              );
              return distance <= 20;
            })
            .map((u) => u.id);
        }
      }

      let query = supabase
        .from("posts")
        .select("*, user:users(id, first_name, last_name, photo_url, city, country, latitude, longitude)");

      if (nearbyUserIds.length > 0) {
        query = query.in("user", nearbyUserIds);
      } else if (!user.latitude || !user.longitude) {
        query = query.neq("user", user.id);
      } else {
        query = query.eq("id", 0);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

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
  }, [user?.id, user?.latitude, user?.longitude]);

  return (
    <div>
      <Header
        title="Posts"
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
                <Link href="/posts/me">
                  <Button variant='link'>
                    My posts
                  </Button>
                </Link>
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
            No posts at this time
          </p>
          <Link href="/posts/new">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-2 md:gap-4 md:grid-cols-2">
          {posts.map((post) => {
            const distance = user?.latitude && user?.longitude && post.user?.latitude && post.user?.longitude
              ? calculateDistance(user.latitude, user.longitude, post.user.latitude, post.user.longitude)
              : null;
            return (
              <Link key={post.id} href={`/p/${post.id}`} className="h-full">
                <div className="flex-col h-full gap-6 border justify-between flex border-neutral-200/60 cursor-pointer md:hover:-rotate-3 transition-transform shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.user?.photo_url || ""} />
                      <AvatarFallback>
                        {post.user?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{post.user?.first_name}</span>
                      {distance !== null && (
                        <span className="text-xs text-neutral-400">
                          {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
                        </span>
                      )}
                    </div>
                  </div>
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
                      {(post as unknown as { reply_count: number }).reply_count}{" "}
                      {(post as unknown as { reply_count: number }).reply_count === 1 ? "reply" : "replies"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
