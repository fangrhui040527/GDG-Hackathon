import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ProgrammeStoreProvider } from "@/lib/store";
import { FormStoreProvider } from "@/lib/form-store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusAI — Ecosystem Management Platform",
  description:
    "AI-enabled ecosystem linkage management platform for managing programmes, events, and ecosystem relationships.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ProgrammeStoreProvider>
          <FormStoreProvider>{children}</FormStoreProvider>
        </ProgrammeStoreProvider>
      </body>
    </html>
  );
}
