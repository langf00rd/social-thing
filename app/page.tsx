"use client";

import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { CheckIcon } from "lucide-react";
import { useRef, useState } from "react";

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
    <div className="flex items-center px-4 bg-white max-w-[900px] h-screen mx-auto flex-col py-32 gap-8">
      <div className="max-w-150 w-full justify-end flex">
        <Button onClick={handleDownload}>Download</Button>
      </div>
      <div
        ref={cardRef}
        style={{ backgroundColor: color }}
        className="p-10 max-w-150 h-100 w-full md:p-18 shadow-[0px_0px_512px_#bcbcbc5c]"
      >
        <div className="shadow-[0_0_20px_0px_#33333363] h-full border rounded-2xl overflow-clip">
          <div className="w-full h-full bg-white flex items-center justify-center">
            <textarea
              placeholder="Type here..."
              className="h-[50%] font-medium px-8 text-center outline-0 w-full p-4 md:text-3xl leading-normal resize-none"
            ></textarea>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-white flex-wrap rounded-sm md:rounded-full flex p-1 shadow-[0px_0px_512px_#bcbcbc5c] border gap-2">
          {[
            "#944A00",
            "#262626",
            "#5C5AED",
            "#FFADE4",
            "#F26721",
            "#FED43E",
            "#3F9772",
            "#098BF6",
            "#BD0F2C",
            "#FC4FB7",
            "#67B2F9",
            "#D54FF3",
            "#A19797",
            "#D4D4D4",
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
    </div>
  );
}
