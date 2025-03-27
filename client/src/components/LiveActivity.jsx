import React from 'react';

export const LiveActivity = () => (
  <div className="p-4 bg-gradient-to-br from-cosmic to-stellar rounded-lg border border-nebula/30 backdrop-blur-lg">
    <h3 className="text-corona font-bold mb-4 pb-2 border-b border-nebula/30">
      Celestial Pulse
    </h3>

    <div className="space-y-4">
      {/* Contest Event */}
      <div className="p-3 rounded-lg border border-nebula/30 bg-cosmic/50">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 rounded-full bg-supernova text-cosmic text-xs font-bold">
            Contest
          </span>
        </div>
        <h4 className="text-stardust text-sm mb-2">Galactic UI Challenge</h4>
        <div className="space-y-2">
          <span className="block text-corona text-xs font-mono">48:35:12</span>
          <progress 
            className="w-full h-2 rounded-full bg-nebula/20 [&::-webkit-progress-bar]:bg-transparent
              [&::-webkit-progress-value]:bg-supernova [&::-moz-progress-bar]:bg-supernova"
            value="65" 
            max="100"
          />
        </div>
      </div>

      {/* Achievement Event */}
      <div className="p-3 rounded-lg border border-nebula/30 bg-cosmic/50">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 rounded-full bg-nebula text-stardust text-xs font-bold">
            Achievement
          </span>
        </div>
        <h4 className="text-stardust text-sm mb-2">
          NeptuneTeam solved Dark Matter Dilemma
        </h4>
        <span className="inline-block px-3 py-1 rounded-full border border-nebula/30 text-nebula text-xs">
          ★ Quantum Solver
        </span>
      </div>

      {/* Network Update */}
      <div className="p-3 rounded-lg border border-nebula/30 bg-cosmic/50">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 rounded-full bg-corona text-cosmic text-xs font-bold">
            Network
          </span>
        </div>
        <h4 className="text-stardust text-sm mb-2">
          100+ pilots joined #AstroPhysics
        </h4>
        <div className="h-px bg-gradient-to-r from-transparent via-supernova to-transparent animate-pulse" />
      </div>
    </div>
  </div>
);