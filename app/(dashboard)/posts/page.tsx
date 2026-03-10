import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { TEMPLATE_QUESTIONS } from "@/lib/content";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";

export default function Page() {
  return (
    <div>
      <Header
        title="My posts"
        slotRight={
          <Link href="/posts/new" className="block">
            <Button>
              <PlusIcon />
              New post
            </Button>
          </Link>
        }
      />
      <ul className="grid gap-2 md:gap-4 md:grid-cols-3">
        {[
          ...TEMPLATE_QUESTIONS,
          ...TEMPLATE_QUESTIONS,
          ...TEMPLATE_QUESTIONS,
        ].map((a, index) => (
          <div
            key={index}
            className="flex-col gap-6 border justify-between flex border-neutral-200/60 cursor-pointer md:hover:-rotate-3 transition-transform shadow-[0_0_4px_3px_#f8f8f88f] p-3 rounded-xl"
          >
            <p className="text-neutral-600">
              <Balancer>{a}</Balancer>
            </p>

            <div className="text-neutral-400 font-mono text-sm">
              <p>30 replies</p>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}
