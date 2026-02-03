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

export function ParrotLogo({ className, size = "md" }: SkullLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizes[size], "text-primary animate-flicker", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Skull outline */}
      <ellipse cx="50" cy="45" rx="35" ry="38" stroke="currentColor" strokeWidth="3" fill="none" />
      
      {/* Left eye socket */}
      <ellipse cx="35" cy="40" rx="10" ry="12" stroke="currentColor" strokeWidth="2" fill="none" />
      
      {/* Right eye socket */}
      <ellipse cx="65" cy="40" rx="10" ry="12" stroke="currentColor" strokeWidth="2" fill="none" />
      
      {/* Nose hole */}
      <path
        d="M45 55 L50 65 L55 55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Jaw */}
      <path
        d="M20 70 Q25 85 50 88 Q75 85 80 70"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Teeth */}
      <line x1="30" y1="75" x2="30" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="77" x2="40" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="78" x2="50" y2="88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="77" x2="60" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="75" x2="70" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}