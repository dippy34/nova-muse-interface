import { Settings, Save, Menu } from "lucide-react";
import { ParrotLogo } from "./ParrotLogo";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentMode: string;
  onSettingsClick: () => void;
  onSaveChat?: () => void;
  onToggleSidebar?: () => void;
  showSaveButton?: boolean;
  isSaved?: boolean;
}

export function Header({
  currentMode,
  onSettingsClick,
  onSaveChat,
  onToggleSidebar,
  showSaveButton,
  isSaved,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="mr-1"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
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
      <div className="flex items-center gap-2">
        {showSaveButton && onSaveChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveChat}
            className="gap-2"
            disabled={isSaved}
          >
            <Save className="w-4 h-4" />
            {isSaved ? "Saved" : "Save Chat"}
          </Button>
        )}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all duration-300 group"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </header>
  );
}
