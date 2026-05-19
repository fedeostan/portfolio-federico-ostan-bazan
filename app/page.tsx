import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroChat } from "@/components/hero/HeroChat";
import { SectionShell } from "@/components/motion/SectionShell";

export default function Home() {
  return (
    <SectionShell id="hero">
      <HeroBackground />
      <HeroChat />
    </SectionShell>
  );
}
