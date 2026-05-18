import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroTitle } from "@/components/hero/HeroTitle";
import { SectionShell } from "@/components/motion/SectionShell";

export default function Home() {
  return (
    <SectionShell id="hero">
      <HeroBackground />
      <HeroTitle>I&rsquo;m Federico, welcome to my portfolio!</HeroTitle>
    </SectionShell>
  );
}
