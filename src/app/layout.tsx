import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const interHeading = Inter({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecapAI - AI Action Items Extractor",
  description: "Paste or upload meeting transcripts and let AI extract structured action items instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${interHeading.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 font-sans relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* Wallpaper Background Picture Layers (Clean Opacity Transition) */}
          <div 
            className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center md:bg-right opacity-25 dark:opacity-0 transition-opacity duration-300"
            style={{ backgroundImage: "url('/bg-light-meeting.png')" }}
          />
          <div 
            className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center md:bg-right opacity-0 dark:opacity-35 transition-opacity duration-300"
            style={{ backgroundImage: "url('/bg-dark-meeting.png')" }}
          />
          {/* Soft gradient vignette overlay to ensure text contrast and legibility */}
          <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b md:bg-gradient-to-r from-background via-background/90 to-background/50" />

          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
          <Toaster closeButton richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
