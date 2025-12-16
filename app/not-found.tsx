// app/not-found.tsx
import type { Metadata } from "next";
import { BackgroundPicture } from "@/components/BackgroundPicture";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | Nitya Naman",
  description: "This page doesn't exist. Return to the portfolio homepage.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center text-white overflow-hidden px-4">
      {/* Darkened background with cracked glass overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80 z-0" />
      <div className="absolute inset-0 bg-[url('/cracked-glass.svg')] bg-cover opacity-25 pointer-events-none z-10" />

      {/* Red-tinted frosted glass panel */}
      <div className="relative z-20 backdrop-blur-md bg-red-500/10 border border-red-400/30 rounded-xl p-8 sm:p-12 shadow-[0_0_60px_rgba(255,0,0,0.2)] max-w-lg text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-lg text-red-200 mb-6">Looks like this page shattered into pieces.</p>
        <Link
          href="/"
          className="inline-block rounded-xl border border-red-300 px-6 py-2 text-white hover:bg-red-300 hover:text-black transition-all duration-300"
        >
          Back to safety
        </Link>
      </div>

      <span className="opacity-75">
        <BackgroundPicture brightness={0.8} />
      </span>
    </main>
  );
}
