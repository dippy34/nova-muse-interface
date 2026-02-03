import { useState } from "react";
import { Header } from "@/components/Header";
import { PersonalityModal, PersonalityMode } from "@/components/PersonalityModal";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages, Message } from "@/components/ChatMessages";
import { WelcomeScreen } from "@/components/WelcomeScreen";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<PersonalityMode>("CHAOS");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (mode: PersonalityMode) => {
    setCurrentMode(mode);
    setIsModalOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response for now (will be replaced with actual DeepSeek integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(content, currentMode),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
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

// Temporary simulated responses based on personality mode
function getSimulatedResponse(message: string, mode: PersonalityMode): string {
  const responses: Record<PersonalityMode, string> = {
    Nice: `Hey there! Great question about "${message.slice(0, 30)}..." Let me help you with that! 😊\n\n(Connect Lovable Cloud to enable real AI responses)`,
    CHAOS: `Alright, you want to know about "${message.slice(0, 30)}..."? Hell yeah, let's dive in! 💀\n\n(Connect Lovable Cloud to enable real AI responses)`,
    Sarcastic: `Oh, "${message.slice(0, 30)}..."? How original. But fine, I'll humor you... 😏\n\n(Connect Lovable Cloud to enable real AI responses)`,
    Professional: `Thank you for your inquiry regarding "${message.slice(0, 30)}..." I shall address this matter accordingly.\n\n(Connect Lovable Cloud to enable real AI responses)`,
    Pirate: `Arrr! Ye want to know about "${message.slice(0, 30)}..."? Set sail, matey! 🏴‍☠️\n\n(Connect Lovable Cloud to enable real AI responses)`,
  };
  return responses[mode];
}

export default Index;
