import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness Prescription Engine",
  description: "Personalized, science-based supplement recommendations using deterministic clinical decision logic",
  keywords: ["wellness", "supplements", "health", "prescription", "personalized"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

