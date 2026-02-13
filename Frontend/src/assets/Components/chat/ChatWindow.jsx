import { useEffect, useRef, useState } from "react";

import axios from "axios";

function ChatWindow({
  selectedChat,
  setSelectedChat,
  messages,
  user,
  sendMessage,
  fetchChats,
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

  if (!selectedChat)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated background elements */}
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

  const isAdmin =
    selectedChat.isGroupChat && selectedChat.groupAdmin?._id === user._id;

  const handleAddUser = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const { data } = await axios.put(
        "http://localhost:9000/api/v1/chat/addToGroup",
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
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveUser = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const { data } = await axios.put(
        "http://localhost:9000/api/v1/chat/removeFromGroup",
        { chatId: selectedChat._id, userId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setSelectedChat(data.data);
      fetchChats();
    } catch (err) {
      console.log(err);
    }
  };

  const searchUsers = async () => {
    if (!search.trim()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `http://localhost:9000/api/v1/user/getUser?search=${search}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );
      setSearchResults(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="relative z-10 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
                        ${
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
            {selectedChat.isGroupChat && (
              <p className="text-xs text-slate-500">
                {selectedChat.users.length} members
              </p>
            )}
          </div>
        </div>

        {/* GROUP MEMBERS */}
        {selectedChat.isGroupChat && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Members
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedChat.users.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full text-sm border border-slate-700/50 group hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-300">{member.username}</span>

                  {isAdmin && member._id !== user._id && (
                    <button
                      onClick={() => handleRemoveUser(member._id)}
                      className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors ml-1"
                      title="Remove member"
                    >
                      <svg
                        className="w-3 h-3 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN CONTROLS */}
        {isAdmin && (
          <div className="mt-4">
            <button
              onClick={() => setShowAddBox(!showAddBox)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                       bg-gradient-to-r from-emerald-600 to-teal-600
                       hover:from-emerald-500 hover:to-teal-500
                       transition-all duration-300 transform hover:scale-105
                       shadow-lg shadow-emerald-500/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Member
            </button>

            {showAddBox && (
              <div className="mt-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                  placeholder="Search users..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-900/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           transition-all duration-300 text-sm mb-2"
                />
                <button
                  onClick={searchUsers}
                  disabled={isSearching || !search.trim()}
                  className="w-full py-2 rounded-lg font-semibold text-white text-sm
                           bg-gradient-to-r from-blue-600 to-purple-600
                           hover:from-blue-500 hover:to-purple-500
                           disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed
                           transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>

                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {searchResults.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => handleAddUser(u._id)}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-blue-400 transition-colors">
                          {u.username}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-600"
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
              <p className="text-slate-500 text-sm">No messages yet</p>
              <p className="text-slate-600 text-xs mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id?.toString() === user._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
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
        <div ref={bottomRef}></div>
      </div>

      {/* ================= INPUT ================= */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage(input);
          setInput("");
        }}
        className="relative z-10 flex gap-3 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50"
      >
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-6 py-3 pr-12 rounded-full bg-slate-800/50 text-white
                     placeholder-slate-500 border border-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                     transition-all duration-300"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full
                     bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Emoji (coming soon)"
          >
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-6 py-3 rounded-full font-semibold text-white
                   bg-gradient-to-r from-emerald-600 to-teal-600
                   hover:from-emerald-500 hover:to-teal-500
                   disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed
                   transition-all duration-300 transform hover:scale-105 active:scale-95
                   shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40
                   disabled:shadow-none flex items-center gap-2"
        >
          <span>Send</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>

      {/* Custom scrollbar and animation styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ChatWindow;
