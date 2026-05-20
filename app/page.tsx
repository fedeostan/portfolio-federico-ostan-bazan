import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroChat } from "@/components/hero/HeroChat";
import { HomeScrollSnap } from "@/components/home/HomeScrollSnap";
import { SectionShell } from "@/components/motion/SectionShell";
import { SectionAI } from "@/components/sections/SectionAI";
import { SectionContact } from "@/components/sections/SectionContact";
import { SectionDesktop } from "@/components/sections/SectionDesktop";
import { SectionMobile } from "@/components/sections/SectionMobile";
import { SectionPersonal } from "@/components/sections/SectionPersonal";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HomeScrollSnap>
      <SectionShell id="hero" aria-label="Hero">
        <HeroBackground />
        <HeroChat />
      </SectionShell>
      <SectionAI id="section-ai" />
      <SectionMobile id="section-mobile" />
      <SectionDesktop id="section-desktop" />
      <SectionPersonal id="section-personal" />
      <SectionContact id="section-contact" />
    </HomeScrollSnap>
  );
}
