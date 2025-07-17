import { useState, useEffect } from "react";

export default function Leaderboard({ contestId, currentUser }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock leaderboard data
    setTimeout(() => {
      const mockData = [
        {
          rank: 1,
          userId: "user_11111",
          username: "CodeMaster",
          score: 1000,
          solvedAt: "2024-01-15T10:30:00Z",
          attempts: 1,
          status: "accepted"
        },
        {
          rank: 2,
          userId: "user_22222", // Current user
          username: "Alice Johnson",
          score: 950,
          solvedAt: "2024-01-15T10:45:00Z",
          attempts: 2,
          status: "accepted"
        },
        {
          rank: 3,
          userId: "user_33333",
          username: "DevNinja",
          score: 900,
          solvedAt: "2024-01-15T11:00:00Z",
          attempts: 3,
          status: "accepted"
        },
        {
          rank: 4,
          userId: "user_44444",
          username: "ByteWarrior",
          score: 750,
          solvedAt: null,
          attempts: 5,
          status: "wrong_answer"
        },
        {
          rank: 5,
          userId: "user_55555",
          username: "StackOverflow",
          score: 0,
          solvedAt: null,
          attempts: 0,
          status: "not_attempted"
        }
      ];
      setLeaderboardData(mockData);
      setLoading(false);
    }, 1000);
  }, [contestId]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-400"; // Gold
      case 2:
        return "text-gray-300"; // Silver
      case 3:
        return "text-amber-600"; // Bronze
      default:
        return "text-stardust";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-300 bg-green-900/30";
      case "wrong_answer":
        return "text-red-300 bg-red-900/30";
      case "time_limit_exceeded":
        return "text-yellow-300 bg-yellow-900/30";
      case "not_attempted":
        return "text-gray-300 bg-gray-900/30";
      default:
        return "text-stardust bg-stellar/30";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corona"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-stardust/70 text-sm">
          Live Rankings • Updates every 30 seconds
        </div>
        <div className="text-stardust/70 text-sm">
          {leaderboardData.length} participants
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboardData.map((participant, idx) => (
          <div
            key={participant.userId}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              participant.userId === currentUser.id
                ? "border-corona/50 bg-corona/10 shadow-lg"
                : "border-nebula/30 bg-stellar/30 hover:bg-stellar/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`text-xl font-bold ${getRankColor(participant.rank)} min-w-[2rem] text-center`}>
                  {participant.rank === 1 && "🥇"}
                  {participant.rank === 2 && "🥈"}
                  {participant.rank === 3 && "🥉"}
                  {participant.rank > 3 && `#${participant.rank}`}
                </div>

                {/* User Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-stardust font-semibold">
                      {participant.username}
                    </span>
                    {participant.userId === currentUser.id && (
                      <span className="px-2 py-1 bg-corona/20 text-corona text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-stardust/60 text-sm">
                    {participant.userId}
                  </div>
                </div>

                {/* Status */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(participant.status)}`}>
                  {participant.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {/* Score and Stats */}
              <div className="text-right">
                <div className="text-corona font-bold text-lg">
                  {participant.score}
                </div>
                <div className="text-stardust/60 text-sm space-x-3">
                  <span>⏱️ {formatTime(participant.solvedAt)}</span>
                  <span>🔄 {participant.attempts} attempts</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-nebula/30">
        <div className="text-center text-stardust/60 text-sm">
          Rankings are based on score and solve time. Good luck! 🚀
        </div>
      </div>
    </div>
  );
}