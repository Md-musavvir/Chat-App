import { useState } from "react";

import axios from "axios";

function GroupModal({ close, fetchChats }) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [members, setMembers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = async () => {
    if (!search.trim()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setIsSearching(true);
    setError("");

    try {
      const { data } = await axios.get(
        `http://localhost:9000/api/v1/user/getUser?search=${search}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      setResults(data.data);
    } catch {
      setError("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (members.length === 0) {
      setError("Please add at least one member");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setIsCreating(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:9000/api/v1/chat/creategroup",
        {
          groupName: groupName.trim(),
          usersList: JSON.stringify(members.map((m) => m._id)),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        },
      );

      fetchChats();
      close();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const addMember = (user) => {
    if (!members.find((m) => m._id === user._id)) {
      setMembers([...members, user]);
      setResults([]);
      setSearch("");
    }
  };

  const removeMember = (userId) => {
    setMembers(members.filter((m) => m._id !== userId));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchUsers();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fade-in">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>

        <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Group
              </h2>
              <button
                onClick={close}
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-center group"
              >
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
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
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Group Name
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Add Members
              </label>

              <div className="relative mb-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search users..."
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
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

            {results.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto custom-scrollbar bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="p-2">
                  {results.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => addMember(u)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {u.username}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {members.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 max-h-32 overflow-y-auto custom-scrollbar">
                  {members.map((m) => (
                    <span
                      key={m._id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    >
                      <span className="text-sm">{m.username}</span>
                      <button
                        onClick={() => removeMember(m._id)}
                        className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-center text-red-400 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={createGroup}
                disabled={isCreating}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isCreating ? "Creating..." : "Create Group"}
              </button>

              <button
                onClick={close}
                disabled={isCreating}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

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
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default GroupModal;
