import { useState } from "react";
import { X, Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PersonalityMode = "Nice" | "CHAOS" | "Sarcastic" | "Professional" | "Pirate" | "Custom";

export interface CustomPersonality {
  name: string;
  description: string;
  prompt: string;
}

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
  {
    id: "Custom",
    emoji: "✨",
    title: "Custom Mode",
    description: "Create your own AI personality with manual entry or AI assistance.",
  },
];

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: PersonalityMode;
  onModeChange: (mode: PersonalityMode, custom?: CustomPersonality) => void;
  currentCustom?: CustomPersonality | null;
}

type CustomStep = "select" | "manual" | "ai-chat";

export function PersonalityModal({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  currentCustom,
}: PersonalityModalProps) {
  const [customStep, setCustomStep] = useState<CustomStep>("select");
  const [customName, setCustomName] = useState(currentCustom?.name || "");
  const [customDescription, setCustomDescription] = useState(currentCustom?.description || "");
  const [customPrompt, setCustomPrompt] = useState(currentCustom?.prompt || "");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const resetCustomState = () => {
    setCustomStep("select");
    setCustomName("");
    setCustomDescription("");
    setCustomPrompt("");
    setAiInput("");
    setAiMessages([]);
  };

  const handleClose = () => {
    resetCustomState();
    onClose();
  };

  const handleSelectPersonality = (personality: Personality) => {
    if (personality.id === "Custom") {
      setCustomStep("select");
    } else {
      onModeChange(personality.id);
      handleClose();
    }
  };

  const handleSaveCustom = () => {
    if (!customName.trim() || !customPrompt.trim()) return;
    
    onModeChange("Custom", {
      name: customName.trim(),
      description: customDescription.trim() || `Custom personality: ${customName.trim()}`,
      prompt: customPrompt.trim(),
    });
    handleClose();
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    
    setIsGenerating(true);
    const userMessage = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-personality`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            message: userMessage,
            history: aiMessages,
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        
        // If AI generated a personality, auto-fill the fields
        if (data.personality) {
          setCustomName(data.personality.name);
          setCustomDescription(data.personality.description);
          setCustomPrompt(data.personality.prompt);
        }
      }
    } catch (error) {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to generate. Please try again or use manual entry." },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const showCustomEditor = currentMode === "Custom" || customStep !== "select";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-primary/50 rounded-lg box-glow animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-bold text-primary text-glow">
              {customStep === "manual" ? "Create Custom Personality" : 
               customStep === "ai-chat" ? "AI Personality Creator" : 
               "AI Personality"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {customStep === "manual" ? "Define your custom AI personality." :
               customStep === "ai-chat" ? "Describe your ideal AI personality." :
               "Choose how you want the AI to respond."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {customStep === "select" && (
            <>
              {/* Personality Options */}
              {personalities.map((personality) => {
                const isActive = currentMode === personality.id;
                const isCustomOption = personality.id === "Custom";
                
                return (
                  <button
                    key={personality.id}
                    onClick={() => handleSelectPersonality(personality)}
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
                          {isActive && !isCustomOption && (
                            <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                              Active
                            </span>
                          )}
                          {isActive && isCustomOption && currentCustom && (
                            <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                              {currentCustom.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isActive && isCustomOption && currentCustom 
                            ? currentCustom.description 
                            : personality.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Custom creation options - show when Custom is clicked */}
              {personalities.find(p => p.id === "Custom") && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Create custom personality:</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setCustomStep("manual")}
                    >
                      <PenLine className="w-4 h-4" />
                      Manual Entry
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setCustomStep("ai-chat")}
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Assisted
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {customStep === "manual" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Personality Name</Label>
                <Input
                  id="custom-name"
                  placeholder="e.g., Wise Sage, Helpful Butler..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-description">Short Description</Label>
                <Input
                  id="custom-description"
                  placeholder="Brief description of this personality..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">System Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="You are Nova in [name] mode. Define how the AI should behave, its tone, personality traits, and any special characteristics..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCustomStep("select")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveCustom}
                  disabled={!customName.trim() || !customPrompt.trim()}
                  className="flex-1"
                >
                  Save & Apply
                </Button>
              </div>
            </div>
          )}

          {customStep === "ai-chat" && (
            <div className="space-y-4">
              {/* AI Chat Messages */}
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {aiMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Describe the kind of AI personality you want. Be creative!
                    <br />
                    <span className="text-xs">e.g., "A wise old wizard who speaks in riddles"</span>
                  </p>
                )}
                {aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      msg.role === "user"
                        ? "bg-primary/10 border border-primary/30 ml-8"
                        : "bg-accent border border-border/50 mr-8"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-1 p-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>

              {/* AI Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your ideal AI personality..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAiGenerate()}
                  disabled={isGenerating}
                />
                <Button onClick={handleAiGenerate} disabled={isGenerating || !aiInput.trim()}>
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>

              {/* Generated personality preview */}
              {customPrompt && (
                <div className="p-3 rounded-lg bg-accent/50 border border-primary/30 space-y-2">
                  <p className="text-xs text-primary font-semibold">Generated Personality:</p>
                  <p className="text-sm font-medium">{customName}</p>
                  <p className="text-xs text-muted-foreground">{customDescription}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCustomStep("select")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCustomStep("manual")}
                  className="flex-1"
                >
                  Edit Manually
                </Button>
                <Button
                  onClick={handleSaveCustom}
                  disabled={!customName.trim() || !customPrompt.trim()}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
