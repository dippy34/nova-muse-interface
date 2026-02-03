import { Settings } from "lucide-react";
import { ParrotLogo } from "./ParrotLogo";

interface HeaderProps {
  currentMode: string;
  onSettingsClick: () => void;
}

export function Header({ currentMode, onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <ParrotLogo size="sm" />
        <div>
          <h1 className="text-xl font-bold text-primary text-glow tracking-wider">
            NOVA
          </h1>
          <p className="text-xs text-muted-foreground">
            Currently: <span className="text-primary">{currentMode} Mode</span>
          </p>
        </div>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all duration-300 group"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>
    </header>
  );
}
