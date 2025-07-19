import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSocket } from "../../contexts/SocketContext";
import { API_CONFIG } from "../../config/api.js";

const SubmissionList = forwardRef((props, ref) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [loadingContests, setLoadingContests] = useState(true);

  const { connected, joinContest, submissions: socketSubmissions } = useSocket();

  // Fetch contests on mount
  useEffect(() => {
    fetchContests();
  }, []);

  // Update submissions when socket receives new data
  useEffect(() => {
    if (socketSubmissions.length > 0) {
      setSubmissions(prev => {
        const updated = [...prev];
        socketSubmissions.forEach(socketSub => {
          const existingIndex = updated.findIndex(sub => sub._id === socketSub.submissionId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              result: socketSub.result,
              status: socketSub.status
            };
          }
        });
        return updated.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      });
    }
  }, [socketSubmissions]);

  const fetchContests = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.CONTEST_BASE_URL}/api/contest/all`);
      setContests(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedContest(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast.error("Failed to load contests");
    } finally {
      setLoadingContests(false);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    if (!selectedContest) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_CONFIG.CONTEST_BASE_URL}/api/contest/${selectedContest}/submissions`);
      console.log("Fetched submissions:", res.data);
      
      if (!res.data || !Array.isArray(res.data)) {
        console.warn("No submissions found or invalid response format");
        setSubmissions([]);
        return;
      }
      
      const sortedSubmissions = res.data.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      
      setSubmissions(sortedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err.response?.data?.error || "Failed to fetch submissions");
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [selectedContest]);

  // Fetch submissions when contest changes
  useEffect(() => {
    if (selectedContest) {
      fetchSubmissions();
      joinContest(selectedContest);
    }
  }, [selectedContest, fetchSubmissions, joinContest]);

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchSubmissions
  }));

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "text-green-300 bg-green-900/30 border-green-500/30";
      case "time_limit_exceeded":
        return "text-yellow-300 bg-yellow-900/30 border-yellow-500/30";
      case "runtime_error":
        return "text-red-300 bg-red-900/30 border-red-500/30";
      case "compilation_error":
        return "text-orange-300 bg-orange-900/30 border-orange-500/30";
      case "wrong_answer":
        return "text-purple-300 bg-purple-900/30 border-purple-500/30";
      case "pending":
      case "running":
        return "text-blue-300 bg-blue-900/30 border-blue-500/30";
      default:
        return "text-gray-300 bg-gray-900/30 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "✅";
      case "time_limit_exceeded":
        return "⏰";
      case "runtime_error":
        return "💥";
      case "compilation_error":
        return "🔧";
      case "wrong_answer":
        return "❌";
      case "pending":
        return "⏳";
      case "running":
        return "🔄";
      default:
        return "❓";
    }
  };

  const getLanguageIcon = (language) => {
    switch (language?.toLowerCase()) {
      case "python":
        return "🐍";
      case "javascript":
        return "🟨";
      case "java":
        return "☕";
      case "cpp":
      case "c++":
        return "⚡";
      default:
        return "💻";
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-stellar to-cosmic rounded-xl p-8 border border-nebula/30 backdrop-blur-lg">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corona"></div>
          <span className="ml-3 text-stardust">Loading quantum submissions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-stellar to-cosmic rounded-xl p-6 border border-red-500/30 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="text-red-300">
            <h3 className="font-semibold mb-1">Error Loading Submissions</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg hover:brightness-110"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-corona font-orbitron text-xl">Contest Submissions</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            connected 
              ? "bg-green-900/30 text-green-300 border border-green-500/30" 
              : "bg-red-900/30 text-red-300 border border-red-500/30"
          }`}>
            {connected ? "🟢 Live" : "🔴 Offline"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {loadingContests ? (
            <div className="text-stardust/50 text-sm">Loading contests...</div>
          ) : (
            <select
              value={selectedContest}
              onChange={(e) => setSelectedContest(e.target.value)}
              className="px-3 py-1 bg-cosmic border border-nebula/30 rounded text-stardust text-sm"
            >
              <option value="">Select Contest</option>
              {contests.map((contest) => (
                <option key={contest._id} value={contest._id}>
                  {contest.problemId} - {contest.status}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-gradient-to-r from-nebula to-supernova text-cosmic rounded-lg hover:brightness-110 text-sm"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-gradient-to-br from-stellar to-cosmic rounded-xl p-12 border border-nebula/30 backdrop-blur-lg text-center">
          <div className="text-stardust/70 text-lg">
            No quantum transmissions detected for this contest
          </div>
          <div className="text-stardust/50 text-sm mt-2">
            Submit your first solution to see results here
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub, idx) => (
            <div 
              key={sub._id || idx} 
              className="border border-nebula/30 p-6 rounded-xl bg-gradient-to-br from-stellar to-cosmic backdrop-blur-lg hover:border-nebula/50 transition-all duration-200"
            >
              {/* Header with submission info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-stardust/70 font-mono text-xs">
                    ID: {sub._id?.slice(-8) || "N/A"}
                  </div>
                  <div className="text-stardust text-sm font-medium">
                    👤 {sub.userId || "Anonymous"}
                  </div>
                </div>
                <div className="text-stardust/60 text-sm">
                  🕒 {formatDate(sub.submittedAt)}
                </div>
              </div>

              {/* Language and Status */}
              <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-2 bg-nebula/20 border border-nebula/30 text-stardust rounded-full text-sm font-semibold">
                  {getLanguageIcon(sub.language)} {sub.language?.toUpperCase() || "UNKNOWN"}
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(sub.result?.status)}`}>
                  {getStatusIcon(sub.result?.status)} {sub.result?.status?.replace(/_/g, ' ').toUpperCase() || "UNKNOWN"}
                </div>
              </div>

              {/* Result Metrics */}
              {sub.result && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-stellar/30 p-4 rounded-lg border border-nebula/20">
                    <div className="text-stardust/70 text-xs uppercase tracking-wide">Test Cases</div>
                    <div className="text-corona font-bold text-lg mt-1">
                      {sub.result.testCasesPassed || 0} / {sub.result.totalTestCases || 0}
                    </div>
                    <div className="w-full bg-cosmic/50 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-nebula to-supernova h-2 rounded-full"
                        style={{ 
                          width: `${sub.result.totalTestCases ? (sub.result.testCasesPassed / sub.result.totalTestCases) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-stellar/30 p-4 rounded-lg border border-nebula/20">
                    <div className="text-stardust/70 text-xs uppercase tracking-wide">Execution Time</div>
                    <div className="text-corona font-bold text-lg mt-1">
                      {sub.result.executionTime || 0}ms
                    </div>
                  </div>
                  
                  <div className="bg-stellar/30 p-4 rounded-lg border border-nebula/20">
                    <div className="text-stardust/70 text-xs uppercase tracking-wide">Memory Used</div>
                    <div className="text-corona font-bold text-lg mt-1">
                      {sub.result.memoryUsed || 0} MB
                    </div>
                  </div>

                  <div className="bg-stellar/30 p-4 rounded-lg border border-nebula/20">
                    <div className="text-stardust/70 text-xs uppercase tracking-wide">Version</div>
                    <div className="text-corona font-bold text-lg mt-1">
                      v{sub.__v || 0}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {sub.result?.error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-2 flex items-center">
                    🚨 Error Details:
                  </div>
                  <div className="text-red-300 text-sm font-mono bg-red-900/10 p-3 rounded border border-red-500/20">
                    {sub.result.error}
                  </div>
                </div>
              )}

              {/* Code Block */}
              <div className="mb-6">
                <div className="text-stardust/70 text-sm mb-3 flex items-center">
                  💻 Source Code:
                </div>
                <div className="bg-cosmic/80 border border-nebula/30 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-stardust font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {sub.code || "No code available"}
                  </pre>
                </div>
              </div>

              {/* Output */}
              {sub.result?.output && (
                <div className="mb-4">
                  <div className="text-stardust/70 text-sm mb-3 flex items-center">
                    📤 Output:
                  </div>
                  <div className="bg-cosmic/50 border border-nebula/20 rounded-lg p-4">
                    <pre className="text-stardust/80 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                      {sub.result.output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SubmissionList.displayName = "SubmissionList";

export default SubmissionList;