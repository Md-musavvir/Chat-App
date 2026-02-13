import { useState } from "react";

import axios from "axios";

function Sidebar({
  chats,
  user,
  selectedChat,
  fetchMessages,
  fetchChats,
  setSelectedChat,
  setMessages,
  openGroupModal,
  logout,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

      setResults(data.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const accessChat = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const { data } = await axios.post(
      "http://localhost:9000/api/v1/chat/accessChat",
      { userId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      },
    );

    setSelectedChat(data.data);
    fetchMessages(data.data);
    fetchChats();
    setResults([]);
    setSearch("");
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    return chat.users.find((u) => u._id !== user._id)?.username;
  };

  const getPreview = (chat) => {
    if (!chat.latestMessage) return "Start conversation";
    const isMe = chat.latestMessage.sender._id === user._id;
    return `${isMe ? "You: " : ""}${chat.latestMessage.content}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUsers();
    }
  };

  return (
    <div className="w-full md:w-[380px] bg-slate-900/95 backdrop-blur-xl flex flex-col h-full border-r border-slate-800/50 relative">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chats
          </h2>
          <div className="flex gap-2">
            <button
              onClick={openGroupModal}
              className="group relative px-3 py-2 rounded-lg font-medium text-sm
                       bg-gradient-to-r from-emerald-600 to-teal-600
                       hover:from-emerald-500 hover:to-teal-500
                       transition-all duration-300 transform hover:scale-105
                       shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              title="Create New Group"
            >
              <span className="flex items-center gap-1">
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
                Group
              </span>
            </button>
            <button
              onClick={logout}
              className="group relative px-3 py-2 rounded-lg font-medium text-sm
                       bg-gradient-to-r from-red-600 to-pink-600
                       hover:from-red-500 hover:to-pink-500
                       transition-all duration-300 transform hover:scale-105
                       shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
              title="Logout"
            >
              <span className="flex items-center gap-1">
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Search section */}
        <div className="space-y-2">
          <div className="relative group">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search users..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-800/50 text-white
                       placeholder-slate-500 border border-slate-700/50
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                       transition-all duration-300 backdrop-blur-sm"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={searchUsers}
            disabled={isSearching || !search.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-white
                     bg-gradient-to-r from-blue-600 to-purple-600
                     hover:from-blue-500 hover:to-purple-500
                     disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed
                     transition-all duration-300 transform hover:scale-[1.02]
                     shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40
                     disabled:shadow-none"
          >
            {isSearching ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border-b border-slate-800/50 bg-slate-800/30">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Search Results
          </div>
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => accessChat(u._id)}
              className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-all duration-200
                       border-b border-slate-800/30 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {u.username}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <svg
                  className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 px-8 text-center">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
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
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Search for users to start chatting</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => fetchMessages(chat)}
              className={`px-4 py-3 cursor-pointer border-b border-slate-800/30 
                       transition-all duration-200 group relative overflow-hidden
                       ${
                         selectedChat?._id === chat._id
                           ? "bg-slate-800/70 border-l-4 border-l-blue-500"
                           : "hover:bg-slate-800/40"
                       }`}
            >
              {/* Gradient indicator for selected chat */}
              {selectedChat?._id === chat._id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
              )}

              <div className="flex items-center gap-3 relative z-10">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
                              ${
                                chat.isGroupChat
                                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
                              }`}
                >
                  {chat.isGroupChat ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  ) : (
                    getChatName(chat).charAt(0).toUpperCase()
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className={`font-semibold truncate ${
                        selectedChat?._id === chat._id
                          ? "text-blue-400"
                          : "text-white group-hover:text-blue-300"
                      } transition-colors`}
                    >
                      {getChatName(chat)}
                    </p>
                    {chat.latestMessage && (
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                        {new Date(
                          chat.latestMessage.createdAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {getPreview(chat)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
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
      `}</style>
    </div>
  );
}

export default Sidebar;
