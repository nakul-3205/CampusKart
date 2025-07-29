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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white rounded-full p-4 shadow-lg hover:bg-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-white"
        aria-label={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        {isOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-7 w-7" />
        )}
      </button>

      <Transition
        show={isOpen}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-4 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-4 scale-95"
      >
        <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 h-96 flex flex-col absolute bottom-20 right-0 border border-gray-200">
          <div className="bg-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">CampusKart AI</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
              aria-label="Close Chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p>Hello! How can I help you today?</p>
                <p className="text-sm mt-2">I'm connected to the CampusKart AI.</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gray-900 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isSending ? 'Sending message...' : 'Ask CampusKart AI...'}
              className="flex-1 border border-gray-300 rounded-l-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 placeholder-gray-500 text-gray-900"
              disabled={isSending}
            />
            <button
              type="submit"
              className="bg-gray-800 text-white p-3 rounded-r-lg hover:bg-black transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send Message"
              disabled={isSending}
            >
              <RocketLaunchIcon className={`h-5 w-5 ${isSending ? 'animate-bounce' : ''}`} />
            </button>
          </form>
        </div>
      </Transition>
    </div>
  );
}