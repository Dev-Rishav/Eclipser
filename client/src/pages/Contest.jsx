import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
import ProblemStatement from "../components/contest/ProblemStatement";
import CodeEditor from "../components/contest/CodeEditor";
import Leaderboard from "../components/contest/Leaderboard";
import MySubmissions from "../components/contest/SubmissionList";
import ContestTimer from "../components/contest/ContestTimer";
import { SocketProvider } from "../contexts/SocketContext";

export default function Contest() {
  const { contestId } = useParams();
  const [leftTab, setLeftTab] = useState("problem");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [contest, setContest] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState({ id: "user_22222", name: "Alice Johnson" });
  const submissionsRef = useRef();

  useEffect(() => {
    // Mock problem data
    const mockProblem = {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      timeLimit: 1000,
      memoryLimit: 128,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        },
        {
          input: "nums = [3,3], target = 6",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
        }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹",
        "Only one valid answer exists."
      ],
      hint: "Try using a hash map to store the complement of each number as you iterate through the array.",
      testCases: [
        { input: "[2,7,11,15], 9", expected: "[0,1]", status: "sample" },
        { input: "[3,2,4], 6", expected: "[1,2]", status: "sample" },
        { input: "[3,3], 6", expected: "[0,1]", status: "hidden" }
      ]
    };

    setTimeout(() => {
      setContest({
        id: contestId || "contest_123",
        title: "Weekly Contest #47",
        status: "running",
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        problemId: "two-sum",
        users: ["user_22222", "user_11111", "user_33333", "user_44444"]
      });
      setProblem(mockProblem);
      setLoading(false);
    }, 500);
  }, [contestId]);

  const handleSubmissionSuccess = () => {
    if (submissionsRef.current) {
      submissionsRef.current.refresh();
    }
  };

  const leftTabs = [
    { id: "problem", label: "Problem", icon: "📋" },
    { id: "submissions", label: "My Submissions", icon: "📊" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-eclipse-light dark:bg-space-void flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-stellar-blue mx-auto mb-4"></div>
          <div className="text-eclipse-text-light dark:text-space-text text-lg">Loading contest arena...</div>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text flex flex-col">
        {/* Header */}
        <div className="border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/20 dark:bg-space-dark/20 backdrop-blur-lg shrink-0">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-eclipse-text-light dark:text-space-text">
                  🚀 {contest?.title || "Coding Contest"}
                </h1>
                <div className="flex items-center gap-2 text-eclipse-muted-light dark:text-space-muted text-sm">
                  <span>👤 {user.name}</span>
                  <span>•</span>
                  <span>Problem: {problem?.title || contest?.problemId}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-4 py-2 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-semibold hover:brightness-110 transition-all duration-200 text-sm shadow-stellar-blue-glow"
                >
                  🏆 Leaderboard
                </button>
                
                {contest && (
                  <ContestTimer 
                    startTime={contest.startTime}
                    endTime={contest.endTime}
                    status={contest.status}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Problem/Submissions */}
          <div className="w-1/2 flex flex-col border-r border-eclipse-border dark:border-space-gray">
            {/* Left Tabs */}
            <div className="border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/10 dark:bg-space-dark/10 backdrop-blur-lg shrink-0">
              <div className="px-6">
                <div className="flex space-x-1">
                  {leftTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLeftTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                        leftTab === tab.id
                          ? "text-stellar-blue border-stellar-blue bg-stellar-blue/10"
                          : "text-eclipse-muted-light dark:text-space-muted border-transparent hover:text-eclipse-text-light dark:hover:text-space-text hover:bg-eclipse-border/10 dark:hover:bg-space-light/10"
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Left Content - Independently Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-6 space-scrollbar">
                {leftTab === "problem" && (
                  <ProblemStatement problem={problem} contest={contest} />
                )}
                
                {leftTab === "submissions" && (
                  <MySubmissions 
                    ref={submissionsRef}
                    contestId={contestId}
                    userId={user.id}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Code Editor + Test Results */}
          <div className="w-1/2 flex flex-col">
            {/* Code Editor Section */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Editor Header */}
              <div className="border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/10 dark:bg-space-dark/10 backdrop-blur-lg shrink-0">
                <div className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-eclipse-text-light dark:text-space-text text-lg font-bold">
                      💻 Code Editor
                    </h3>
                    <div className="text-eclipse-muted-light dark:text-space-muted text-sm">
                      {problem?.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          problem.difficulty === 'easy' ? 'bg-stellar-green/20 text-stellar-green border border-stellar-green/30' :
                          problem.difficulty === 'medium' ? 'bg-stellar-orange/20 text-stellar-orange border border-stellar-orange/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {problem.difficulty.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Editor - Independently Scrollable */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor 
                  contestId={contestId}
                  userId={user.id}
                  problem={problem}
                  onSubmissionSuccess={handleSubmissionSuccess}
                />
              </div>
            </div>

            {/* Test Results Section - Fixed Height */}
            <div className="h-80 border-t border-eclipse-border dark:border-space-gray flex flex-col">
              {/* Test Results Header */}
              <div className="border-b border-eclipse-border dark:border-space-gray bg-eclipse-surface/10 dark:bg-space-dark/10 backdrop-blur-lg shrink-0">
                <div className="px-6 py-3">
                  <h3 className="text-eclipse-text-light dark:text-space-text text-lg font-bold">
                    🧪 Test Results
                  </h3>
                </div>
              </div>

              {/* Test Results Content - Independently Scrollable */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-6 space-scrollbar">
                  <TestResults />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-eclipse-surface dark:bg-space-dark rounded-xl border border-eclipse-border dark:border-space-gray backdrop-blur-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-eclipse-border dark:border-space-gray">
                <h2 className="text-2xl text-eclipse-text-light dark:text-space-text font-bold">
                  🏆 Contest Leaderboard
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-eclipse-text-light dark:text-space-text hover:text-stellar-blue transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-scrollbar">
                <Leaderboard contestId={contestId} currentUser={user} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>
        {`
        .space-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .space-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.2);
          border-radius: 4px;
        }
        .space-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));
          border-radius: 4px;
        }
        .space-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247));
        }
        `}
      </style>
    </SocketProvider>
  );
}

// New TestResults Component
function TestResults() {
  const [testResults, setTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);

  // Mock test results for demo
  const mockResults = {
    passed: 2,
    total: 3,
    results: [
      { input: "[2,7,11,15], 9", expected: "[0,1]", actual: "[0,1]", passed: true },
      { input: "[3,2,4], 6", expected: "[1,2]", actual: "[1,2]", passed: true },
      { input: "[3,3], 6", expected: "[0,1]", actual: "[0,1]", passed: false, error: "Time limit exceeded" }
    ]
  };

  if (runningTests) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-blue mx-auto mb-4"></div>
        <div className="text-eclipse-text-light dark:text-space-text">Running test cases...</div>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-eclipse-muted-light dark:text-space-muted">
          Click &quot;Run Tests&quot; in the code editor to see how your solution performs against sample test cases
        </div>
        
        {/* Demo Button */}
        <div className="text-center">
          <button
            onClick={() => setTestResults(mockResults)}
            className="px-4 py-2 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-semibold hover:brightness-110 shadow-stellar-blue-glow"
          >
            🧪 Show Demo Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-eclipse-text-light dark:text-space-text">
          <span className="text-2xl font-bold text-stellar-blue">{testResults.passed}</span>
          <span className="text-eclipse-muted-light dark:text-space-muted">/{testResults.total} passed</span>
        </div>
        <div className="w-32 h-3 bg-eclipse-border dark:bg-space-darker rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-stellar-green to-stellar-blue transition-all duration-500"
            style={{ width: `${(testResults.passed / testResults.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Individual Test Results */}
      <div className="space-y-3">
        {testResults.results.map((result, idx) => (
          <div key={idx} className={`p-4 rounded-lg border ${
            result.passed 
              ? 'bg-stellar-green/10 border-stellar-green/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-eclipse-text-light dark:text-space-text">
                Test Case {idx + 1}
              </span>
              <span className={`text-sm font-semibold ${
                result.passed ? 'text-stellar-green' : 'text-red-400'
              }`}>
                {result.passed ? '✅ Passed' : '❌ Failed'}
              </span>
            </div>
            
            <div className="font-mono text-xs space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-eclipse-muted-light dark:text-space-muted">Input:</span> 
                  <span className="text-eclipse-text-light dark:text-space-text ml-2">{result.input}</span>
                </div>
                <div>
                  <span className="text-eclipse-muted-light dark:text-space-muted">Expected:</span> 
                  <span className="text-eclipse-text-light dark:text-space-text ml-2">{result.expected}</span>
                </div>
                <div>
                  <span className="text-eclipse-muted-light dark:text-space-muted">Your Output:</span> 
                  <span className="text-eclipse-text-light dark:text-space-text ml-2">{result.actual}</span>
                </div>
                {result.error && (
                  <div>
                    <span className="text-red-400">Error:</span> 
                    <span className="text-red-300 ml-2">{result.error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-eclipse-border/20 dark:border-space-gray/20">
        <button
          onClick={() => setRunningTests(true)}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-semibold hover:brightness-110 shadow-stellar-blue-glow"
        >
          🔄 Run Again
        </button>
        <button
          onClick={() => setTestResults(null)}
          className="px-4 py-2 bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-lg hover:bg-eclipse-border/50 dark:hover:bg-space-light/20"
        >
          Clear
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>
        {`
        .space-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .space-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.2);
          border-radius: 4px;
        }
        .space-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));
          border-radius: 4px;
        }
        .space-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247));
        }
        `}
      </style>
    </div>
  );
}