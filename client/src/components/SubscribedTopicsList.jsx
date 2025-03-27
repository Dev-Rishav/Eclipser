import React from 'react';

export const SubscribedTopicsList = () => (
  <div className="p-4 bg-gradient-to-br from-cosmic-primary/90 to-stellar-secondary/90 rounded-lg border border-nebula/30 backdrop-blur-lg">
    <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
      Your Topics
    </h3>
    
    <ul className="space-y-2 mb-4">
      <li className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-nebula/10 transition-all cursor-pointer group">
        <span className="text-stardust text-sm">#WebDev</span>
        <span className="bg-supernova text-cosmic text-xs font-bold px-2 py-1 rounded-full">
          3
        </span>
      </li>
      {/* Add more topics with same structure */}
      <li className="flex justify-between items-center px-3 py-2 rounded-md hover:bg-nebula/10 transition-all cursor-pointer group">
        <span className="text-stardust text-sm">#AI</span>
        <span className="bg-supernova text-cosmic text-xs font-bold px-2 py-1 rounded-full">
          12
        </span>
      </li>
    </ul>

    <button className="w-full py-2 px-4 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-md 
      font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-corona">
      + Join New Topic
    </button>
  </div>
);