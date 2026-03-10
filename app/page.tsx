"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

export default function Home() {
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
