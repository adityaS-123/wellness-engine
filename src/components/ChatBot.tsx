'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Plus, Trash2, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function ChatBot() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load user and sessions on mount
  useEffect(() => {
    const loadUserAndSessions = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/signin');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        setUserName(user.name || 'User');

        // Load sessions from localStorage
        const savedSessions = localStorage.getItem(`chat_sessions_${user.id}`);
        if (savedSessions) {
          try {
            const parsedSessions = JSON.parse(savedSessions);
            setSessions(parsedSessions);
            if (parsedSessions.length > 0) {
              setCurrentSessionId(parsedSessions[0].id);
              setMessages(parsedSessions[0].messages);
            }
          } catch {
            // If parsing fails, create a new session
          }
        }

        setIsLoadingSessions(false);
      } catch {
        router.push('/signin');
      }
    };

    loadUserAndSessions();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (userId && sessions.length > 0) {
      localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(sessions));
    }
  }, [sessions, userId]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Update session locally
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: updatedMessages }
            : session
        )
      );
    }

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I\'m processing your question. This is a demo response.',
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      if (currentSessionId) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? { ...session, messages: finalMessages }
              : session
          )
        );
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [
        {
          id: '1',
          type: 'bot',
          content: 'Hello! I\'m your Wellness Assistant. How can I help you today?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length === 1) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(filtered[0].id);
      setMessages(filtered[0].messages);
    }
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Initialize with a default session if none exist
  useEffect(() => {
    if (!isLoadingSessions && sessions.length === 0 && userId) {
      createNewSession();
    }
  }, [isLoadingSessions, userId]);

  if (isLoadingSessions) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-40 transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-sm font-bold text-white">Chat History</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewSession}
          className="mx-4 mt-4 py-2 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition ${
                currentSessionId === session.id
                  ? 'bg-blue-800 text-blue-100'
                  : 'hover:bg-slate-800 text-gray-300'
              }`}
              onClick={() => switchSession(session.id)}
            >
              <p className="text-sm font-medium truncate">{session.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {session.messages.length} messages
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 space-y-3">
          <p className="text-xs text-gray-400 text-center">
            Logged in as <br /> <span className="font-semibold text-white">{userName}</span>
          </p>
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 text-sm font-semibold text-red-400 hover:bg-red-950 rounded transition border border-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden text-gray-400 hover:text-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-semibold text-white">
              {currentSession?.title || 'Chat'}
            </h3>
          </div>
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white text-sm font-bold mr-3">
                    W
                  </div>
                )}
                <div
                  className={`max-w-2xl ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white text-sm font-bold mr-3">
                  W
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - ChatGPT Style */}
        <div className="border-t border-slate-700 bg-slate-900 px-4 py-4 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20 transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                className="flex-1 bg-transparent outline-none text-sm resize-none placeholder-gray-500 text-white"
                style={{ minHeight: '24px', maxHeight: '120px' }}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="shrink-0 text-blue-500 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Wellness Assistant can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
