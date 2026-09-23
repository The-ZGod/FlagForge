import { MagneticText } from "@/components/ui/morphing-cursor";

export default function Page() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-16 p-8">
      <p className="text-muted-foreground text-xs tracking-[0.25em] uppercase">Hover to interact</p>

      <div className="flex flex-col items-center gap-8">
        <MagneticText text="CREATE" hoverText="ELEVATE" />
        <MagneticText text="VISION" hoverText="DESIGN" />
      </div>
    </main>
  );
}
