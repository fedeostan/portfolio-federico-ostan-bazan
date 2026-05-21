import Image from "next/image";

import { LetsTalkAnimation } from "@/components/contact/LetsTalkAnimation";
import { SectionShell } from "@/components/motion/SectionShell";

type SectionContactProps = {
  id?: string;
};

export function SectionContact({ id = "section-contact" }: SectionContactProps) {
  return (
    <SectionShell id={id} className="bg-background px-6">
      <LetsTalkAnimation
        portrait={<ContactPortrait />}
        idleText={<WhoIAmCopy />}
      />
    </SectionShell>
  );
}

function WhoIAmCopy() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-foreground text-2xl leading-8 font-semibold">
        Who I am
      </h2>
      <div className="text-muted-foreground flex flex-col gap-6 text-base leading-6 font-medium">
        <p>
          I consider myself a builder. I leave the tag creator for the artsy.
          Ideas are great, but bringing them to life… that&apos;s what
          it&apos;s all about.
        </p>
        <p>
          Wanna know more?{" "}
          <button
            type="button"
            data-lets-talk
            className="text-foreground cursor-pointer font-bold underline underline-offset-2"
          >
            Let&apos;s talk
          </button>
        </p>
      </div>
    </div>
  );
}

function ContactPortrait() {
  return (
    <Image
      src="/contact-portrait.png"
      alt="Portrait of Federico"
      width={473}
      height={524}
      className="bg-muted h-[524px] w-[473px] rounded-[26px] object-cover"
      sizes="473px"
    />
  );
}
