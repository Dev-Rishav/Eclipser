import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSocket } from "../../contexts/SocketContext";
import { API_CONFIG } from "../../config/api";

export default function CodeSubmitForm({ onSubmissionSuccess }) {
  const [code, setCode] = useState('print("Hello World")');
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loadingContests, setLoadingContests] = useState(true);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  const { connected, joinContest, joinUserRoom, getSubmissionStatus } = useSocket();

  // Fetch contests and users on component mount
  useEffect(() => {
    fetchContests();
    fetchUsers();
  }, []);

  // Watch for submission updates
  useEffect(() => {
    if (currentSubmission) {
      const status = getSubmissionStatus(currentSubmission);
      if (status && status.status === 'completed') {
        setLoading(false);
        setCurrentSubmission(null);
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      }
    }
  }, [currentSubmission, getSubmissionStatus, onSubmissionSuccess]);

  const fetchContests = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.CONTEST_BASE_URL}/api/contest/all`);
      setContests(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedContest("686271a4adfb8d473d4ca20c");  //!Bruteforce selection
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast.error("Failed to load contests");
    } finally {
      setLoadingContests(false);
    }
  };

  const fetchUsers = () => {
    // Mock users for demo - in real app, this would come from an API
    const mockUsers = [
      { id: "user_22222", name: "Alice Johnson" },
      { id: "user_67890", name: "Bob Smith" },
      { id: "user_11111", name: "Charlie Brown" },
      { id: "user_33333", name: "Edward Norton" },
    ];
    setUsers(mockUsers);
    setSelectedUser(mockUsers[0].id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter code before submitting");
      return;
    }

    if (!selectedContest) {
      toast.error("Please select a contest");
      return;
    }

    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    
    // Join contest and user rooms for real-time updates
    joinContest(selectedContest);
    joinUserRoom(selectedUser);
    
    try {
      const res = await axios.post(`${API_CONFIG.CONTEST_BASE_URL}/api/contest/submit`, {
        contestId: selectedContest,
        userId: selectedUser,
        code,
        language,
      });

      // console.log("Submission response:", res.data);
      
      if (res.data?.submissionId) {
        toast.success(`Code submitted successfully! Submission ID: ${res.data.submissionId.slice(-8)}`);
        console.log(`Code submitted successfully! Submission ID: ${res.data.submissionId.slice(-8)}`);
        setCurrentSubmission(res.data.submissionId);
        
        // Clear the form after successful submission
        setCode(language === "python" ? 'print("Hello World")' : "// Your code here");
        // setLoading(false);  //!check logic for clearing code
      } else {
        toast.error("Submission failed - no submission ID received");
        setLoading(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "Failed to submit code");
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Set default code based on language
    switch (newLanguage) {
      case "python":
        setCode('print("Hello World")');
        break;
      case "javascript":
        setCode('console.log("Hello World");');
        break;
      case "java":
        setCode(`public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`);
        break;
      case "cpp":
        setCode(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}`);
        break;
      default:
        setCode("// Your code here");
    }
  };

  return (
    <div className="bg-gradient-to-br from-stellar to-cosmic rounded-xl p-6 border border-nebula/30 backdrop-blur-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-corona font-orbitron text-xl">Submit Your Code</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          connected 
            ? "bg-green-900/30 text-green-300 border border-green-500/30" 
            : "bg-red-900/30 text-red-300 border border-red-500/30"
        }`}>
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Contest and User Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-stardust text-sm mb-2 block">Contest</label>
            {loadingContests ? (
              <div className="w-full p-3 bg-cosmic border border-nebula/30 rounded-lg text-stardust/50">
                Loading contests...
              </div>
            ) : (
              <select
                value={selectedContest}
                onChange={(e) => setSelectedContest(e.target.value)}
                className="w-full p-3 bg-cosmic border border-nebula/30 rounded-lg text-stardust focus:ring-2 focus:ring-corona focus:border-transparent"
                required
              >
                <option value="">Select a contest</option>
                {contests.map((contest) => (
                  <option key={contest._id} value={contest._id}>
                    {contest.problemId} - {contest.status} ({contest.users?.length || 0} participants)
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="text-stardust text-sm mb-2 block">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-3 bg-cosmic border border-nebula/30 rounded-lg text-stardust focus:ring-2 focus:ring-corona focus:border-transparent"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="text-stardust text-sm mb-2 block">Programming Language</label>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="w-full p-3 bg-cosmic border border-nebula/30 rounded-lg text-stardust focus:ring-2 focus:ring-corona focus:border-transparent"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Code Editor */}
        <div>
          <label className="text-stardust text-sm mb-2 block">Code</label>
          <textarea
            className="w-full h-64 p-4 bg-cosmic border border-nebula/30 rounded-lg text-stardust font-mono text-sm focus:ring-2 focus:ring-corona focus:border-transparent resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here..."
          />
        </div>

        {/* Submit Button */}
        <button 
          className={`w-full py-3 px-6 rounded-lg font-semibold text-cosmic transition-all duration-200 ${
            loading 
              ? "bg-gray-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-nebula to-supernova hover:brightness-110 hover:scale-105"
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Code"}
        </button>
      </form>
    </div>
  );
}