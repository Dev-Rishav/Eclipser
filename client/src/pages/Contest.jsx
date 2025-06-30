import { useRef } from "react";
import CodeSubmitForm from "../components/contest/CodeSubmitForm";
import SubmissionList from "../components/contest/SubmissionList";
import { SocketProvider } from "../contexts/SocketContext";

export default function Contest() {
  const submissionListRef = useRef();

  const handleSubmissionSuccess = () => {
    // Refresh submissions when new code is submitted
    if (submissionListRef.current) {
      submissionListRef.current.refresh();
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-cosmic to-stellar p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-orbitron text-corona font-bold">
              🚀 Quantum Code Arena
            </h1>
            <p className="text-stardust/80 text-lg">
              Submit your algorithms to the cosmic compiler and track your results in real-time
            </p>
          </div>

          {/* Code Submission Form */}
          <CodeSubmitForm onSubmissionSuccess={handleSubmissionSuccess} />

          {/* Divider */}
          <div className="border-t border-nebula/30"></div>

          {/* Submissions List */}
          <SubmissionList ref={submissionListRef} />
        </div>
      </div>
    </SocketProvider>
  );
}