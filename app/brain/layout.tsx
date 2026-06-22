import { MermaidHydrator } from "@/components/markdown/MermaidHydrator";

export default function BrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden">
      <div className="absolute z-[-2] inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.40))]" />
      <MermaidHydrator />
      {children}
    </div>
  );
}
