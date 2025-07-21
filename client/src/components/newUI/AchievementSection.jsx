import { TrophyIcon } from "@heroicons/react/24/solid";

export const AchievementSection = ({ badges }) => {
  return (
    <div className="bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 rounded-2xl p-8 border-2 border-stellar-orange/30 backdrop-blur-xl shadow-stellar-orange-glow">
      <h3 className="text-xl font-bold text-stellar-orange uppercase tracking-wide font-mono mb-6">
        Commendations & Honors
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges?.map((badge) => (
          <div key={badge._id} className="bg-space-darker/50 rounded-lg p-4 border border-stellar-orange/30 text-center">
            <TrophyIcon className="w-10 h-10 text-stellar-orange mx-auto mb-2"/>
            <h4 className="text-sm font-bold text-white uppercase font-mono">{badge.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};