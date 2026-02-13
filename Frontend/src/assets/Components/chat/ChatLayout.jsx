import { useEffect, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import ChatWindow from "./ChatWindow";
import GroupModal from "./GroupModal";
import Sidebar from "./Sidebar";

function ChatLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:9000/api/v1/chat/fetchchat",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          },
        );

        const chatsList = data.data;
        setChats(chatsList);

        const savedChatId = localStorage.getItem("selectedChatId");

        if (savedChatId) {
          const matchedChat = chatsList.find(
            (chat) => chat._id === savedChatId,
          );

          if (matchedChat) {
            const messagesRes = await axios.get(
              `http://localhost:9000/api/v1/message/getAllMessages/${matchedChat._id}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
              },
            );

            setSelectedChat(matchedChat);
            setMessages(messagesRes.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to initialize:", err);
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchChats = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.get(
        "http://localhost:9000/api/v1/chat/fetchchat",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        },
      );
      setChats(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMessages = async (chat) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:9000/api/v1/message/getAllMessages/${chat._id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setSelectedChat(chat);
      setMessages(data.data);

      // Save chat ID
      localStorage.setItem("selectedChatId", chat._id);

      // Close mobile sidebar after selecting chat
      setIsMobileSidebarOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async (content) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:9000/api/v1/message/sendMessage",
        {
          chatId: selectedChat._id,
          content,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setMessages((prev) => [...prev, data.data]);
      fetchChats();
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      // Clear cookies on the backend as well
      await axios.post(
        "http://localhost:9000/api/v1/user/logout",
        {},
        { withCredentials: true },
      );

      // Clear localStorage for frontend
      localStorage.clear();

      // Use hard redirect instead of React Router navigate
      window.location.href = "/login";
    } catch (err) {
      console.error("Error during logout", err);
      // Even if logout API fails, clear localStorage and redirect
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-6">
            <svg className="animate-spin h-16 w-16 mx-auto" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="url(#gradient)"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Loading your chats
          </h3>
          <p className="text-slate-500 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Header - Only visible on mobile when chat is selected */}
      {selectedChat && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsMobileSidebarOpen(true);
                setSelectedChat(null);
              }}
              className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : selectedChat.users.find((u) => u._id !== user._id)
                      ?.username}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div
        className={`${
          selectedChat ? "hidden md:block" : "block"
        } ${isMobileSidebarOpen ? "block" : "hidden md:block"} relative z-30`}
      >
        <Sidebar
          chats={chats}
          user={user}
          selectedChat={selectedChat}
          fetchMessages={fetchMessages}
          fetchChats={fetchChats}
          setSelectedChat={setSelectedChat}
          setMessages={setMessages}
          openGroupModal={() => setShowGroupModal(true)}
          logout={logout}
        />
      </div>

      {/* Chat Window - Full screen on mobile when chat is selected */}
      <div
        className={`flex-1 relative z-20 ${!selectedChat ? "hidden md:flex" : "flex"} ${
          selectedChat ? "md:mt-0 mt-[60px]" : ""
        }`}
      >
        <ChatWindow
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          messages={messages}
          user={user}
          sendMessage={sendMessage}
          fetchChats={fetchChats}
        />
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <GroupModal
          close={() => setShowGroupModal(false)}
          fetchChats={fetchChats}
        />
      )}

      {/* Custom animation styles */}
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default ChatLayout;
