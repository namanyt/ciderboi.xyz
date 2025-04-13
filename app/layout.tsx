import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import HorizontalLayout from "@/components/HorizontalScroll";
import { ScrollProvider } from "@/components/context/Scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nitya Naman",
  description: "A Website about Nitya Naman",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ScrollProvider>
            <HorizontalLayout>
              <main>{children}</main>
            </HorizontalLayout>
          </ScrollProvider>

          <div className="absolute bottom-0 w-full text-center py-4 text-gray-400 opacity-50 text-sm">
            &copy; {new Date().getFullYear()} Nitya Naman. All rights reserved.
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
