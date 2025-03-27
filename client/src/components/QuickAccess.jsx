import React from 'react';

export const QuickAccess = () => (
  <div className="p-4 bg-gradient-to-br from-cosmic/90 to-stellar/90 rounded-lg border border-nebula/30 backdrop-blur-lg">
    <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
      Orbital Shortcuts
    </h3>

    {/* Pinned Contacts */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center p-2 rounded-md hover:bg-nebula/10 transition-colors cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-nebula to-supernova text-cosmic font-bold mr-3">
          JS
        </div>
        <span className="text-stardust text-sm">JohnStella</span>
      </div>
      <div className="flex items-center p-2 rounded-md hover:bg-nebula/10 transition-colors cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-nebula to-supernova text-cosmic font-bold mr-3">
          MQ
        </div>
        <span className="text-stardust text-sm">MarsQuest</span>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-nebula/30 my-4" />

    {/* Bookmarks */}
    <div className="space-y-2">
      <button className="w-full flex items-center px-3 py-2 text-stardust text-sm rounded-md 
        border border-nebula/30 hover:border-nebula/50 hover:bg-nebula/10 
        transition-all">
        <span className="text-supernova mr-2">✦</span>
        Saved Solutions
      </button>
      <button className="w-full flex items-center px-3 py-2 text-stardust text-sm rounded-md 
        border border-nebula/30 hover:border-nebula/50 hover:bg-nebula/10 
        transition-all">
        <span className="text-supernova mr-2">✦</span>
        Mission Drafts
      </button>
    </div>
  </div>
);