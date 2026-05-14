import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Red Team AI Agent",
  description:
    "AI copilot for authorized reconnaissance, OSINT, internal pentesting methodology, and reporting.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
