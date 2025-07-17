import { useState } from "react";

export default function ProblemStatement({ problem, contest }) {
  const [showHint, setShowHint] = useState(false);

  if (!problem) {
    return (
      <div className="text-center py-8 text-stardust/70">
        Problem statement loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-orbitron text-corona font-bold">
            {problem.title}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              problem.difficulty === 'easy' ? 'bg-green-900/30 text-green-300' :
              problem.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
              'bg-red-900/30 text-red-300'
            }`}>
              {problem.difficulty?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Resource Limits */}
        <div className="flex gap-4 text-sm text-stardust/60">
          <span>⏱️ {problem.timeLimit || 1000}ms</span>
          <span>💾 {problem.memoryLimit || 128}MB</span>
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-stellar/30 rounded-lg p-4 border border-nebula/20">
        <div className="text-stardust leading-relaxed">
          {problem.description}
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-4">
        <h3 className="text-corona font-semibold text-lg">Examples</h3>
        
        {problem.examples?.map((example, idx) => (
          <div key={idx} className="bg-cosmic/30 border border-nebula/20 rounded-lg p-4">
            <div className="text-stardust/80 text-sm font-semibold mb-3">
              Example {idx + 1}:
            </div>
            <div className="font-mono text-sm space-y-2">
              <div>
                <span className="text-stardust/60">Input:</span> 
                <span className="text-stardust ml-2">{example.input}</span>
              </div>
              <div>
                <span className="text-stardust/60">Output:</span> 
                <span className="text-stardust ml-2">{example.output}</span>
              </div>
              {example.explanation && (
                <div>
                  <span className="text-stardust/60">Explanation:</span> 
                  <span className="text-stardust/80 ml-2">{example.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-3">
        <h3 className="text-corona font-semibold text-lg">Constraints</h3>
        <div className="bg-stellar/30 rounded-lg p-4 border border-nebula/20">
          <ul className="text-stardust/80 space-y-1 list-disc list-inside">
            {problem.constraints?.map((constraint, idx) => (
              <li key={idx} className="font-mono text-sm">{constraint}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sample Test Cases */}
      <div className="space-y-3">
        <h3 className="text-corona font-semibold text-lg">Sample Test Cases</h3>
        <div className="space-y-2">
          {problem.testCases?.filter(tc => tc.status === 'sample').map((testCase, idx) => (
            <div key={idx} className="bg-cosmic/30 border border-nebula/20 rounded-lg p-3">
              <div className="text-stardust/70 text-xs mb-1">Test Case {idx + 1}</div>
              <div className="font-mono text-sm text-stardust space-y-1">
                <div>
                  <span className="text-green-300">✓ Input:</span> {testCase.input}
                </div>
                <div>
                  <span className="text-green-300">Expected:</span> {testCase.expected}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="space-y-3">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-supernova hover:text-corona transition-colors text-sm font-medium"
        >
          💡 {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        {showHint && (
          <div className="bg-supernova/10 border border-supernova/30 rounded-lg p-4">
            <div className="text-stardust/80 text-sm">
              {problem.hint}
            </div>
          </div>
        )}
      </div>

      {/* Contest Info */}
      <div className="bg-stellar/30 rounded-lg p-4 border border-nebula/20">
        <h3 className="text-corona font-semibold text-lg mb-3">Contest Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stardust/70">Participants:</span>
            <span className="text-stardust">{contest?.users?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stardust/70">Status:</span>
            <span className={`font-semibold ${
              contest?.status === 'running' ? 'text-green-300' :
              contest?.status === 'pending' ? 'text-yellow-300' :
              'text-red-300'
            }`}>
              {contest?.status?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stardust/70">Languages:</span>
            <span className="text-stardust">Python, Java, C++, JavaScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}