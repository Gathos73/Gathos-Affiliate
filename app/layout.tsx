import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Affiliate Dashboard · Gathos",
  description: "Manage referral links, conversions, and payouts.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#faf9f7", colorScheme: "light" };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
