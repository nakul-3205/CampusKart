'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show/hide the welcome popup
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000); // Show popup after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isSending) return;

    const userMessageText = inputValue.trim();
    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: userMessageText,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessageText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        const errorMessage = errorData.message || 'An unknown error occurred.';
        toast.error(`Chatbot error: ${errorMessage}`);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            sender: 'bot',
            text: `Sorry, I encountered an error: "${errorMessage}". Please try again.`,
          },
        ]);
        return;
      }

      const data = await res.json();
      const botResponseText = data.reply || "I didn't get a clear response. Can you try again?";

      const botResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botResponseText,
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);

    } catch (error: any) {
      console.error('Failed to send message to /api/ask:', error);
      toast.error('Could not connect to the chatbot. Please check your network.');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: 'bot',
          text: `It seems I'm offline. Please check your internet connection.`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopup(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Welcome Popup */}
      <Transition
        show={showPopup && !isOpen}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-4"
      >
        <button
          onClick={toggleChat}
          className="bg-white text-gray-800 rounded-full py-2 px-4 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 mb-4 cursor-pointer focus:outline-none"
        >
          <span className="text-sm font-semibold">Hi there! 👋</span>
          <XMarkIcon 
            className="h-4 w-4 text-gray-400 hover:text-gray-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(false);
            }}
          />
        </button>
      </Transition>

      {/* Main Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="bg-purple-600 text-white rounded-full p-4 shadow-xl hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
        aria-label={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        {isOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-7 w-7" />
        )}
      </button>

      {/* Chat Window */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-4 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-4 scale-95"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 h-[400px] flex flex-col absolute bottom-20 right-0 border border-gray-200">
          
          {/* Chat Header */}
          <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RocketLaunchIcon className="h-6 w-6 text-purple-400" />
              <h3 className="font-semibold text-lg">CampusKart AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
              aria-label="Close Chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                <RocketLaunchIcon className="h-10 w-10 text-purple-500 mb-2" />
                <p className="text-md font-medium">Hello there!</p>
                <p className="text-sm mt-1">I'm your CampusKart AI assistant. How can I help you today?</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-xl shadow-sm border ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-sm border-purple-700'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm border-gray-300'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center bg-white rounded-b-2xl">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isSending ? 'Sending message...' : 'Ask CampusKart AI...'}
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 placeholder-gray-500 text-gray-900"
              disabled={isSending}
            />
            <button
              type="submit"
              className="bg-purple-600 text-white p-3 rounded-full ml-2 hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send Message"
              disabled={isSending}
            >
              <PaperAirplaneIcon className={`h-5 w-5 ${isSending ? 'animate-bounce' : ''}`} />
            </button>
          </form>
        </div>
      </Transition>
    </div>
  );
}