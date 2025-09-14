import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NetworkProvider } from "@/components/context/Network";
import { BackgroundPicture } from "@/components/BackgroundPicture";

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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Nitya Naman",
              alternateName: "Cider Boi",
              url: "https://ciderboi.xyz",
              image: "https://ciderboi.xyz/pictures/embed/home.png",
              sameAs: [
                "https://twitter.com/ciderboi123",
                "https://instagram.com/nnthegamer",
                "https://github.com/namanyt",
                "https://linkedin.com/in/nityanaman",
              ],
              jobTitle: "Creative Developer",
              description:
                "Creative developer blending code, design, and chaos through web projects, games, and music.",
              knowsAbout: [
                "JavaScript",
                "TypeScript",
                "React",
                "Next.js",
                "Web Development",
                "Game Development",
                "Digital Art",
                "Design",
                "Storytelling",
                "Creative Coding",
              ],
              alumniOf: {
                "@type": "EducationalOrganization",
                name: "Delhi Public School, Jaipur",
              },
            }),
          }}
        />
        {/* Immediately force dark on first paint to avoid flash and override stored/system theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');
try{localStorage.setItem('theme','dark')}catch(e){};
document.documentElement.style.colorScheme='dark';`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NetworkProvider>
            <main>{children}</main>
          </NetworkProvider>
          <BackgroundPicture brightness={0.8} />

          <div className="absolute bottom-0 w-full text-center py-4 text-gray-400 opacity-50 text-sm z-[50]">
            &copy; {new Date().getFullYear()} Nitya Naman. All rights reserved.
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
