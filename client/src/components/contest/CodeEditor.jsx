import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CodeEditor({ contestId, userId, problem, onSubmissionSuccess }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("dark");
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    handleLanguageChange({ target: { value: language } });
  }, []);

  // Sync scroll between textarea, highlight layer, and line numbers
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (textarea && highlight && lineNumbers) {
      const syncScroll = () => {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
        lineNumbers.scrollTop = textarea.scrollTop;
      };

      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, []);

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
        code,
        language,
      });

      if (res.data?.jobId) {
        toast.success("Solution submitted successfully! 🚀");
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit solution");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    const templates = {
      python: `def two_sum(nums, target):
    """
    Find two numbers in array that add up to target
    Time Complexity: O(n), Space Complexity: O(n)
    """
    hashmap = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    
    return []

# Test the function
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}")`,
      
      javascript: `/**
 * Two Sum - Find indices of two numbers that add up to target
 * @param {number[]} nums - Array of integers
 * @param {number} target - Target sum
 * @return {number[]} - Indices of the two numbers
 */
function twoSum(nums, target) {
    const hashMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (hashMap.has(complement)) {
            return [hashMap.get(complement), i];
        }
        
        hashMap.set(nums[i], i);
    }
    
    return [];
}

// Test the function
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log('Result:', result);`,
      
      java: `import java.util.*;

public class Solution {
    /**
     * Two Sum - Find indices of two numbers that add up to target
     * Time Complexity: O(n), Space Complexity: O(n)
     * @param nums Array of integers
     * @param target Target sum
     * @return Array of indices
     */
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> hashMap = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (hashMap.containsKey(complement)) {
                return new int[] { hashMap.get(complement), i };
            }
            
            hashMap.put(nums[i], i);
        }
        
        return new int[0];
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println("Result: " + Arrays.toString(result));
    }
}`,
      
      cpp: `#include <vector>
#include <unordered_map>
#include <iostream>
using namespace std;

class Solution {
public:
    /**
     * Two Sum - Find indices of two numbers that add up to target
     * Time Complexity: O(n), Space Complexity: O(n)
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hashMap;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (hashMap.find(complement) != hashMap.end()) {
                return {hashMap[complement], i};
            }
            
            hashMap[nums[i]] = i;
        }
        
        return {};
    }
};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "Result: [";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    
    return 0;
}`
    };
    
    setCode(templates[newLanguage] || "// Your solution here");
  };

  // Syntax highlighting function
  const highlightSyntax = (code, lang) => {
    if (!code) return '';

    let highlighted = code;

    const patterns = {
      python: {
        keywords: /\b(def|class|if|elif|else|for|while|in|import|from|return|try|except|finally|with|as|pass|break|continue|and|or|not|is|None|True|False|self|__init__|__main__)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /(#.*$)/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /(\w+)(?=\s*\()/g,
      },
      javascript: {
        keywords: /\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|default|try|catch|finally|throw|async|await|true|false|null|undefined|new|this)\b/g,
        strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /(\w+)(?=\s*\()/g,
      },
      java: {
        keywords: /\b(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|try|catch|finally|throw|throws|new|this|super|void|int|String|boolean|true|false|null|import|package)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /(\w+)(?=\s*\()/g,
      },
      cpp: {
        keywords: /\b(#include|using|namespace|std|class|public|private|protected|if|else|for|while|return|int|void|char|float|double|bool|true|false|nullptr|const|static|virtual|override|template|typename)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /(\w+)(?=\s*\()/g,
      }
    };

    const langPatterns = patterns[lang] || patterns.javascript;

    // Apply syntax highlighting
    highlighted = highlighted
      .replace(langPatterns.comments, '<span class="syntax-comment">$1</span>')
      .replace(langPatterns.strings, '<span class="syntax-string">$1</span>')
      .replace(langPatterns.keywords, '<span class="syntax-keyword">$1</span>')
      .replace(langPatterns.numbers, '<span class="syntax-number">$1</span>')
      .replace(langPatterns.functions, '<span class="syntax-function">$1</span>');

    return highlighted;
  };

  // Calculate line height
  const lineHeight = fontSize * 1.6;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex justify-between items-center p-4 bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 text-sm font-medium">Language:</label>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono transition-all duration-200"
            >
              <option value="python">🐍 Python</option>
              <option value="javascript">🟨 JavaScript</option>
              <option value="java">☕ Java</option>
              <option value="cpp">⚡ C++</option>
            </select>
          </div>

          {/* Font Size Control */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 text-sm font-medium">Size:</label>
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>

          {/* Connection Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            connected 
              ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30" 
              : "bg-red-900/30 text-red-300 border-red-500/30"
          }`}>
            <div className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            {connected ? "Connected" : "Offline"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => toast.success("Tests will run in Test Results panel below")}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-200 text-sm shadow-lg"
          >
            🧪 Run Tests
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              "🚀 Submit"
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers - Now properly synchronized */}
        <div className="w-16 bg-slate-800/50 border-r border-slate-700/50 flex flex-col shrink-0 overflow-hidden">
          <div 
            ref={lineNumbersRef}
            className="flex-1 overflow-hidden"
            style={{ 
              paddingTop: '16px',
              paddingBottom: '16px'
            }}
          >
            {code.split('\n').map((_, index) => (
              <div
                key={index}
                className="px-3 text-right text-slate-500 font-mono select-none"
                style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  height: `${lineHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlight Layer */}
          <div
            ref={highlightRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ 
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '16px',
              paddingBottom: '16px'
            }}
          >
            <pre
              className="font-mono text-transparent whitespace-pre-wrap break-words m-0"
              style={{ 
                fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", monospace',
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`
              }}
              dangerouslySetInnerHTML={{ 
                __html: highlightSyntax(code, language) 
              }}
            />
          </div>

          {/* Actual Textarea */}
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent text-slate-100 font-mono resize-none outline-none caret-white selection:bg-indigo-600/30 overflow-auto custom-scrollbar relative z-10 m-0"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your solution here..."
            style={{ 
              fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", monospace',
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              color: 'transparent',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '16px',
              paddingBottom: '16px'
            }}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Editor Footer */}
      <div className="flex justify-between items-center p-3 bg-slate-800/30 border-t border-slate-700/50 text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Spaces: 4</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Syntax Highlighting Styles */}
      <style jsx>{`
        .syntax-keyword {
          color: #c678dd;
          font-weight: 600;
        }
        .syntax-string {
          color: #a8e6cf;
        }
        .syntax-comment {
          color: #7c7c7c;
          font-style: italic;
        }
        .syntax-number {
          color: #d19a66;
        }
        .syntax-function {
          color: #61afef;
          font-weight: 500;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.9);
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgba(15, 23, 42, 0.3);
        }
      `}</style>
    </div>
  );
}