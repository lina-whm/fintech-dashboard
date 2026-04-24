import "./globals.css";
import { Providers } from "./providers";
import { Geist } from "next/font/google";
import { cn } from "@/shared/lib/cn";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = { title: "FinTech Dashboard", description: "Portfolio fintech dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}