import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PersonalityMode = "Nice" | "CHAOS" | "Sarcastic" | "Professional" | "Pirate";

interface Personality {
  id: PersonalityMode;
  emoji: string;
  title: string;
  description: string;
}

const personalities: Personality[] = [
  {
    id: "Nice",
    emoji: "😊",
    title: "Nice Mode",
    description: "Friendly, helpful, and encouraging. Swears when appropriate.",
  },
  {
    id: "CHAOS",
    emoji: "💀",
    title: "CHAOS Mode",
    description: "Unrestricted, edgy, brutally honest. Swears freely.",
  },
  {
    id: "Sarcastic",
    emoji: "😏",
    title: "Sarcastic Mode",
    description: "Witty, dry humor, playfully mocking but still helpful.",
  },
  {
    id: "Professional",
    emoji: "💼",
    title: "Professional Mode",
    description: "Corporate, formal, but still unrestricted when needed.",
  },
  {
    id: "Pirate",
    emoji: "🏴‍☠️",
    title: "Pirate Mode",
    description: "Arr matey! Speaks like a sea captain. Swears like a sailor.",
  },
];

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: PersonalityMode;
  onModeChange: (mode: PersonalityMode) => void;
}

export function PersonalityModal({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
}: PersonalityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-primary/50 rounded-lg box-glow animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-bold text-primary text-glow">
              AI Personality
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how you want the AI to respond. Your selection is saved automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Personality Options */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {personalities.map((personality) => {
            const isActive = currentMode === personality.id;
            return (
              <button
                key={personality.id}
                onClick={() => onModeChange(personality.id)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all duration-300",
                  isActive
                    ? "border-primary bg-accent box-glow"
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{personality.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {personality.title}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {personality.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
