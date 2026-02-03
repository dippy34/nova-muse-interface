import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PersonalityModal, PersonalityMode, CustomPersonality } from "@/components/PersonalityModal";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages, Message } from "@/components/ChatMessages";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { streamChat } from "@/lib/chat-api";
import { toast } from "sonner";

const SAVED_PERSONALITIES_KEY = "nova-hub-saved-personalities";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<PersonalityMode>("CHAOS");
  const [customPersonality, setCustomPersonality] = useState<CustomPersonality | null>(null);
  const [savedPersonalities, setSavedPersonalities] = useState<CustomPersonality[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved personalities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_PERSONALITIES_KEY);
    if (saved) {
      try {
        setSavedPersonalities(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved personalities:", e);
      }
    }
  }, []);

  // Save personalities to localStorage
  const savePersonalitiesToStorage = (personalities: CustomPersonality[]) => {
    localStorage.setItem(SAVED_PERSONALITIES_KEY, JSON.stringify(personalities));
    setSavedPersonalities(personalities);
  };

  const handleModeChange = (mode: PersonalityMode, custom?: CustomPersonality) => {
    setCurrentMode(mode);
    if (mode === "Custom" && custom) {
      setCustomPersonality(custom);
      
      // Save to list if it's a new personality
      const exists = savedPersonalities.some(p => p.name === custom.name);
      if (!exists) {
        savePersonalitiesToStorage([...savedPersonalities, custom]);
      }
      
      toast.success(`Switched to ${custom.name}`);
    } else {
      setCustomPersonality(null);
      toast.success(`Switched to ${mode} Mode`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSavedPersonality = (name: string) => {
    const updated = savedPersonalities.filter(p => p.name !== name);
    savePersonalitiesToStorage(updated);
    
    // If we deleted the currently active personality, switch to CHAOS
    if (customPersonality?.name === name) {
      setCurrentMode("CHAOS");
      setCustomPersonality(null);
    }
    toast.success(`Deleted "${name}"`);
  };

  const handleSendMessage = async (content: string) => {
    // Regular chat message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant" as const,
            content: assistantContent,
          },
        ];
      });
    };

    await streamChat({
      messages: updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      personality: currentMode,
      customPersonality: customPersonality || undefined,
      onDelta: updateAssistantMessage,
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast.error(error);
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        currentMode={currentMode}
        onSettingsClick={() => setIsModalOpen(true)}
      />

      {messages.length === 0 ? (
        <WelcomeScreen currentMode={currentMode} />
      ) : (
        <ChatMessages messages={messages} isLoading={isLoading} />
      )}

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />

      <PersonalityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        currentCustom={customPersonality}
        savedPersonalities={savedPersonalities}
        onDeleteSavedPersonality={handleDeleteSavedPersonality}
      />
    </div>
  );
};

export default Index;
