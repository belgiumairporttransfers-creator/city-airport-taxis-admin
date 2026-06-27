"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeColumnProps {
  label: string;
  values: number[];
  selected: number | null;
  onSelect: (val: number) => void;
}

export default function TimeColumn({
  label,
  values,
  selected,
  onSelect,
}: TimeColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected !== null && ref.current) {
      const selectedElement = ref.current.children[
        values.indexOf(selected)
      ] as HTMLElement;
      if (selectedElement) {
        ref.current.scrollTo({
          top: selectedElement.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [selected, values]);

  const scroll = (dir: "up" | "down") => {
    if (!ref.current) return;

    const amount = 40;
    ref.current.scrollBy({
      top: dir === "up" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-center text-xs font-medium text-default-500">
        {label}
      </label>

      <div className="relative overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => scroll("up")}
          className="flex w-full cursor-pointer justify-center border-b border-border py-1.5 transition hover:bg-primary/10"
        >
          <ChevronUp size={14} className="text-default-400" />
        </button>

        <div
          ref={ref}
          className="relative max-h-40 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {values.map((val) => {
            const isSelected = selected === val;

            return (
              <button
                key={val}
                type="button"
                onClick={() => onSelect(val)}
                className={cn(
                  "w-full cursor-pointer border-b border-border py-2 text-sm font-bold transition last:border-b-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-default-700 hover:bg-primary/10"
                )}
              >
                {val.toString().padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("down")}
          className="flex w-full cursor-pointer justify-center border-t border-border py-1.5 transition hover:bg-primary/10"
        >
          <ChevronDown size={14} className="text-default-400" />
        </button>
      </div>
    </div>
  );
}
