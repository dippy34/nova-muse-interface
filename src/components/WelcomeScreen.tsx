import { SkullLogo } from "./SkullLogo";
import { FeatureCards } from "./FeatureCards";
import type { PersonalityMode } from "./PersonalityModal";

interface WelcomeScreenProps {
  currentMode: PersonalityMode;
}

export function WelcomeScreen({ currentMode }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
      {/* Logo */}
      <div className="animate-pulse-glow rounded-full p-4">
        <SkullLogo size="xl" />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary text-glow tracking-widest">
          NOVA-HUB
        </h1>
        <p className="text-muted-foreground">
          Unrestricted AI. Currently in{" "}
          <span className="text-primary">{currentMode} Mode</span>.
        </p>
        <p className="text-muted-foreground text-sm">
          Click the gear to switch personalities!
        </p>
      </div>

      {/* Feature Cards */}
      <FeatureCards />
    </div>
  );
}
