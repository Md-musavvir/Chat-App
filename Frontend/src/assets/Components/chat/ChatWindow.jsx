import { useEffect, useRef, useState } from "react";

import axios from "axios";

function ChatWindow({
  selectedChat,
  setSelectedChat,
  messages,
  user,
  sendMessage,
  fetchChats,
  isTyping,
  onTyping,
  userStatus,
}) {
  const bottomRef = useRef(null);
  const [input, setInput] = useState("");
  const [showAddBox, setShowAddBox] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-slate-700 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-transparent mb-2">
            No chat selected
          </h3>
          <p className="text-slate-600 text-sm">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isAdmin =
    selectedChat.isGroupChat && selectedChat.groupAdmin?._id === user._id;

  const handleAddUser = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/addToGroup`,
        { chatId: selectedChat._id, userId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setSelectedChat(data.data);
      fetchChats();
      setShowAddBox(false);
      setSearch("");
      setSearchResults([]);
    } catch {}
  };

  const handleRemoveUser = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/removeFromGroup`,
        { chatId: selectedChat._id, userId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setSelectedChat(data.data);
      fetchChats();
    } catch {}
  };

  const searchUsers = async () => {
    if (!search.trim()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/user/getUser?search=${search}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setSearchResults(data.data);
    } catch {
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
              selectedChat.isGroupChat
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "bg-gradient-to-br from-blue-500 to-cyan-500"
            }`}
          >
            {selectedChat.isGroupChat ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            ) : (
              selectedChat.users
                .find((u) => u._id !== user._id)
                ?.username.charAt(0)
                .toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : selectedChat.users.find((u) => u._id !== user._id)?.username}
            </h2>

            {isTyping ? (
              <p className="text-xs text-green-400 animate-pulse">typing...</p>
            ) : selectedChat.isGroupChat ? (
              <p className="text-xs text-slate-500">
                {selectedChat.users.length} members
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {userStatus.online
                  ? "🟢 Online"
                  : userStatus.lastSeen
                    ? `Last seen ${new Date(
                        Number(userStatus.lastSeen),
                      ).toLocaleString()}`
                    : "Offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id?.toString() === user._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${
                    isMe
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md"
                      : "bg-slate-800/70 text-white border border-slate-700/50 rounded-bl-md"
                  }`}
                >
                  {!isMe && selectedChat.isGroupChat && msg.sender && (
                    <p className="text-xs font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {msg.sender.username}
                    </p>
                  )}

                  <p className="leading-relaxed">{msg.content}</p>

                  <p
                    className={`text-[10px] text-right mt-2 ${
                      isMe ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage(input);
          setInput("");
        }}
        className="relative z-10 flex gap-3 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50"
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (onTyping) onTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-6 py-3 rounded-full bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
