require("dotenv").config();
const mongoose = require("mongoose");
const { codeQueue } = require("../utils/queue");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const socketService = require("../utils/socketService");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Lightweight Worker starting (AWS Free Tier optimized)...");

// Create secure execution directory
const EXEC_DIR = '/tmp/code-exec';
if (!fs.existsSync(EXEC_DIR)) {
  fs.mkdirSync(EXEC_DIR, { recursive: true });
}

codeQueue.process(async (job) => {
  console.log("📥 Received job:", job.id, job.data);

  try {
    const { contestId, userId, code, language, submissionId } = job.data;
    const filename = path.join(EXEC_DIR, `${job.id}.${getFileExtension(language)}`);

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
    
    try {
      socketService.emitSubmissionUpdate(initialUpdate);
    } catch (error) {
      console.warn('⚠️  Could not emit initial update:', error.message);
    }

    // Write code to file with security measures
    const secureCode = sanitizeCode(code, language);
    fs.writeFileSync(filename, secureCode, { mode: 0o644 });

    const command = getDirectExecutionCommand(language, filename);
    console.log("🔧 Running command:", command);

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Use spawn for better resource control
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10000, // Reduced timeout for free tier
        cwd: EXEC_DIR,
        env: {
          ...process.env,
          PATH: process.env.PATH,
          // Limit memory usage
          NODE_OPTIONS: '--max-old-space-size=128'
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Prevent memory issues with large outputs
        if (stdout.length > 10000) {
          child.kill('SIGTERM');
          stderr += 'Output too large, execution terminated';
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > 5000) {
          child.kill('SIGTERM');
        }
      });

      child.on('close', async (code, signal) => {
        const executionTime = Date.now() - startTime;
        
        console.log("📤 STDOUT:", stdout || "[none]");
        console.log("❌ STDERR:", stderr || "[none]");
        console.log("⚠️  Exit code:", code, "Signal:", signal);
        console.log("⏱️  Execution time:", executionTime, "ms");

        // Determine execution result
        let result = processExecutionResult(code, signal, stdout, stderr, executionTime, language);

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

      child.on('error', (err) => {
        console.error("❌ Spawn error:", err);
        reject(err);
      });
    });
  } catch (err) {
    console.error("❌ Error inside job processor:", err);
    
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

// Helper functions
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

function getDirectExecutionCommand(language, filename) {
  const commands = {
    python: `python3 ${filename}`,
    javascript: `node ${filename}`,
    java: `javac ${filename} && java -cp ${path.dirname(filename)} ${path.basename(filename, '.java')}`,
    cpp: `g++ ${filename} -o ${filename}.out && ${filename}.out`,
    c: `gcc ${filename} -o ${filename}.out && ${filename}.out`
  };
  return commands[language] || commands.python;
}

function sanitizeCode(code, language) {
  // Basic security: remove dangerous operations
  const dangerousPatterns = [
    /import\s+os/g,
    /import\s+subprocess/g,
    /import\s+sys/g,
    /require\s*\(\s*['"]fs['"]\s*\)/g,
    /require\s*\(\s*['"]child_process['"]\s*\)/g,
    /System\.exit/g,
    /Runtime\.getRuntime/g,
    /#include\s*<stdlib\.h>/g,
    /system\s*\(/g
  ];

  let sanitized = code;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '// BLOCKED: Potentially dangerous operation');
  });

  return sanitized;
}

function processExecutionResult(exitCode, signal, stdout, stderr, executionTime, language) {
  if (signal === 'SIGTERM') {
    return {
      status: "time_limit_exceeded",
      executionTime,
      memoryUsed: 0,
      error: "Time limit exceeded (10 seconds)",
      testCasesPassed: 0,
      totalTestCases: 0
    };
  }

  if (exitCode !== 0) {
    return {
      status: stderr.includes('compilation terminated') ? "compilation_error" : "runtime_error",
      executionTime,
      memoryUsed: 0,
      error: stderr || "Unknown error",
      testCasesPassed: 0,
      totalTestCases: 0
    };
  }

  // Simulate test case results
  const testResults = simulateTestCases(stdout, language);
  return {
    status: testResults.passed === testResults.total ? "accepted" : "wrong_answer",
    executionTime,
    memoryUsed: Math.random() * 20 + 5, // Lower simulated memory usage
    output: stdout,
    testCasesPassed: testResults.passed,
    totalTestCases: testResults.total
  };
}

function simulateTestCases(output, language) {
  const totalTests = Math.floor(Math.random() * 5) + 3; // 3-8 test cases (reduced)
  
  if (!output || output.trim() === "") {
    return { passed: 0, total: totalTests };
  }
  
  const successKeywords = ["success", "correct", "true", "1", "hello"];
  const hasSuccessKeyword = successKeywords.some(keyword => 
    output.toLowerCase().includes(keyword)
  );
  
  if (hasSuccessKeyword) {
    const passed = Math.floor(Math.random() * 2) + totalTests - 1;
    return { passed: Math.min(passed, totalTests), total: totalTests };
  } else {
    const passed = Math.floor(Math.random() * totalTests * 0.5);
    return { passed, total: totalTests };
  }
}

async function checkAndUpdateContestWinner(contestId, userId, result) {
  try {
    if (result.status === "accepted") {
      const contest = await Contest.findById(contestId).populate('submissions');
      
      if (!contest || contest.winner) {
        return;
      }
      
      const acceptedSubmissions = contest.submissions.filter(sub => 
        sub.result && sub.result.status === "accepted"
      );
      
      if (acceptedSubmissions.length === 1) {
        await Contest.findByIdAndUpdate(contestId, {
          winner: userId,
          status: "finished"
        });
        
        console.log("🏆 Contest winner declared:", userId);
        
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

console.log("🎯 Lightweight Worker ready and waiting for jobs...");
