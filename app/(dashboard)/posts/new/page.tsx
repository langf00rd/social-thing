"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { TEMPLATE_QUESTIONS } from "@/lib/content";
import { toPng } from "html-to-image";
import { CheckIcon, Download } from "lucide-react";
import { useRef, useState } from "react";
import Balancer from "react-wrap-balancer";

export default function Page() {
  return (
    <div className="relative h-screen">
      <Header
        showBackButton
        title="New post"
        slotRight={
          <div className="flex gap-2">
            <Button disabled>Publish</Button>
            <Button variant="secondary">
              <Download className="text-neutral-400" />
              Download
            </Button>
          </div>
        }
      />
      <CardView />
      <div className="w-full py-4 space-y-2 absolute bottom-0">
        <h2 className="text-sm font-medium text-neutral-600">
          Questions you can ask
        </h2>
        <div className="flex-col md:flex-row flex gap-2 md:gap-4">
          {TEMPLATE_QUESTIONS.map((a, index) => (
            <div
              key={index}
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

function CardView() {
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
    <div className="space-y-4">
      <div className="mt-32 w-full flex items-center justify-center">
        <div
          ref={cardRef}
          style={{ backgroundColor: color }}
          className="p-10 max-w-150 h-100 w-full md:p-18 shadow-[0px_0px_512px_#bcbcbc5c]"
        >
          <div className="shadow-[0_0_20px_0px_#33333363] h-full rounded-2xl overflow-clip">
            <div className="w-full h-full bg-white flex items-center justify-center">
              <textarea
                placeholder="Type here..."
                className="h-[50%] font-medium px-8 text-center outline-0 w-full p-4 md:text-3xl leading-normal resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-wrap mx-auto w-fit rounded-sm md:rounded-full flex p-1 md:shadow-[0px_0px_512px_#bcbcbc5c] md:border gap-2">
        {[
          "#F26721",
          "#098BF6",
          "#3F9772",
          "#A19797",
          "#262626",
          "#FED43E",
          "#5C5AED",
          "#FFADE4",
          "#944A00",
          "#BD0F2C",
          "#FC4FB7",
          "#D4D4D4",
          "#67B2F9",
          "#D54FF3",
        ].map((a) => (
          <div key={a} className="relative">
            {color === a && (
              <CheckIcon className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full size-4 p-0.5 shadow-3xl border" />
            )}
            <div
              role="button"
              onClick={() => setColor(a)}
              className={`size-8 transition-colors rounded-full cursor-pointer hover:opacity-75 border-2 ${color === a ? "border-[#00000012]" : "border-transparent"}`}
              style={{
                backgroundColor: a,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
