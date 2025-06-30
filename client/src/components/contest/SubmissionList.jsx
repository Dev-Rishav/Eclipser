import { useEffect, useState } from "react";
import axios from "axios";

export default function SubmissionList() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const contestId = "686271a4adfb8d473d4ca20e";
        const res = await axios.get(`http://localhost:3001/api/contest/${contestId}/submissions`);
        console.log("Fetched submissions:", res.data);
        
        if (!res.data) {
          console.warn("No submissions found");
          return;
        }
        setSubmissions(res.data.reverse());
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-600 bg-green-100";
      case "time_limit_exceeded":
        return "text-yellow-600 bg-yellow-100";
      case "runtime_error":
      case "compilation_error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return "✅";
      case "time_limit_exceeded":
        return "⏰";
      case "runtime_error":
        return "💥";
      case "compilation_error":
        return "🔧";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-stardust">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-stardust/70">
        No submissions found for this contest.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-corona font-bold text-lg mb-4">Contest Submissions</h3>
      
      {submissions.map((sub, idx) => (
        <div 
          key={sub._id || idx} 
          className="border border-nebula/30 p-6 rounded-lg bg-gradient-to-br from-stellar to-cosmic backdrop-blur-lg"
        >
          {/* Header with submission info */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="text-stardust font-mono text-sm">
                ID: {sub._id}
              </div>
              <div className="text-stardust text-sm">
                User: {sub.userId}
              </div>
            </div>
            <div className="text-stardust/70 text-sm">
              {formatDate(sub.submittedAt)}
            </div>
          </div>

          {/* Language and Status */}
          <div className="flex items-center gap-4 mb-4">
            <div className="px-3 py-1 bg-nebula text-cosmic rounded-full text-sm font-semibold">
              {sub.language.toUpperCase()}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(sub.result?.status)}`}>
              {getStatusIcon(sub.result?.status)} {sub.result?.status?.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {/* Result Details */}
          {sub.result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-stellar/50 p-3 rounded border border-nebula/20">
                <div className="text-stardust/70 text-xs">Test Cases</div>
                <div className="text-corona font-bold">
                  {sub.result.testCasesPassed || 0} / {sub.result.totalTestCases || 0}
                </div>
              </div>
              
              <div className="bg-stellar/50 p-3 rounded border border-nebula/20">
                <div className="text-stardust/70 text-xs">Execution Time</div>
                <div className="text-corona font-bold">
                  {sub.result.executionTime || 0}ms
                </div>
              </div>
              
              <div className="bg-stellar/50 p-3 rounded border border-nebula/20">
                <div className="text-stardust/70 text-xs">Memory Used</div>
                <div className="text-corona font-bold">
                  {sub.result.memoryUsed || 0} MB
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {sub.result?.error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
              <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
              <div className="text-red-300 text-sm font-mono">
                {sub.result.error}
              </div>
            </div>
          )}

          {/* Code Block */}
          <div className="mb-4">
            <div className="text-stardust/70 text-sm mb-2">Code:</div>
            <div className="bg-cosmic/80 border border-nebula/30 rounded p-4 overflow-x-auto">
              <pre className="text-stardust font-mono text-sm whitespace-pre-wrap">
                {sub.code}
              </pre>
            </div>
          </div>

          {/* Output (if available) */}
          {sub.result?.output && (
            <div>
              <div className="text-stardust/70 text-sm mb-2">Output:</div>
              <div className="bg-cosmic/50 border border-nebula/20 rounded p-3">
                <pre className="text-stardust/80 font-mono text-xs whitespace-pre-wrap">
                  {sub.result.output}
                </pre>
              </div>
            </div>
          )}

          {/* Version info */}
          <div className="mt-4 pt-3 border-t border-nebula/20">
            <div className="text-stardust/50 text-xs">
              Version: {sub.__v}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}