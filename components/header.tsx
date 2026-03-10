"use client";

import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./ui/button";

export default function Header(props: {
  title: string;
  slotRight?: ReactNode;
  showBackButton?: boolean;
}) {
  function handleBack() {
    window.history.back();
  }
  return (
    <header className="h-15 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          {props.showBackButton && (
            <Button size="icon-sm" variant="secondary" onClick={handleBack}>
              <ChevronLeft />
            </Button>
          )}
          <h1 className="font-semibold text-xl">{props.title}</h1>
        </div>
        {props.slotRight}
      </div>
    </header>
  );
}
