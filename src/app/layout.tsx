import type { Metadata } from "next";
import { Sora, Public_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-publicsans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIYAMA — The Agentic Compliance Operating System",
  description:
    "NIYAMA compiles SEBI circulars into a clause-linked Obligation Graph and deterministic Rules-as-Code — with mandatory officer sign-off, evidence auto-binding and an immutable audit trail. From regulatory text to regulatory certainty. SEBI × Kellton.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
