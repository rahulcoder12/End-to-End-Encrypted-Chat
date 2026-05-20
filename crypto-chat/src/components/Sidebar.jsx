// src/components/Sidebar.jsx

export default function Sidebar({ username, onlineUsers, selectedTarget, startChat }) {
  return (
    <div className="w-1/4 bg-[#111b21] border-r border-[#202c33] flex flex-col z-10">
      
      {/* Profile Header */}
      <div className="bg-[#202c33] p-4 flex items-center shadow-sm">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold mr-3 text-white">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="font-bold text-[#e9edef]">{username}</span>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold p-4 text-[#00a884] uppercase tracking-wide">Online Contacts</h2>
        
        {onlineUsers.length === 0 ? (
          <div className="text-gray-500 italic text-sm px-4">No one else is online...</div>
        ) : (
          onlineUsers.map(user => (
            <div 
              key={user}
              onClick={() => startChat(user)}
              className={`p-3 mx-2 rounded-lg cursor-pointer flex items-center transition-colors ${selectedTarget === user ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
            >
              <div className="w-12 h-12 bg-[#6b7c85] rounded-full flex items-center justify-center text-xl font-bold mr-4 text-white">
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 border-b border-[#202c33] pb-2">
                <h3 className="font-semibold text-[#e9edef] text-lg">{user}</h3>
                <p className="text-xs text-[#00a884] flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#00a884] inline-block"></span> Online
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}