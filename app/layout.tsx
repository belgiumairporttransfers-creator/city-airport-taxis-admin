import "./globals.css";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import "flatpickr/dist/flatpickr.min.css";
import { getSeoMeta } from "@/lib/get-seo-meta";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import ThemeProvider from "@/provider/theme.provider";
import MountedProvider from "@/provider/mounted.provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = getSeoMeta({
  title: "Dash Tail",
  description:
    "Dash Tail is a modern and responsive dashboard template built with Next.js and Tailwind CSS.",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground text-sm min-h-screen",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
          disableTransitionOnChange
        >
          <MountedProvider>
            <TanstackProvider>{children}</TanstackProvider>
          </MountedProvider>
          <ReactToaster />
          <Toaster />
          <SonnToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
