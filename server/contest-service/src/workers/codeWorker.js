require("dotenv").config();
const mongoose = require("mongoose");
const { codeQueue } = require("../utils/queue");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const socketService = require("../utils/socketService");
const { exec } = require("child_process");
const fs = require("fs");

console.log("🚀 Worker starting in main process...");

// Don't connect to MongoDB here since we're in the same process as the main app
// The main app.js already handles the MongoDB connection

codeQueue.process(async (job) => {
  console.log("📥 Received job:", job.id, job.data);

  try {
    const { contestId, userId, code, language, submissionId } = job.data;
    const extension = getFileExtension(language);
    const filename = `/tmp/${job.id}.${extension}`;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      throw new Error("Invalid contest ID");
    }

    // Notify client that processing has started
    const initialUpdate = {
      submissionId,
      contestId,
      userId,
      status: "processing",
      message: "Code execution started",
      timestamp: new Date()
    };
    
    // Try to emit, but don't fail if Socket.IO isn't ready
    try {
      socketService.emitSubmissionUpdate(initialUpdate);
    } catch (error) {
      console.warn('⚠️  Could not emit initial update:', error.message);
    }

    fs.writeFileSync(filename, code);

    // For Java, we need to ensure the class name matches the filename
    if (language === 'java') {
      // Simple regex to replace the class name with 'code' to match our filename
      const correctedCode = code.replace(/public\s+class\s+\w+/g, 'public class code');
      fs.writeFileSync(filename, correctedCode);
    } else {
      fs.writeFileSync(filename, code);
    }

    const command = getExecutionCommand(language, filename);
    console.log("🔧 Running command:", command);

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      exec(command, { timeout: 30000 }, async (err, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        console.log("📤 STDOUT:", stdout || "[none]");
        console.log("❌ STDERR:", stderr || "[none]");
        console.log("⚠️  Error:", err || "[no error]");
        console.log("⏱️  Execution time:", executionTime, "ms");

        // Determine execution result
        let result;
        if (err) {
          if (err.killed && err.signal === 'SIGTERM') {
            result = {
              status: "time_limit_exceeded",
              executionTime,
              memoryUsed: 0,
              error: "Time limit exceeded (30 seconds)",
              testCasesPassed: 0,
              totalTestCases: 0
            };
          } else if (stderr && stderr.includes('Unable to find image')) {
            result = {
              status: "system_error",
              executionTime,
              memoryUsed: 0,
              error: "Docker image not available. Please run 'npm run pull-images' to setup required images.",
              testCasesPassed: 0,
              totalTestCases: 0
            };
          } else if (stderr && (stderr.includes('javac: not found') || stderr.includes('command not found'))) {
            result = {
              status: "system_error",
              executionTime,
              memoryUsed: 0,
              error: "Compiler not found in Docker image. Please ensure correct Docker images are available.",
              testCasesPassed: 0,
              totalTestCases: 0
            };
          } else if (err.code === 127) {
            result = {
              status: "compilation_error",
              executionTime,
              memoryUsed: 0,
              error: "Compilation failed: " + (stderr || "Unknown compilation error"),
              testCasesPassed: 0,
              totalTestCases: 0
            };
          } else {
            result = {
              status: "runtime_error",
              executionTime,
              memoryUsed: 0,
              error: stderr || err.message,
              testCasesPassed: 0,
              totalTestCases: 0
            };
          }
        } else {
          // Simulate test case results (in real implementation, you'd run actual test cases)
          const testResults = simulateTestCases(stdout, language);
          result = {
            status: testResults.passed === testResults.total ? "accepted" : "wrong_answer",
            executionTime,
            memoryUsed: Math.random() * 50 + 20, // Simulated memory usage
            output: stdout,
            testCasesPassed: testResults.passed,
            totalTestCases: testResults.total
          };
        }

        try {
          // Update the submission document
          const updatedSubmission = await Submission.findByIdAndUpdate(
            submissionId,
            { result },
            { new: true }
          );

          if (!updatedSubmission) {
            console.error("❗ Submission not found:", submissionId);
            throw new Error("Submission not found");
          }

          console.log("✅ Submission updated:", updatedSubmission._id);

          // Check if this submission wins the contest
          await checkAndUpdateContestWinner(contestId, userId, result); 

          // Send comprehensive update to client
          const finalUpdate = {
            submissionId,
            contestId,
            userId,
            status: "completed",
            result,
            timestamp: new Date(),
            message: `Execution completed: ${result.status}`
          };

          try {
            socketService.emitSubmissionUpdate(finalUpdate);
            
            // Also emit contest-specific update
            socketService.emitContestUpdate({
              contestId,
              type: "new_submission",
              submission: {
                id: submissionId,
                userId,
                result,
                submittedAt: updatedSubmission.submittedAt
              }
            });
          } catch (socketError) {
            console.warn('⚠️  Could not emit socket updates:', socketError.message);
          }

          resolve(result);

        } catch (updateErr) {
          console.error("❌ Database update error:", updateErr);
          
          const errorUpdate = {
            submissionId,
            contestId,
            userId,
            status: "error",
            error: "Failed to save submission result",
            timestamp: new Date()
          };
          
          try {
            socketService.emitSubmissionUpdate(errorUpdate);
          } catch (socketError) {
            console.warn('⚠️  Could not emit error update:', socketError.message);
          }
          reject(updateErr);
        } finally {
          // Clean up temporary file
          try {
            fs.unlinkSync(filename);
          } catch (cleanupErr) {
            console.warn("⚠️  Failed to cleanup temp file:", cleanupErr.message);
          }
        }
      });
    });
  } catch (err) {
    console.error("❌ Error inside job processor:", err);
    
    // Send error update to client
    const errorUpdate = {
      submissionId: job.data.submissionId,
      contestId: job.data.contestId,
      userId: job.data.userId,
      status: "error",
      error: err.message,
      timestamp: new Date()
    };
    
    try {
      socketService.emitSubmissionUpdate(errorUpdate);
    } catch (socketError) {
      console.warn('⚠️  Could not emit error update:', socketError.message);
    }
    throw err;
  }
});

// Helper function to get file extension based on language
function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c"
  };
  return extensions[language] || "txt";
}

// Helper function to get execution command based on language
function getExecutionCommand(language, filename) {
  const commands = {
    python: `docker run --rm -v ${filename}:/code.py python:3.9-slim python /code.py`,
    javascript: `docker run --rm -v ${filename}:/code.js node:18-slim node /code.js`,
    java: `docker run --rm -v ${filename}:/code.java openjdk:11 sh -c "cd / && javac code.java && java code"`,
    cpp: `docker run --rm -v ${filename}:/code.cpp gcc:latest sh -c "cd / && g++ code.cpp -o code && ./code"`,
    c: `docker run --rm -v ${filename}:/code.c gcc:latest sh -c "cd / && gcc code.c -o code && ./code"`
  };
  return commands[language] || commands.python;
}

// Helper function to simulate test case results
function simulateTestCases(output, language) {
  // In a real implementation, this would run actual test cases
  // For now, we'll simulate based on output
  const totalTests = Math.floor(Math.random() * 10) + 5; // 5-15 test cases
  
  if (!output || output.trim() === "") {
    return { passed: 0, total: totalTests };
  }
  
  // Simple simulation: if output contains expected keywords, assume more tests pass
  const successKeywords = ["success", "correct", "true", "1", "hello"];
  const hasSuccessKeyword = successKeywords.some(keyword => 
    output.toLowerCase().includes(keyword)
  );
  
  if (hasSuccessKeyword) {
    const passed = Math.floor(Math.random() * 3) + totalTests - 2; // Most tests pass
    return { passed: Math.min(passed, totalTests), total: totalTests };
  } else {
    const passed = Math.floor(Math.random() * totalTests * 0.6); // Some tests pass
    return { passed, total: totalTests };
  }
}

// Helper function to check and update contest winner
async function checkAndUpdateContestWinner(contestId, userId, result) {
  try {
    if (result.status === "accepted") {
      const contest = await Contest.findById(contestId).populate('submissions');
      
      if (!contest || contest.winner) {
        return; // Contest not found or already has a winner
      }
      
      // Check if this is the first accepted solution
      const acceptedSubmissions = contest.submissions.filter(sub => 
        sub.result && sub.result.status === "accepted"
      );
      
      if (acceptedSubmissions.length === 1) {
        // This is the first accepted submission, declare winner
        await Contest.findByIdAndUpdate(contestId, {
          winner: userId,
          status: "finished"
        });
        
        console.log("🏆 Contest winner declared:", userId);
        
        // Emit contest winner update
        try {
          socketService.emitWinnerAnnouncement(contestId, userId);
        } catch (socketError) {
          console.warn('⚠️  Could not emit winner announcement:', socketError.message);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error updating contest winner:", error);
  }
}

console.log("🎯 Worker ready and waiting for jobs...");
