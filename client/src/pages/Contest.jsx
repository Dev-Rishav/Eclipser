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
  const [submissionStatus, setSubmissionStatus] = useState(null);
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
      <div className="min-h-screen bg-gradient-to-b from-space-void via-space-dark to-space-void flex items-center justify-center relative overflow-hidden">
        {/* Aerospace Loading Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/10 via-transparent to-stellar-purple/10"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-blue/50 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-purple/50 to-transparent animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-6 relative">
          {/* Mission Loading Indicator */}
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-stellar-blue/30 border-t-stellar-blue mx-auto shadow-stellar-blue-glow"></div>
            <div className="absolute inset-4 animate-spin rounded-full h-12 w-12 border-2 border-stellar-purple/30 border-t-stellar-purple shadow-stellar-purple-glow" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <p className="text-stellar-blue text-xl font-bold uppercase tracking-wider animate-pulse">
              INITIALIZING MISSION
            </p>
            <p className="text-space-muted text-sm font-mono">
              Loading contest parameters...
            </p>
          </div>
          
          {/* System Status Indicators */}
          <div className="flex justify-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-green rounded-full animate-pulse shadow-stellar-green-glow"></div>
              <span className="text-xs text-space-muted font-mono">COMMS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-blue rounded-full animate-pulse shadow-stellar-blue-glow"></div>
              <span className="text-xs text-space-muted font-mono">NAV</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-stellar-orange rounded-full animate-pulse shadow-stellar-orange-glow"></div>
              <span className="text-xs text-space-muted font-mono">SYS</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-b from-space-void via-space-dark to-space-void text-space-text flex flex-col relative overflow-hidden">
        {/* Aerospace Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/5 via-transparent to-stellar-purple/5"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-blue/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stellar-purple/50 to-transparent"></div>
        </div>

        {/* Mission Control Header */}
        <div className="relative border-b-2 border-stellar-blue/30 bg-gradient-to-r from-space-darker/80 via-space-dark/90 to-space-darker/80 backdrop-blur-xl shrink-0 shadow-stellar-blue-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/5 via-stellar-purple/5 to-stellar-blue/5"></div>
          <div className="relative max-w-full mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              {/* Mission Info Panel */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-stellar-green animate-pulse shadow-stellar-green-glow"></div>
                  <h1 className="text-2xl font-bold text-space-text tracking-wider uppercase">
                    <span className="text-stellar-blue">MISSION:</span> {contest?.title || "CODING CONTEST"}
                  </h1>
                </div>
                <div className="flex items-center gap-6 text-space-muted text-sm font-mono">
                  <div className="flex items-center gap-2 px-3 py-1 bg-space-dark/50 rounded border border-stellar-blue/30">
                    <span className="w-2 h-2 bg-stellar-blue rounded-full animate-pulse"></span>
                    <span>PILOT: {user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-space-dark/50 rounded border border-stellar-orange/30">
                    <span className="w-2 h-2 bg-stellar-orange rounded-full animate-pulse"></span>
                    <span>TARGET: {problem?.title || contest?.problemId}</span>
                  </div>
                </div>
              </div>
              
              {/* Control Panel */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="relative px-6 py-3 bg-gradient-to-r from-stellar-blue/20 to-stellar-purple/20 text-stellar-blue border-2 border-stellar-blue/50 rounded-lg font-bold hover:bg-gradient-to-r hover:from-stellar-blue/30 hover:to-stellar-purple/30 hover:border-stellar-blue/70 transition-all duration-300 text-sm shadow-stellar-blue-glow uppercase tracking-wide animate-edge-glow"
                >
                  <span className="flex items-center gap-2">
                    🏆 MISSION STATUS
                  </span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-stellar-purple rounded-full animate-pulse shadow-stellar-purple-glow"></div>
                </button>
                
                {contest && (
                  <div className="px-4 py-2 bg-space-darker border-2 border-stellar-green/50 rounded-lg shadow-stellar-green-glow">
                    <ContestTimer 
                      startTime={contest.startTime}
                      endTime={contest.endTime}
                      status={contest.status}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cockpit Main Console - Multi-Panel Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Navigation Grid Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-stellar-blue/30 via-transparent to-stellar-purple/30"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-stellar-blue/30 via-transparent to-stellar-purple/30"></div>
          </div>

          {/* Left Navigation Panel - Problem/Submissions */}
          <div className="w-1/2 flex flex-col border-r-2 border-stellar-blue/30 bg-gradient-to-b from-space-dark/30 to-space-darker/30 backdrop-blur-sm relative">
            {/* Panel Status Indicator */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-stellar-green rounded-full animate-pulse shadow-stellar-green-glow z-10"></div>
            
            {/* Left Control Tabs */}
            <div className="border-b-2 border-stellar-blue/30 bg-gradient-to-r from-space-darker/60 to-space-dark/60 backdrop-blur-lg shrink-0 relative">
              <div className="absolute inset-0 bg-stellar-blue/5"></div>
              <div className="relative px-8 py-2">
                <div className="flex space-x-2">
                  {leftTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLeftTab(tab.id)}
                      className={`px-6 py-3 text-sm font-bold transition-all duration-300 border-b-3 uppercase tracking-wide relative ${
                        leftTab === tab.id
                          ? 'border-stellar-blue text-stellar-blue bg-stellar-blue/10 shadow-stellar-blue-glow'
                          : 'border-transparent text-space-muted hover:text-stellar-blue hover:border-stellar-blue/50 hover:bg-stellar-blue/5'
                      }`}
                    >
                      {tab.icon && <span className="mr-2">{tab.icon}</span>}
                      {tab.label}
                      {leftTab === tab.id && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-stellar-blue rounded-full shadow-stellar-blue-glow"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Left Mission Console Content */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-space-dark/20 to-space-darker/20">
              <div className="h-full overflow-y-auto p-8 space-scrollbar">
                {leftTab === "problem" && (
                  <div className="border-2 border-stellar-blue/30 rounded-lg p-6 bg-space-darker/50 backdrop-blur-sm shadow-stellar-blue-glow">
                    <ProblemStatement problem={problem} contest={contest} />
                  </div>
                )}
                
                {leftTab === "submissions" && (
                  <div className="border-2 border-stellar-purple/30 rounded-lg p-6 bg-space-darker/50 backdrop-blur-sm shadow-stellar-purple-glow">
                    <MySubmissions 
                      ref={submissionsRef}
                      contestId={contestId}
                      userId={user.id}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Command Panel - Code Editor & Diagnostics */}
          <div className="w-1/2 flex flex-col bg-gradient-to-b from-space-dark/30 to-space-darker/30 backdrop-blur-sm relative">
            {/* Panel Status Indicator */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-stellar-orange rounded-full animate-pulse shadow-stellar-orange-glow z-10"></div>
            
            {/* Code Editor Cockpit Panel */}
            <div className="flex-1 flex flex-col min-h-0 border-2 border-stellar-orange/30 m-4 rounded-lg bg-space-darker/50 backdrop-blur-sm shadow-stellar-orange-glow relative overflow-hidden">
              {/* Editor Control Bar */}
              <div className="border-b-2 border-stellar-orange/30 bg-gradient-to-r from-space-darker/80 to-space-dark/80 backdrop-blur-lg shrink-0 relative">
                <div className="absolute inset-0 bg-stellar-orange/5"></div>
                <div className="relative px-6 py-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-stellar-orange text-lg font-bold uppercase tracking-wider flex items-center gap-3">
                      <div className="w-3 h-3 bg-stellar-orange rounded-full animate-pulse shadow-stellar-orange-glow"></div>
                      COMMAND INTERFACE
                    </h3>
                    <div className="flex items-center gap-4">
                      {problem?.difficulty && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border-2 ${
                          problem.difficulty === 'easy' ? 'bg-stellar-green/10 text-stellar-green border-stellar-green/50 shadow-stellar-green-glow' :
                          problem.difficulty === 'medium' ? 'bg-stellar-orange/10 text-stellar-orange border-stellar-orange/50 shadow-stellar-orange-glow' :
                          'bg-red-500/10 text-red-300 border-red-500/50'
                        }`}>
                          THREAT LVL: {problem.difficulty.toUpperCase()}
                        </span>
                      )}
                      {submissionStatus && (
                        <span className="text-xs font-mono px-3 py-1 rounded-full border-2 flex items-center gap-2 animate-pulse"
                              style={{
                                backgroundColor: submissionStatus === 'Running' ? 'rgba(255, 165, 0, 0.1)' : 
                                               submissionStatus === 'Accepted' ? 'rgba(34, 255, 34, 0.1)' : 'rgba(255, 69, 0, 0.1)',
                                borderColor: submissionStatus === 'Running' ? 'rgba(255, 165, 0, 0.5)' : 
                                           submissionStatus === 'Accepted' ? 'rgba(34, 255, 34, 0.5)' : 'rgba(255, 69, 0, 0.5)',
                                color: submissionStatus === 'Running' ? '#FFA500' : 
                                      submissionStatus === 'Accepted' ? '#22FF22' : '#FF4500'
                              }}>
                          <div className="w-2 h-2 rounded-full animate-pulse"
                               style={{backgroundColor: submissionStatus === 'Running' ? '#FFA500' : 
                                                      submissionStatus === 'Accepted' ? '#22FF22' : '#FF4500'}}></div>
                          STATUS: {submissionStatus.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Editor - Mission Critical Interface */}
              <div className="flex-1 overflow-hidden bg-space-void/30 relative">
                <CodeEditor 
                  contestId={contestId}
                  userId={user.id}
                  problem={problem}
                  onSubmissionSuccess={handleSubmissionSuccess}
                />
                {/* Overlay Grid Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(123, 104, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 104, 238, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Diagnostics Panel - Test Results */}
            <div className="h-80 border-2 border-stellar-purple/30 m-4 mt-0 rounded-lg bg-space-darker/50 backdrop-blur-sm shadow-stellar-purple-glow flex flex-col relative">
              {/* Diagnostics Control Bar */}
              <div className="border-b-2 border-stellar-purple/30 bg-gradient-to-r from-space-darker/80 to-space-dark/80 backdrop-blur-lg shrink-0 relative">
                <div className="absolute inset-0 bg-stellar-purple/5"></div>
                <div className="relative px-6 py-3">
                  <h3 className="text-stellar-purple text-lg font-bold uppercase tracking-wider flex items-center gap-3">
                    <div className="w-3 h-3 bg-stellar-purple rounded-full animate-pulse shadow-stellar-purple-glow"></div>
                    SYSTEM DIAGNOSTICS
                  </h3>
                </div>
              </div>

              {/* Test Results Console */}
              <div className="flex-1 overflow-hidden bg-space-void/30 relative">
                <div className="h-full overflow-y-auto p-6 space-scrollbar">
                  <TestResults />
                </div>
                {/* Overlay Scan Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168, 85, 247, 0.1) 2px, rgba(168, 85, 247, 0.1) 4px)',
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Mission Status Modal - Leaderboard */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-space-void/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-space-darker/90 to-space-dark/90 rounded-2xl border-2 border-stellar-blue/50 backdrop-blur-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-stellar-blue-glow-lg relative">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b-2 border-stellar-blue/30 bg-gradient-to-r from-stellar-blue/10 to-stellar-purple/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/5 via-stellar-purple/5 to-stellar-blue/5"></div>
                <h2 className="relative text-2xl text-stellar-blue font-bold uppercase tracking-wide flex items-center gap-4">
                  <div className="w-4 h-4 bg-stellar-blue rounded-full animate-pulse shadow-stellar-blue-glow"></div>
                  MISSION STATUS BOARD
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="relative text-stellar-blue hover:text-stellar-purple transition-colors text-2xl p-2 rounded-lg border-2 border-stellar-blue/30 hover:border-stellar-purple/30 bg-space-dark/50 hover:bg-space-darker/50 shadow-stellar-blue-glow"
                >
                  ✕
                </button>
              </div>
              
              {/* Leaderboard Content */}
              <div className="overflow-y-auto space-scrollbar bg-space-void/30 relative">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-stellar-blue/5 via-transparent to-stellar-purple/5"></div>
                </div>
                <div className="relative">
                  <Leaderboard contestId={contestId} />
                </div>
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
      <div className="space-y-6">
        <div className="text-center py-12 text-space-muted">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-stellar-purple/30 flex items-center justify-center bg-stellar-purple/10">
              <span className="text-2xl">🧪</span>
            </div>
            <p className="font-mono text-sm uppercase tracking-wider">
              AWAITING TEST SEQUENCE
            </p>
            <p className="text-xs text-space-dim">
              Execute test protocols via command interface
            </p>
          </div>
        </div>
        
        {/* Mission Demo Control */}
        <div className="text-center">
          <button
            onClick={() => setTestResults(mockResults)}
            className="px-6 py-3 bg-gradient-to-r from-stellar-purple/20 to-stellar-blue/20 text-stellar-purple border-2 border-stellar-purple/50 rounded-lg font-bold hover:bg-gradient-to-r hover:from-stellar-purple/30 hover:to-stellar-blue/30 hover:border-stellar-purple/70 transition-all duration-300 uppercase tracking-wide shadow-stellar-purple-glow animate-pulse"
          >
            INITIATE DEMO SEQUENCE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mission Status Overview */}
      <div className="bg-space-darker/50 rounded-lg border-2 border-stellar-purple/30 p-4 shadow-stellar-purple-glow relative">
        <div className="absolute top-2 right-2 w-2 h-2 bg-stellar-green rounded-full animate-pulse shadow-stellar-green-glow"></div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-space-text">
            <span className="text-3xl font-bold text-stellar-green font-mono">{testResults.passed}</span>
            <span className="text-space-muted font-mono">/{testResults.total} PROTOCOLS VERIFIED</span>
          </div>
          <div className="w-32 h-4 bg-space-void rounded-full overflow-hidden border border-stellar-purple/30">
            <div 
              className="h-full bg-gradient-to-r from-stellar-green to-stellar-blue transition-all duration-1000 shadow-stellar-green-glow"
              style={{ width: `${(testResults.passed / testResults.total) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-space-muted font-mono uppercase tracking-wider">
          MISSION SUCCESS RATE: {Math.round((testResults.passed / testResults.total) * 100)}%
        </div>
      </div>

      {/* Test Sequence Results */}
      <div className="space-y-3">
        {testResults.results.map((result, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-2 backdrop-blur-sm relative ${
            result.passed 
              ? 'bg-stellar-green/10 border-stellar-green/40 shadow-stellar-green-glow' 
              : 'bg-red-500/10 border-red-500/40 shadow-sm'
          }`}>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{
              backgroundColor: result.passed ? '#22FF22' : '#FF4500',
              boxShadow: result.passed ? '0 0 10px rgba(34, 255, 34, 0.5)' : '0 0 10px rgba(255, 69, 0, 0.5)'
            }}></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-space-text font-mono uppercase tracking-wider">
                SEQUENCE #{idx + 1}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded border font-mono uppercase tracking-wide ${
                result.passed 
                  ? 'text-stellar-green border-stellar-green/50 bg-stellar-green/10' 
                  : 'text-red-400 border-red-500/50 bg-red-500/10'
              }`}>
                {result.passed ? 'VERIFIED' : 'FAILED'}
              </span>
            </div>
            
            <div className="font-mono text-xs space-y-3 bg-space-void/50 p-3 rounded border border-stellar-purple/20">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-stellar-blue font-bold">INPUT DATA:</span> 
                  <div className="text-space-text ml-2 bg-space-darker/50 p-2 rounded mt-1 border border-stellar-blue/20">
                    {result.input}
                  </div>
                </div>
                <div>
                  <span className="text-stellar-purple font-bold">TARGET OUTPUT:</span> 
                  <div className="text-space-text ml-2 bg-space-darker/50 p-2 rounded mt-1 border border-stellar-purple/20">
                    {result.expected}
                  </div>
                </div>
                <div>
                  <span className="text-stellar-orange font-bold">SYSTEM OUTPUT:</span> 
                  <div className="text-space-text ml-2 bg-space-darker/50 p-2 rounded mt-1 border border-stellar-orange/20">
                    {result.actual}
                  </div>
                </div>
                {result.error && (
                  <div>
                    <span className="text-red-400 font-bold">ERROR LOG:</span> 
                    <div className="text-red-300 ml-2 bg-red-900/20 p-2 rounded mt-1 border border-red-500/30">
                      {result.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mission Control Actions */}
      <div className="flex gap-4 pt-6 border-t-2 border-stellar-purple/20">
        <button
          onClick={() => setRunningTests(true)}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-stellar-blue/20 to-stellar-purple/20 text-stellar-blue border-2 border-stellar-blue/50 rounded-lg font-bold hover:bg-gradient-to-r hover:from-stellar-blue/30 hover:to-stellar-purple/30 hover:border-stellar-blue/70 transition-all duration-300 uppercase tracking-wide shadow-stellar-blue-glow"
        >
          🔄 RE-EXECUTE SEQUENCE
        </button>
        <button
          onClick={() => setTestResults(null)}
          className="px-6 py-3 bg-space-darker/50 border-2 border-space-gray/50 text-space-text rounded-lg hover:bg-space-light/20 hover:border-space-gray/70 transition-all duration-300 uppercase tracking-wide font-bold"
        >
          CLEAR LOG
        </button>
      </div>

      {/* Aerospace Cockpit Custom Styling */}
      <style>
        {`
        /* Enhanced Space Scrollbars */
        .space-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .space-scrollbar::-webkit-scrollbar-track {
          background: rgba(10, 11, 14, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(123, 104, 238, 0.2);
        }
        .space-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgb(123, 104, 238), rgb(168, 85, 247));
          border-radius: 8px;
          border: 2px solid rgba(10, 11, 14, 0.3);
          box-shadow: 0 0 10px rgba(123, 104, 238, 0.3);
        }
        .space-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgb(147, 129, 255), rgb(192, 109, 255));
          box-shadow: 0 0 15px rgba(123, 104, 238, 0.5);
        }

        /* HUD Animation Effects */
        @keyframes radarSweep {
          0% { transform: rotate(0deg); opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }
        
        @keyframes dataStream {
          0% { transform: translateY(100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }

        /* Mission Critical Glows */
        .mission-critical {
          animation: missionPulse 3s ease-in-out infinite;
        }
        
        @keyframes missionPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(123, 104, 238, 0.5), 
                       0 0 40px rgba(123, 104, 238, 0.2),
                       inset 0 0 20px rgba(123, 104, 238, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(123, 104, 238, 0.8), 
                       0 0 60px rgba(123, 104, 238, 0.4),
                       inset 0 0 30px rgba(123, 104, 238, 0.2);
          }
        }

        /* Cockpit Panel Borders */
        .cockpit-border {
          position: relative;
        }
        .cockpit-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            rgba(123, 104, 238, 0.5) 0%,
            rgba(168, 85, 247, 0.5) 25%,
            rgba(255, 69, 0, 0.5) 50%,
            rgba(168, 85, 247, 0.5) 75%,
            rgba(123, 104, 238, 0.5) 100%);
          border-radius: inherit;
          z-index: -1;
          animation: borderGlow 4s linear infinite;
        }
        
        @keyframes borderGlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 400% 0%; }
        }
        `}
      </style>
    </div>
  );
}