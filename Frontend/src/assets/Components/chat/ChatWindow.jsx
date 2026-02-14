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
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        Select a chat to start messaging
      </div>
    );
  }

  const isAdmin =
    selectedChat.isGroupChat &&
    selectedChat.groupAdmin &&
    selectedChat.groupAdmin._id?.toString() === user._id?.toString();

  // ================= ADD USER =================
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
      console.error(err);
    }
  };

  // ================= REMOVE USER =================
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
      console.error(err);
    }
  };

  // ================= SEARCH USERS =================
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
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900">
        {/* Chat Title */}
        <h2 className="text-lg font-bold">
          {selectedChat.isGroupChat
            ? selectedChat.chatName
            : selectedChat.users.find((u) => u._id !== user._id)?.username}
        </h2>

        {/* Typing Indicator */}
        {isTyping && <p className="text-xs text-green-400 mt-1">typing...</p>}

        {/* ================= GROUP CONTROLS ================= */}
        {selectedChat.isGroupChat && (
          <div className="mt-4">
            {/* Member List */}
            <div className="flex flex-wrap gap-2">
              {selectedChat.users.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{member.username}</span>

                  {isAdmin && member._id.toString() !== user._id.toString() && (
                    <button
                      onClick={() => handleRemoveUser(member._id)}
                      className="text-red-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Member Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAddBox(!showAddBox)}
                className="mt-3 px-3 py-1 bg-blue-600 rounded text-sm"
              >
                Add Member
              </button>
            )}

            {/* Search Box */}
            {showAddBox && (
              <div className="mt-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user..."
                  className="px-3 py-1 bg-slate-800 rounded text-sm mr-2"
                />
                <button onClick={searchUsers} className="text-sm text-blue-400">
                  {isSearching ? "Searching..." : "Search"}
                </button>

                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleAddUser(u._id)}
                    className="cursor-pointer text-sm mt-1 hover:text-blue-400"
                  >
                    {u.username}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id?.toString() === user._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                    isMe ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                  }`}
                >
                  {!isMe && selectedChat.isGroupChat && msg.sender && (
                    <p className="text-xs font-semibold mb-1 text-blue-300">
                      {msg.sender.username}
                    </p>
                  )}

                  <p>{msg.content}</p>

                  <p className="text-[10px] text-right mt-2 text-slate-400">
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
        className="flex gap-3 p-4 border-t border-slate-800 bg-slate-900"
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (onTyping) onTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full bg-slate-800 text-white outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 rounded-full bg-emerald-600 disabled:bg-slate-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
