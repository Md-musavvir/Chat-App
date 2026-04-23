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
        `${import.meta.env.VITE_API_URL}/api/v1/user/getUser?search=${search}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setResults(data.data);
    } catch {
    } finally {
      setIsSearching(false);
    }
  };

  const accessChat = async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/chat/accessChat`,
      { userId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      },
    );

    setSelectedChat(data.data);

    if (data.data.isAIChat) {
      // 👉 AI chat → no DB messages
      setMessages([]);
    } else {
      fetchMessages(data.data);
    }

    fetchChats();
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
    if (e.key === "Enter") searchUsers();
  };

  return (
    <div className="w-full md:w-[380px] bg-slate-900/95 backdrop-blur-xl flex flex-col h-full border-r border-slate-800/50 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

      <div className="p-4 border-b border-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chats
          </h2>

          <div className="flex gap-2">
            <button
              onClick={openGroupModal}
              className="px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
            >
              Group
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search users..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
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
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="border-b border-slate-800/50 bg-slate-800/30">
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                console.log("Clicked user:", u);
                const id = u._id ? u._id : "AI_BUDDY";
                accessChat(id);
              }}
              className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-all duration-200 border-b border-slate-800/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 px-8 text-center">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Search for users to start chatting</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => fetchMessages(chat)}
              className={`px-4 py-3 cursor-pointer border-b border-slate-800/30 transition-all duration-200 ${
                selectedChat?._id === chat._id
                  ? "bg-slate-800/70 border-l-4 border-l-blue-500"
                  : "hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    chat.isGroupChat
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  }`}
                >
                  {chat.isGroupChat
                    ? "G"
                    : getChatName(chat)?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className={`font-semibold truncate ${
                        selectedChat?._id === chat._id
                          ? "text-blue-400"
                          : "text-white"
                      }`}
                    >
                      {getChatName(chat)}
                    </p>

                    {chat.latestMessage && (
                      <span className="text-xs text-slate-500 ml-2">
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
