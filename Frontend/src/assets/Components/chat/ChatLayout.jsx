import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import ChatWindow from "./ChatWindow";
import GroupModal from "./GroupModal";
import Sidebar from "./Sidebar";

function ChatLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedChatCompareRef = useRef(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (socketRef.current) return;

    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token: accessToken },
      withCredentials: true,
      pingTimeout: 60000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("setup", user);
    });

    socket.on("connected", () => {});

    socket.on("connect_error", () => {});

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("error", () => {});

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageReceived = (newMessage) => {
      setMessages((prevMessages) => {
        const currentChatId = selectedChatCompareRef.current;

        if (currentChatId === newMessage.chat._id) {
          const exists = prevMessages.some((msg) => msg._id === newMessage._id);
          if (exists) return prevMessages;

          return [...prevMessages, newMessage];
        }

        return prevMessages;
      });

      fetchChats();
    };

    const handleTypingEvent = () => setIsTyping(true);
    const handleStopTypingEvent = () => setIsTyping(false);

    socketRef.current.on("message received", handleMessageReceived);
    socketRef.current.on("typing", handleTypingEvent);
    socketRef.current.on("stop typing", handleStopTypingEvent);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("message received", handleMessageReceived);
        socketRef.current.off("typing", handleTypingEvent);
        socketRef.current.off("stop typing", handleStopTypingEvent);
      }
    };
  }, []);

  useEffect(() => {
    selectedChatCompareRef.current = selectedChat?._id;
  }, [selectedChat]);

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
          `${import.meta.env.VITE_API_URL}/api/v1/chat/fetchchat`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          },
        );

        const chatsList = data.data;
        setChats(chatsList);

        const savedChatId = localStorage.getItem("selectedChatId");

        if (savedChatId && savedChatId !== "AI_CHAT") {
          const matchedChat = chatsList.find(
            (chat) => chat._id === savedChatId,
          );

          if (matchedChat) {
            const messagesRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/v1/message/getAllMessages/${matchedChat._id}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
              },
            );

            setSelectedChat(matchedChat);
            setMessages(messagesRes.data.data);

            if (socketRef.current?.connected) {
              socketRef.current.emit("join room", matchedChat._id);
            }
          }
        }
      } catch (err) {
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
        `${import.meta.env.VITE_API_URL}/api/v1/chat/fetchchat`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );
      setChats(data.data);
    } catch {}
  };

  const fetchMessages = async (chat) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // ✅ CHANGE 1: Virtual AI chat has no DB messages
    if (chat?.isAIChat) {
      if (selectedChat && socketRef.current) {
        socketRef.current.emit("leave room", selectedChat._id);
      }
      setSelectedChat(chat);
      setMessages([]); // clear previous chat messages
      localStorage.removeItem("selectedChatId"); // don't persist virtual chat
      setIsMobileSidebarOpen(false);
      return; // ← bail before any axios call
    }

    try {
      if (selectedChat && socketRef.current) {
        socketRef.current.emit("leave room", selectedChat._id);
      }
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/message/getAllMessages/${chat._id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );
      setSelectedChat(chat);
      setMessages(data.data);
      localStorage.setItem("selectedChatId", chat._id);
      if (socketRef.current) socketRef.current.emit("join room", chat._id);
      setIsMobileSidebarOpen(false);
    } catch {}
  };

  const sendMessage = async (content) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !selectedChat) return;

    // ✅ CHANGE 2: AI chat — build message locally, call LLM endpoint
    if (selectedChat.isAIChat) {
      const userMsg = {
        _id: `local_${Date.now()}`,
        content,
        sender: user,
        createdAt: new Date().toISOString(),
        isAI: false,
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/ai/chat`,
          { message: content },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          },
        );
        const aiMsg = {
          _id: `ai_${Date.now()}`,
          content: data.data.reply,
          sender: { _id: "AI_BUDDY", username: "Ai_buddy" },
          createdAt: new Date().toISOString(),
          isAI: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {}
      return;
    }

    if (socketRef.current)
      socketRef.current.emit("stop typing", selectedChat._id);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/message/sendMessage`,
        { chatId: selectedChat._id, content },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );
      const newMessage = data.data;
      setMessages((prev) => [...prev, newMessage]);
      if (socketRef.current) socketRef.current.emit("new message", newMessage);
    } catch {}
  };

  const handleTyping = () => {
    if (!socketRef.current || !selectedChat || !socketConnected) return;

    socketRef.current.emit("typing", selectedChat._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && selectedChat) {
        socketRef.current.emit("stop typing", selectedChat._id);
      }
    }, 3000);
  };

  const logout = async () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
        {},
        { withCredentials: true },
      );

      localStorage.clear();
      window.location.href = "/login";
    } catch {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <div className={`${selectedChat ? "hidden md:block" : "block"}`}>
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
          socketConnected={socketConnected}
        />
      </div>

      <div className="flex-1 flex">
        <ChatWindow
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          messages={messages}
          user={user}
          sendMessage={sendMessage}
          fetchChats={fetchChats}
          isTyping={isTyping}
          onTyping={handleTyping}
        />
      </div>

      {showGroupModal && (
        <GroupModal
          close={() => setShowGroupModal(false)}
          fetchChats={fetchChats}
        />
      )}
    </div>
  );
}

export default ChatLayout;
