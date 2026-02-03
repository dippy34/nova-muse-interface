import { cn } from "@/lib/utils";

interface ParrotLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

export function ParrotLogo({ className, size = "md" }: ParrotLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizes[size], "text-primary animate-flicker", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Parrot head */}
      <ellipse cx="50" cy="40" rx="28" ry="30" stroke="currentColor" strokeWidth="3" fill="none" />
      
      {/* Crest/feathers on top */}
      <path
        d="M35 15 Q40 5 50 12 Q55 8 60 15 Q65 10 68 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Eye */}
      <circle cx="58" cy="35" r="6" fill="currentColor" />
      <circle cx="60" cy="33" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
      
      {/* Curved beak */}
      <path
        d="M72 42 Q85 45 82 55 Q78 62 70 58 Q65 55 68 48 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Beak line */}
      <path
        d="M72 50 Q76 52 78 54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Body */}
      <path
        d="M30 65 Q25 80 35 92 Q50 98 65 92 Q75 80 70 65"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Wing detail */}
      <path
        d="M35 70 Q45 75 55 70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 78 Q48 82 58 78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Tail feathers */}
      <path
        d="M40 92 L35 100"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M50 94 L50 102"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 92 L65 100"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
