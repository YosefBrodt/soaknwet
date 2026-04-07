import "./globals.css";
import type { Metadata } from "next";
import { WaterShaderBackground } from "@/components/ui/water-shader";

export const metadata: Metadata = {
  title: "Soak N Wet | Bulk Water Delivery Ottawa - Same-Day Pool, Well & Construction",
  description:
    "Ottawa's bulk water delivery company. Pool fills, hot tubs, rural wells, and construction sites. Same-day and next-day delivery available. Call (613) 762-5464.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 -z-10">
          <WaterShaderBackground />
          <div className="absolute inset-0 bg-[rgba(217,220,214,0.65)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,45,61,0.18)] via-transparent to-[rgba(22,66,91,0.12)]" />
        </div>

        {children}
      </body>
    </html>
  );
}

