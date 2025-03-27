import React from 'react';

export const ChatPreview = () => (
  <div className="p-4 bg-gradient-to-br from-cosmic to-stellar rounded-lg border border-nebula/30 backdrop-blur-lg">
    <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
      Quantum Comm
    </h3>

    <div className="space-y-4 mb-4">
      {/* Chat Item */}
      <div className="flex items-start p-3 rounded-lg border border-nebula/30 hover:bg-nebula/10 transition-colors cursor-pointer">
        {/* Avatar */}
        <div className="relative mr-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-nebula to-supernova text-cosmic font-bold">
            SP
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-cosmic" />
        </div>

        {/* Chat Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-stardust text-sm font-medium truncate">SpaceProbe</h4>
          <p className="text-stardust/80 text-sm truncate mt-1">
            What about the orbital calculation...
          </p>
          <span className="text-nebula text-xs font-mono mt-1 block">
            2.4 ly ago
          </span>
        </div>
      </div>
    </div>

    <button className="w-full py-2 px-4 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg
      font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-corona">
      Initiate Wormhole Chat
    </button>
  </div>
);