import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Editor, loader } from "@monaco-editor/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

export default function CodeEditor({ contestId, userId, problem, onSubmissionSuccess }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("space-theme");
  const editorRef = useRef(null);

  // Language templates with Monaco Editor language mappings
  const languageTemplates = useMemo(() => ({
    python: {
      monaco: "python",
      template: `def solution():
    # Write your solution here
    pass

# Test your function
if __name__ == "__main__":
    result = solution()
    print(result)`,
      comment: "#"
    },
    javascript: {
      monaco: "javascript", 
      template: `function solution() {
    // Write your solution here
    
}

// Test your function
console.log(solution());`,
      comment: "//"
    },
    java: {
      monaco: "java",
      template: `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution here
    }
    
    public void solution() {
        // Write your solution here
        
    }
}`,
      comment: "//"
    },
    cpp: {
      monaco: "cpp",
      template: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    void solution() {
        // Write your solution here
        
    }
};

int main() {
    Solution sol;
    // Test your solution here
    return 0;
}`,
      comment: "//"
    },
    c: {
      monaco: "c",
      template: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here
    
    return 0;
}`,
      comment: "//"
    }
  }), []);

  useEffect(() => {
    // Initialize Monaco Editor theme
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('space-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
          { token: 'string', foreground: '34d399' },
          { token: 'number', foreground: 'fbbf24' },
          { token: 'function', foreground: '60a5fa' },
          { token: 'variable', foreground: 'f3f4f6' },
          { token: 'type', foreground: 'c084fc' },
          { token: 'operator', foreground: 'f59e0b' }
        ],
        colors: {
          'editor.background': '#0f172a',
          'editor.foreground': '#f1f5f9',
          'editorLineNumber.foreground': '#475569',
          'editorLineNumber.activeForeground': '#3b82f6',
          'editor.selectionBackground': '#1e40af40',
          'editor.lineHighlightBackground': '#1e293b20',
          'editorCursor.foreground': '#3b82f6',
          'editor.selectionHighlightBackground': '#1e40af20',
          'editorIndentGuide.background': '#334155',
          'editorIndentGuide.activeBackground': '#475569',
          'scrollbarSlider.background': '#334155',
          'scrollbarSlider.hoverBackground': '#475569',
          'scrollbarSlider.activeBackground': '#64748b'
        }
      });
    });
  }, []);

  const handleLanguageChange = useCallback((e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    if (languageTemplates[newLanguage]) {
      setCode(languageTemplates[newLanguage].template);
    }
  }, [languageTemplates]);

  useEffect(() => {
    handleLanguageChange({ target: { value: language } });
  }, [language, handleLanguageChange]);

  // Monaco Editor configuration
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: fontSize,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: "on",
    theme: theme,
    padding: { top: 16, bottom: 16 },
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    bracketPairColorization: {
      enabled: true
    },
    guides: {
      bracketPairs: true,
      indentation: true
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // The theme is already defined in useEffect, just set it
    monaco.editor.setTheme('space-theme');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter your solution before submitting");
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:3001/api/contest/submit", {
        contestId,
        userId,
        problemId: problem?.id,
        code,
        language
      });

      if (res.data.success) {
        toast.success("Solution submitted successfully!");
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit solution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    if (!code.trim()) {
      toast.error("Please enter your solution before running tests");
      return;
    }

    setRunningTests(true);
    
    try {
      // Mock API call for running tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Tests completed! Check results below.");
    } catch (error) {
      console.error("Test run error:", error);
      toast.error("Failed to run tests. Please try again.");
    } finally {
      setRunningTests(false);
    }
  };

  const resetCode = () => {
    if (languageTemplates[language]) {
      setCode(languageTemplates[language].template);
    }
  };

  const getMonacoLanguage = () => {
    return languageTemplates[language]?.monaco || language;
  };

  return (
    <div className="h-full flex flex-col bg-eclipse-light dark:bg-space-void">
      {/* Editor Header Controls */}
      <div className="flex justify-between items-center p-4 bg-eclipse-surface/20 dark:bg-space-dark/20 border-b border-eclipse-border dark:border-space-gray shrink-0">
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-eclipse-text-light dark:text-space-text">
              Language:
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-3 py-1.5 bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray rounded-md text-eclipse-text-light dark:text-space-text text-sm focus:outline-none focus:ring-2 focus:ring-stellar-blue"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-eclipse-text-light dark:text-space-text">
              Font Size:
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                className="w-6 h-6 flex items-center justify-center bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray rounded text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border/50 dark:hover:bg-space-light/20 text-xs"
              >
                -
              </button>
              <span className="text-sm text-eclipse-text-light dark:text-space-text min-w-[2rem] text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="w-6 h-6 flex items-center justify-center bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray rounded text-eclipse-text-light dark:text-space-text hover:bg-eclipse-border/50 dark:hover:bg-space-light/20 text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-eclipse-text-light dark:text-space-text">
              Theme:
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1.5 bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray rounded-md text-eclipse-text-light dark:text-space-text text-sm focus:outline-none focus:ring-2 focus:ring-stellar-blue"
            >
              <option value="space-theme">Space Dark</option>
              <option value="vs-dark">VS Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-stellar-green rounded-full"></div>
            <span className="text-eclipse-muted-light dark:text-space-muted">Connected</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetCode}
            className="px-3 py-1.5 bg-eclipse-surface dark:bg-space-dark border border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-md hover:bg-eclipse-border/50 dark:hover:bg-space-light/20 text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getMonacoLanguage()}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={editorOptions}
          theme={theme}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center p-4 bg-eclipse-surface/20 dark:bg-space-dark/20 border-t border-eclipse-border dark:border-space-gray shrink-0">
        <div className="flex items-center gap-4 text-sm text-eclipse-muted-light dark:text-space-muted">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {language}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Run Tests Button */}
          <button
            onClick={handleRunTests}
            disabled={runningTests}
            className="px-4 py-2 bg-gradient-to-r from-stellar-green to-emerald-500 text-white rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-stellar-green-glow text-sm flex items-center gap-2"
          >
            {runningTests ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                🧪 Run Tests
              </>
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-stellar-blue-glow text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                🚀 Submit Solution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// PropTypes validation
CodeEditor.propTypes = {
  contestId: PropTypes.string,
  userId: PropTypes.string,
  problem: PropTypes.shape({
    id: PropTypes.string
  }),
  onSubmissionSuccess: PropTypes.func
};
