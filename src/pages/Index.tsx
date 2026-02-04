import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PersonalityModal, PersonalityMode, CustomPersonality } from "@/components/PersonalityModal";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages, Message } from "@/components/ChatMessages";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatSidebar } from "@/components/ChatSidebar";
import { SaveChatDialog } from "@/components/SaveChatDialog";
import { useChats, Chat } from "@/hooks/use-chats";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const { chats, saveChat, updateChat, deleteChat, renameChat } = useChats();

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
    
    if (customPersonality?.name === name) {
      setCurrentMode("CHAOS");
      setCustomPersonality(null);
    }
    toast.success(`Deleted "${name}"`);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentMode("CHAOS");
    setCustomPersonality(null);
  };

  const handleSelectChat = (chat: Chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setCurrentMode(chat.personality);
    setCustomPersonality(chat.custom_personality);
  };

  const handleSaveChat = async (name: string) => {
    const result = await saveChat(name, messages, currentMode, customPersonality);
    if (result) {
      setCurrentChatId(result.id);
      toast.success(`Chat saved as "${name}"`);
    } else {
      toast.error("Failed to save chat");
    }
  };

  const handleDeleteChat = async (id: string) => {
    const success = await deleteChat(id);
    if (success) {
      if (currentChatId === id) {
        handleNewChat();
      }
      toast.success("Chat deleted");
    } else {
      toast.error("Failed to delete chat");
    }
  };

  const handleRenameChat = async (id: string, name: string) => {
    const success = await renameChat(id, name);
    if (success) {
      toast.success("Chat renamed");
    } else {
      toast.error("Failed to rename chat");
    }
  };

  const handleSendMessage = async (content: string, images?: string[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      images,
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
        images: m.images,
      })),
      personality: currentMode,
      customPersonality: customPersonality || undefined,
      onDelta: updateAssistantMessage,
      onDone: async () => {
        setIsLoading(false);
        // Auto-update if chat is already saved
        if (currentChatId) {
          setMessages((currentMessages) => {
            updateChat(currentChatId, currentMessages, currentMode, customPersonality);
            return currentMessages;
          });
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error(error);
      },
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      )}

      <div className="flex-1 flex flex-col">
        <Header
          currentMode={currentMode}
          onSettingsClick={() => setIsModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSaveChat={() => setSaveDialogOpen(true)}
          showSaveButton={messages.length > 0 && !currentChatId}
          isSaved={!!currentChatId}
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

        <SaveChatDialog
          isOpen={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={handleSaveChat}
        />
      </div>
    </div>
  );
};

export default Index;
