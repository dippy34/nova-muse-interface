import { cn } from "@/lib/utils";

interface SkullLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

export function SkullLogo({ className, size = "md" }: SkullLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizes[size], "text-primary animate-flicker", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Skull outline */}
      <path
        d="M50 10C30 10 15 28 15 50C15 65 22 75 22 82V90H40V82H60V90H78V82C78 75 85 65 85 50C85 28 70 10 50 10Z"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      {/* Left eye */}
      <circle cx="35" cy="45" r="10" fill="currentColor" />
      {/* Right eye */}
      <circle cx="65" cy="45" r="10" fill="currentColor" />
      {/* Nose */}
      <path
        d="M50 55L45 68H55L50 55Z"
        fill="currentColor"
      />
      {/* Teeth */}
      <rect x="32" y="82" width="8" height="8" fill="currentColor" />
      <rect x="46" y="82" width="8" height="8" fill="currentColor" />
      <rect x="60" y="82" width="8" height="8" fill="currentColor" />
    </svg>
  );
}
