import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/components/ChatMessages";
import type { PersonalityMode, CustomPersonality } from "@/components/PersonalityModal";

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  personality: PersonalityMode;
  custom_personality: CustomPersonality | null;
  created_at: string;
  updated_at: string;
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return;
    }

    setChats(
      (data || []).map((chat) => ({
        ...chat,
        messages: (chat.messages as unknown as Message[]) || [],
        personality: chat.personality as PersonalityMode,
        custom_personality: chat.custom_personality as unknown as CustomPersonality | null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const saveChat = async (
    name: string,
    messages: Message[],
    personality: PersonalityMode,
    customPersonality: CustomPersonality | null
  ): Promise<Chat | null> => {
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          name,
          messages: JSON.parse(JSON.stringify(messages)),
          personality,
          custom_personality: customPersonality
            ? JSON.parse(JSON.stringify(customPersonality))
            : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving chat:", error);
      return null;
    }

    const newChat: Chat = {
      ...data,
      messages: (data.messages as unknown as Message[]) || [],
      personality: data.personality as PersonalityMode,
      custom_personality: data.custom_personality as unknown as CustomPersonality | null,
    };

    setChats((prev) => [newChat, ...prev]);
    return newChat;
  };

  const updateChat = async (
    id: string,
    messages: Message[],
    personality?: PersonalityMode,
    customPersonality?: CustomPersonality | null
  ): Promise<boolean> => {
    const updateData: Record<string, unknown> = {
      messages: messages as unknown as Record<string, unknown>[],
    };

    if (personality !== undefined) {
      updateData.personality = personality;
    }
    if (customPersonality !== undefined) {
      updateData.custom_personality = customPersonality as unknown as Record<string, unknown>;
    }

    const { error } = await supabase
      .from("chats")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating chat:", error);
      return false;
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              messages,
              ...(personality !== undefined && { personality }),
              ...(customPersonality !== undefined && { custom_personality: customPersonality }),
              updated_at: new Date().toISOString(),
            }
          : chat
      )
    );

    return true;
  };

  const deleteChat = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("chats").delete().eq("id", id);

    if (error) {
      console.error("Error deleting chat:", error);
      return false;
    }

    setChats((prev) => prev.filter((chat) => chat.id !== id));
    return true;
  };

  const renameChat = async (id: string, name: string): Promise<boolean> => {
    const { error } = await supabase.from("chats").update({ name }).eq("id", id);

    if (error) {
      console.error("Error renaming chat:", error);
      return false;
    }

    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, name } : chat))
    );

    return true;
  };

  return {
    chats,
    loading,
    saveChat,
    updateChat,
    deleteChat,
    renameChat,
    refetch: fetchChats,
  };
}
