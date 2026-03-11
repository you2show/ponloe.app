import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MessageMultiple01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { chatWithUstaz } from '@/services/geminiService';
import { useChat } from '@/contexts/ChatContext';

import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { MessageList } from './components/MessageList';
import { MarketContext } from './components/MarketContext';

export const ChatView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const { chats, messages, sendMessage, markAsRead, loading } = useChat();
  const [activeTab, setActiveTab] = useState<'general' | 'ustaz' | 'requests' | 'market'>('general');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'market') return chat.isMarket;
    return chat.type === activeTab && !chat.isMarket;
  });

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (selectedChatId) {
      markAsRead(selectedChatId);
    }
  }, [messages, selectedChatId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    const textToSend = messageInput.trim();
    sendMessage(selectedChatId, textToSend);
    setMessageInput('');
    setShowQuickActions(false);

    // AI Response Logic
    if (selectedChatId === 'ustaz-ai') {
      setIsTyping(true);
      
      // Construct history for context
      const history = messages
        .filter(m => m.chatId === 'ustaz-ai')
        .map(m => ({
          role: m.senderId === 'me' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      try {
        const userContext = user ? { name: profile?.full_name || user.email, email: user.email } : undefined;
        const response = await chatWithUstaz(textToSend, history as any, userContext);
        
        if (response) {
          // Add a small delay to make it feel more natural
          setTimeout(() => {
            sendMessage('ustaz-ai', response);
            setIsTyping(false);
          }, 500);
        } else {
          setIsTyping(false);
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        setIsTyping(false);
      }
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = "";
    switch (action) {
      case 'dua': prompt = "Please give me a Dua for anxiety and stress."; break;
      case 'quran': prompt = "Share a beautiful verse from the Quran about patience."; break;
      case 'hadith': prompt = "Tell me a Hadith about kindness."; break;
      default: return;
    }
    setMessageInput(prompt);
    setShowQuickActions(false);
  };

  const currentMessages = messages.filter(m => m.chatId === selectedChatId);

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] lg:h-[calc(100vh-80px)] w-full rounded-none lg:rounded-2xl overflow-hidden border-0 lg:border shadow-sm bg-white dark:bg-slate-900 ${
      theme === 'dark' ? 'lg:border-slate-800' : 'lg:border-gray-200'
    }`}>
      
      {/* Left Sidebar - Chat List */}
      <ChatSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredChats={filteredChats}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        onBack={onBack}
        loading={loading}
      />

      {/* Right Area - Chat Room */}
      <div className={`flex-1 flex flex-col bg-[#e5ddd5] dark:bg-slate-950 relative ${
        !selectedChatId ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {selectedChat ? (
          <>
            {/* Room Header */}
            <ChatHeader 
              selectedChat={selectedChat}
              setSelectedChatId={setSelectedChatId}
              isTyping={isTyping}
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
            />

            {/* Product Context for Market Chats */}
            {selectedChat.isMarket && selectedChat.productContext && (
              <MarketContext productContext={selectedChat.productContext} />
            )}

            {/* Messages Area */}
            <MessageList 
              messages={currentMessages}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />

            {/* Input Area */}
            <ChatInput 
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSendMessage={handleSendMessage}
              showQuickActions={showQuickActions}
              setShowQuickActions={setShowQuickActions}
              handleQuickAction={handleQuickAction}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center z-10">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <HugeiconsIcon icon={MessageMultiple01Icon} className="w-12 h-12 text-emerald-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2 font-khmer">ចាប់ផ្តើមការសន្ទនា</h3>
            <p className="font-khmer text-gray-500 dark:text-slate-400 max-w-xs">
              សូមជ្រើសរើសការសន្ទនាណាមួយ ឬសាកល្បងជជែកជាមួយ <span className="text-emerald-600 font-bold">Ustaz AI</span> ដើម្បីទទួលបានដំបូន្មានល្អៗ
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
