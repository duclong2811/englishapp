import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Literata } from "next/font/google";
import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Vở tiếng Anh", template: "%s · Vở tiếng Anh" },
  description:
    "Học tiếng Anh mỗi ngày: bài học, từ vựng và luyện nói với AI.",
  appleWebApp: { capable: true, title: "Vở tiếng Anh", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#11152a" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-sheet focus:px-4 focus:py-2 focus:outline-2 focus:outline-accent"
        >
          Bỏ qua đến nội dung chính
        </a>
        <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_1fr]">
          <Suspense fallback={null}>
            <AppNav />
          </Suspense>
          <main
            id="main"
            className="pb-safe-tabbar mx-auto w-full max-w-6xl px-4 lg:mx-0 lg:max-w-7xl xl:px-16 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-12"
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
