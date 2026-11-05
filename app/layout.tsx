import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import CursorGlow from "@/components/CursorGlow";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FutureWorks",
  description:
    "Haqiqiy muammolarni toping, jamoa yig’ing va yechimni birga yarating.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${unbounded.variable} ${manrope.variable}`}>
      <body>
        <CursorGlow />
        <Sidebar />
        <div className="lg:pl-64">
          <TopBar />
          <div className="pb-24 lg:pb-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
