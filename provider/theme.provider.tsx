"use client";
import dynamic from "next/dynamic";
import { memo } from "react";
import { siteConfig } from "@/config/site";

const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  }
);
import { type ThemeProviderProps } from "next-themes/dist/types";

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <div
      style={
        {
          "--radius": `${siteConfig.radius}rem`,
        } as React.CSSProperties
      }
      className="min-h-screen"
    >
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </div>
  );
}

export default memo(ThemeProvider);
