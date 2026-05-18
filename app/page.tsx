import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroSequence } from "@/components/hero/HeroSequence";
import { SectionShell } from "@/components/motion/SectionShell";

export default function Home() {
  return (
    <SectionShell id="hero">
      <HeroBackground />
      <HeroSequence />
    </SectionShell>
  );
}
