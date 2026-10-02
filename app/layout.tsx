import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "HumanLayer — Understand AI-made work",
    template: "%s · HumanLayer",
  },
  description:
    "AI can create. Humans still need to understand. Explore inferred creation logic, evidence, and readable reconstruction in an honest product-shell prototype.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
