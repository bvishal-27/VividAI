function Sidebar() {
  return (
    <div className="w-64 h-full bg-gray-800 flex flex-col p-4 shrink-0">
      {/* Logo */}
      <div className="text-xl font-bold text-white mb-6">
         VividAI💻
      </div>

      {/* New chat button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-6 transition-colors">
        + New Chat
      </button>

      {/* Chat history list — empty for now */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-500 text-sm">No chats yet</p>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
        Settings
      </div>
    </div>
  )
}

export default Sidebar