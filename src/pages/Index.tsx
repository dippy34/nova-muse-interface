import { useState } from "react";
import { Header } from "@/components/Header";
import { PersonalityModal, PersonalityMode } from "@/components/PersonalityModal";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages, Message } from "@/components/ChatMessages";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { streamChat } from "@/lib/chat-api";
import { generateImage } from "@/lib/image-api";
import { toast } from "sonner";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<PersonalityMode>("CHAOS");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (mode: PersonalityMode) => {
    setCurrentMode(mode);
    setIsModalOpen(false);
    toast.success(`Switched to ${mode} Mode`);
  };

  const handleSendMessage = async (content: string) => {
    // Check for image generation command
    const imageMatch = content.match(/^\/image\s+(.+)$/i);
    
    if (imageMatch) {
      const prompt = imageMatch[1];
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `🎨 Generate image: ${prompt}`,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const result = await generateImage(prompt);
      
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text || "Here's your generated image:",
        imageUrl: result.imageUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

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
      />
    </div>
  );
};

export default Index;
