"use client";

import { BrandIcon } from "@/components/contact/brand-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface ContactBoxProps {
  onEmailClick: () => void;
  onClose: () => void;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

const WHATSAPP_HREF = `https://wa.me/541178876189?text=${encodeURIComponent(
  "Hey, I've seen your portfolio, how are you?",
)}`;
const INSTAGRAM_HREF = "https://www.instagram.com/fedeostan/";
const LINKEDIN_HREF = "https://www.linkedin.com/feed/";

export function ContactBox({
  onEmailClick,
  onClose,
  hovered,
  onHoverChange,
}: ContactBoxProps) {
  return (
    <div
      className={cn(
        "bg-background border-border flex w-full max-w-[342px] flex-col gap-6 overflow-clip rounded-[26px] border p-3 shadow-lg",
      )}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      data-hovered={hovered}
    >
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact options"
          className="text-foreground hover:bg-secondary inline-flex items-center justify-center rounded-[10px] p-[10px] transition-colors"
        >
          <Icon name="X" size={24} />
        </button>
      </div>

      <ChannelRow
        as="button"
        onClick={onEmailClick}
        iconName="Mail"
        label="Email"
        emphasized
      />
      <ChannelRow
        as="a"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        iconName="MessageCircle"
        label="WhatsApp"
      />
      <ChannelRow
        as="a"
        href={LINKEDIN_HREF}
        target="_blank"
        rel="noopener noreferrer"
        brandIcon="linkedin"
        label="LinkedIn"
      />
      <ChannelRow
        as="a"
        href={INSTAGRAM_HREF}
        target="_blank"
        rel="noopener noreferrer"
        brandIcon="instagram"
        label="Instagram"
      />
    </div>
  );
}

type RowIconProps =
  | { iconName: "Mail" | "MessageCircle"; brandIcon?: never }
  | { iconName?: never; brandIcon: "linkedin" | "instagram" };

type ChannelRowProps = RowIconProps & {
  label: string;
  emphasized?: boolean;
} & (
    | { as: "button"; onClick: () => void }
    | {
        as: "a";
        href: string;
        target?: string;
        rel?: string;
      }
  );

function ChannelRow(props: ChannelRowProps) {
  const className = cn(
    "flex w-full items-center gap-[10px] rounded-[10px] p-[10px] text-base leading-6 font-medium transition-colors",
    "text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground focus-visible:outline-none",
    props.emphasized && "hover:bg-secondary",
  );

  const iconNode = props.iconName ? (
    <Icon name={props.iconName} size={24} />
  ) : (
    <BrandIcon name={props.brandIcon} size={24} />
  );

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={className}
      >
        {iconNode}
        <span>{props.label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={className}>
      {iconNode}
      <span>{props.label}</span>
    </button>
  );
}
