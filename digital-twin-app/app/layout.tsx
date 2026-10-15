import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/navigation/TopHeader";
import ConnectionFooter from "@/components/navigation/ConnectionFooter";
import { DigitalTwinProvider } from "@/context/DigitalTwinContext";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Happiest Health · Digital Twin — Glucose Spike Prediction",
  description:
    "AI-powered patient digital twin for Type 2 Diabetes: dual-stream EHR + wearable data predicts blood glucose spikes 2 hours in advance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const t=localStorage.getItem("dt-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.dataset.theme="dark";}else{document.documentElement.dataset.theme="light";}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text font-sans antialiased">
        <DigitalTwinProvider>
          <TopHeader />
          <div className="mx-auto flex w-full max-w-[1760px] flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="min-w-0 flex-1 px-4 pt-6 pb-4 sm:px-6 lg:px-8 xl:px-10 bio-grid">
                {children}
              </main>
              <footer className="border-t border-line/40 px-6 py-2.5 text-center text-[11px] font-medium text-text/40 shrink-0">
                © 2026 Happiest Health Digital Twin · Built for the Digital Twin Challenge 2026 · Synthetic data only — DPDP & HIPAA compliant
              </footer>
            </div>
          </div>
          <ConnectionFooter />
        </DigitalTwinProvider>
      </body>
    </html>
  );
}

