"use client";

import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import Link from "next/link";
import { useRef, useState } from "react";
import Balancer from "react-wrap-balancer";

export default function Home() {
  const [color, setColor] = useState("#5C5AED");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 6 });
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col gap-6">
      <h1 className="text-2xl md:text-5xl max-w-120 md:leading-14 text-center">
        <Balancer>Ask questions, chat, make friends</Balancer>
      </h1>
      <Link href="/posts">
        <Button size="lg">Get started for free</Button>
      </Link>
    </div>
  );
}
