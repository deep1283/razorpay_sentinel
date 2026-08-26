import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abuse-Ring Sentinel",
  description: "Explainable promotion-abuse intelligence for merchant investigators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
