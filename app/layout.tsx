import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soak N Wet | Bulk Water Delivery Ottawa - Same-Day Pool, Well & Construction",
  description:
    "Ottawa's bulk water delivery company. Pool fills, hot tubs, rural wells, and construction sites. Same-day and next-day delivery available. Call (613) 762-5464.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

