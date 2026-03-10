"use client";

import Header from "@/components/header";
import { PostView } from "@/components/post-view";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/lib/auth";
import { TEMPLATE_QUESTIONS } from "@/lib/content";
import { createClient } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Balancer from "react-wrap-balancer";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export default function Page() {
  useRequireAuth();
  const router = useRouter();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [theme, setTheme] = useState("#5C5AED");
  const [publishing, setPublishing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 6 });
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();
  };

  const handlePublish = async () => {
    if (!body.trim() || !user?.id || publishing) return;

    setPublishing(true);
    const supabase = createClient();
    const slug = generateSlug(body);

    const { error, data } = await supabase
      .from("posts")
      .insert({
        user: user.id,
        body,
        theme,
        subject: body.split(" ")[0] || null,
        slug,
      })
      .select();

    if (error) {
      console.error("Error publishing post:", error);
      setPublishing(false);
      return;
    }

    const result = data?.[0] as unknown as Post;

    router.push(`/posts/${result.id}`);
  };

  return (
    <div className="relative h-screen">
      <Header
        showBackButton
        title="New post"
        slotRight={
          <div className="flex gap-2">
            <Button
              onClick={handlePublish}
              disabled={!body.trim() || publishing}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
            <Button variant="secondary" onClick={handleDownload}>
              <Download className="text-neutral-400" />
              Download
            </Button>
          </div>
        }
      />
      <PostView
        body={body}
        setBody={setBody}
        theme={theme}
        setTheme={setTheme}
        cardRef={cardRef}
      />
      <div className="w-full py-4 space-y-2 absolute bottom-0">
        <h2 className="text-sm font-medium text-neutral-600">
          Questions you can ask
        </h2>
        <div className="flex-col md:flex-row flex gap-2 md:gap-4">
          {TEMPLATE_QUESTIONS.map((a, index) => (
            <div
              key={index}
              onClick={() => setBody(a)}
              className="border flex items-center border-neutral-200/60 cursor-pointer md:hover:-rotate-3 transition-transform shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl"
            >
              <p className="text-sm text-neutral-500">
                <Balancer>{a}</Balancer>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
