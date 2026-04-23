import "./globals.css";
import { Providers } from "./providers";

export const metadata = { title: "FinTech Dashboard", description: "Portfolio fintech dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}