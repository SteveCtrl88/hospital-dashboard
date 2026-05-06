import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "US Hospital Intelligence",
  description: "US hospitals by bed size and IDN groups",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
