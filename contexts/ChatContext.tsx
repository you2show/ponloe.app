import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Define types for Chat and Message
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: string;
  isPostShare?: boolean;
  postId?: string;
  postContext?: any;
  created_at?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: 'general' | 'ustaz' | 'requests' | 'market';
  isAi?: boolean;
  isMarket?: boolean;
  productContext?: any;
  participants?: any[];
}

interface ChatContextType {
  chats: ChatRoom[];
  messages: ChatMessage[];
  sendMessage: (chatId: string, text: string, isPostShare?: boolean, postId?: string, postContext?: any) => void;
  markAsRead: (chatId: string) => void;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Add AI Chat by default
  const aiChat: ChatRoom = {
    id: 'ustaz-ai',
    name: 'Ustaz AI',
    avatar: 'https://ui-avatars.com/api/?name=AI&background=10b981&color=fff&font-size=0.5',
    lastMessage: 'Assalamu alaikum! How can I help you today?',
    time: 'Now',
    unread: 0,
    type: 'ustaz',
    isAi: true
  };

  const aiWelcomeMessage: ChatMessage = {
    id: 'ai-welcome',
    chatId: 'ustaz-ai',
    senderId: 'ustaz-ai',
    text: 'Assalamu alaikum! I am your AI assistant. Ask me anything about Islam, Quran, or daily life.',
    time: 'Now'
  };

  useEffect(() => {
    if (!user || !supabase) {
      setChats([aiChat]);
      setMessages([aiWelcomeMessage]);
      setLoading(false);
      return;
    }

    fetchChats();
    
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new;
        
        // Format the incoming message
        const formattedMsg: ChatMessage = {
          id: newMsg.id,
          chatId: newMsg.chat_id,
          senderId: newMsg.sender_id === user.id ? 'me' : newMsg.sender_id,
          text: newMsg.content,
          time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isPostShare: newMsg.is_post_share,
          postId: newMsg.post_id,
          postContext: newMsg.post_context,
          created_at: newMsg.created_at
        };

        setMessages(prev => {
          // Check if message already exists (optimistic update)
          if (prev.some(m => m.id === formattedMsg.id || (m.text === formattedMsg.text && m.senderId === 'me' && Date.now() - new Date(m.time).getTime() < 5000))) {
            return prev;
          }
          return [...prev, formattedMsg];
        });

        // Update chat list with new message
        setChats(prevChats => {
          const chatExists = prevChats.some(c => c.id === formattedMsg.chatId);
          if (!chatExists) {
             // If chat doesn't exist in list, we should probably fetch it, but for now just return
             fetchChats();
             return prevChats;
          }
          
          return prevChats.map(chat => {
            if (chat.id === formattedMsg.chatId) {
              return {
                ...chat,
                lastMessage: formattedMsg.isPostShare ? 'Shared a post' : formattedMsg.text,
                time: formattedMsg.time,
                unread: formattedMsg.senderId !== 'me' && chat.id !== formattedMsg.chatId ? chat.unread + 1 : chat.unread
              };
            }
            return chat;
          }).sort((a, b) => {
             // Sort by time, keeping AI chat at top if needed or just standard sort
             if (a.id === 'ustaz-ai') return -1;
             if (b.id === 'ustaz-ai') return 1;
             return 0; // Basic sort for now
          });
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [user]);

  const fetchChats = async () => {
    if (!user || !supabase) return;
    
    try {
      // 1. Fetch chat participants to get chat IDs for current user
      const { data: participantsData, error: participantsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setChats([aiChat]);
        setMessages([aiWelcomeMessage]);
        setLoading(false);
        return;
      }

      const chatIds = participantsData.map(p => p.chat_id);

      // 2. Fetch chat details and other participants
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          type,
          is_market,
          product_context,
          chat_participants (
            user_id,
            profiles (
              id,
              full_name,
              avatar_url,
              role
            )
          )
        `)
        .in('id', chatIds);

      if (chatsError) throw chatsError;

      // 3. Fetch latest messages for these chats
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Format messages
      const formattedMessages: ChatMessage[] = (messagesData || []).map(msg => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id === user.id ? 'me' : msg.sender_id,
        text: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPostShare: msg.is_post_share,
        postId: msg.post_id,
        postContext: msg.post_context,
        created_at: msg.created_at
      }));

      // Format chats
      const formattedChats: ChatRoom[] = (chatsData || []).map(chat => {
        // Find the *other* participant to display their info
        const otherParticipant = chat.chat_participants.find((p: any) => p.user_id !== user.id)?.profiles;
        
        // Supabase returns an array for 1:1 relationships sometimes depending on the setup, handle both
        const profile = Array.isArray(otherParticipant) ? otherParticipant[0] : otherParticipant;
        
        // Find last message for this chat
        const chatMessages = formattedMessages.filter(m => m.chatId === chat.id);
        const lastMsg = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

        return {
          id: chat.id,
          name: profile?.full_name || 'Unknown User',
          avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=User&background=random`,
          lastMessage: lastMsg ? (lastMsg.isPostShare ? 'Shared a post' : lastMsg.text) : 'No messages yet',
          time: lastMsg ? lastMsg.time : '',
          unread: 0, // Need to implement read receipts table for accurate count
          type: chat.type || 'general',
          isMarket: chat.is_market,
          productContext: chat.product_context,
          participants: chat.chat_participants
        };
      });

      setChats([aiChat, ...formattedChats]);
      setMessages([aiWelcomeMessage, ...formattedMessages]);
      
    } catch (error) {
      console.error("Error fetching chats:", error);
      // Fallback to mock data on error
      setChats([aiChat]);
      setMessages([aiWelcomeMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId: string, text: string, isPostShare = false, postId?: string, postContext?: any) => {
    // Handle AI Chat locally
    if (chatId === 'ustaz-ai') {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        chatId,
        senderId: 'me',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPostShare,
        postId,
        postContext
      };
      setMessages(prev => [...prev, newMessage]);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, lastMessage: text, time: newMessage.time } : chat
        )
      );
      return;
    }

    if (!user || !supabase) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chatId,
      senderId: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPostShare,
      postId,
      postContext
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, lastMessage: isPostShare ? 'Shared a post' : text, time: optimisticMsg.time } : chat
      )
    );

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: text,
          is_post_share: isPostShare,
          post_id: postId,
          post_context: postContext
        });

      if (error) throw error;
      // Realtime subscription will handle replacing the temp message if needed, 
      // or we can just leave it as is if it matches.
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const markAsRead = async (chatId: string) => {
    // Local update
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, unread: 0 } : chat
      )
    );

    // If we had a read_receipts table, we would update it here
    // if (user && supabase && chatId !== 'ustaz-ai') {
    //   await supabase.from('read_receipts').upsert({ chat_id: chatId, user_id: user.id, last_read_at: new Date().toISOString() });
    // }
  };

  return (
    <ChatContext.Provider value={{ chats, messages, sendMessage, markAsRead, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
