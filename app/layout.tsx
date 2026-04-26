import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: {
    default: "Nitya Naman",
    template: "%s | Nitya Naman",
  },
  description: "Creative developer blending code, design, and chaos through web projects, games, and music.",
  metadataBase: new URL("https://ciderboi.xyz"),
  applicationName: "Nitya Naman",
  category: "portfolio",
  authors: [{ name: "Nitya Naman", url: "https://ciderboi.xyz" }],
  creator: "Nitya Naman",
  publisher: "Nitya Naman",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Nitya Naman",
    description: "Creative developer blending code, design, and chaos through web projects, games, and music.",
    url: "https://ciderboi.xyz",
    siteName: "Nitya Naman",
    type: "profile",
    locale: "en-US",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/home.png",
        width: 1200,
        height: 630,
        alt: "Nitya Naman - Creative Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nitya Naman",
    description: "Creative developer blending code, design, and chaos through web projects, games, and music.",
    creator: "@ciderboi123",
    images: [
      {
        url: "https://ciderboi.xyz/pictures/embed/home.png",
        width: 1200,
        height: 630,
        alt: "Nitya Naman - Creative Developer",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
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
        <NetworkProvider>
          <main>{children}</main>
        </NetworkProvider>
        <BackgroundPicture brightness={0.8} />

        <div className="absolute bottom-0 w-full text-center py-4 text-gray-400 opacity-50 text-sm z-50">
          &copy; {new Date().getFullYear()} Nitya Naman. All rights reserved.
        </div>
      </body>
    </html>
  );
}
