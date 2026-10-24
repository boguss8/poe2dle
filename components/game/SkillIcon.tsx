import Image from "next/image";

type SkillIconProps = {
  icon: string;
  name: string;
  size: number;
  className?: string;
};

/** Gem icon in an inventory-slot frame, from the local mirror (`pnpm download-icons`). */
export default function SkillIcon({
  icon,
  name,
  size,
  className = "",
}: SkillIconProps) {
  return (
    <Image
      src={`/icons/poe2/${icon}`}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className={`slot shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
