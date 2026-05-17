import type { Metadata } from "next";
import { ProgrammeStoreProvider } from "@/lib/store";
import { FormStoreProvider } from "@/lib/form-store";
import ChatBubble from "@/components/chat-bubble";
import "./globals.css";

export const metadata: Metadata = {
  title: "YokoYoko AI — Ecosystem Management Platform",
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
      <body className="font-sans" suppressHydrationWarning>
        <ProgrammeStoreProvider>
          <FormStoreProvider>
            {children}
            <ChatBubble />
          </FormStoreProvider>
        </ProgrammeStoreProvider>
      </body>
    </html>
  );
}
