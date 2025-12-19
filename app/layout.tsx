import "./globals.css";

export const metadata = {
  title: "Red Team AI Agent",
  description: "Advanced Cybersecurity Analysis Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
