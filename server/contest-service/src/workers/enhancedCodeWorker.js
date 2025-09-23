require("dotenv").config();
const mongoose = require("mongoose");
const { codeQueue } = require("../utils/queue");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const socketService = require("../utils/socketService");
const DockerExecutor = require("../services/dockerExecutor");

console.log("🚀 Enhanced Docker-based Code Worker starting...");

// Initialize Docker executor
const dockerExecutor = new DockerExecutor();

// Check Docker availability on startup
dockerExecutor.checkDockerAvailability().then(available => {
  if (available) {
    console.log("✅ Docker is available");
  } else {
    console.warn("⚠️ Docker is not available - falling back to basic execution");
  }
});

codeQueue.process('execute-code', async (job) => {
  console.log(`🏃 Processing submission job ${job.id} - Docker execution starting...`);
  const startTime = Date.now();

  try {
    const { contestId, userId, code, language, submissionId, testCases, timeLimit, memoryLimit } = job.data;

    // Validate inputs
    if (!contestId || !submissionId || !code || !language) {
      throw new Error("Missing required job data");
    }

    console.log(`📋 Job details: Contest ${contestId}, Submission ${submissionId}, Language ${language}`);

    // Update submission status to running
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'running',
      judgeTime: new Date()
    });

    // Notify user that execution started
    socketService.emitToUser(userId, 'submission_update', {
      submissionId,
      contestId,
      status: 'running',
      message: '🐳 Docker container is executing your code...'
    });

    // Check Docker availability
    const dockerAvailable = await dockerExecutor.checkDockerAvailability();
    if (!dockerAvailable) {
      throw new Error("Docker is not available for code execution");
    }

    console.log(`🐳 Docker is available, executing code with ${testCases?.length || 0} test cases`);

    // Execute code in Docker container with test cases
    let executionResult;
    
    if (!testCases || testCases.length === 0) {
      // Simple execution without test cases
      executionResult = await dockerExecutor.runCode(
        code, 
        language, 
        '', 
        timeLimit || 2000, 
        memoryLimit || 256,
        contestId,  // Pass contestId for persistent containers
        true        // Enable persistent mode
      );
      
      executionResult = {
        totalTestCases: 0,
        passedTestCases: 0,
        score: executionResult.success ? 1 : 0,
        maxScore: 1,
        testCaseResults: [],
        overallStatus: executionResult.success ? 'accepted' : 'runtime_error',
        executionTime: executionResult.executionTime,
        memoryUsed: executionResult.memoryUsed,
        verdict: executionResult.success ? 'Accepted' : 'Runtime Error',
        compilationError: executionResult.success ? null : executionResult.error,
        containerName: executionResult.containerName
      };
    } else {
      // Execute with test cases using persistent containers
      console.log(`🐳 Executing with ${testCases.length} test cases in persistent container for contest ${contestId}`);
      executionResult = await dockerExecutor.runTestCases(
        code,
        language,
        testCases,
        timeLimit || 2000,
        memoryLimit || 256,
        contestId  // Pass contestId for persistent containers
      );
      
      // Add verdict based on result
      executionResult.verdict = getVerdictMessage(executionResult.overallStatus);
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Execution completed in ${processingTime}ms - Status: ${executionResult.overallStatus}`);

    // Update submission with final results
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        status: 'completed',
        result: executionResult,
        processingTime
      },
      { new: true }
    );

    // Update contest leaderboard if submission passed
    if (executionResult.passedTestCases > 0) {
      await updateContestLeaderboard(contestId, userId, executionResult, updatedSubmission.submittedAt);
    }

    // Notify user of completion with detailed results
    socketService.emitToUser(userId, 'submission_result', {
      submissionId,
      contestId,
      status: 'completed',
      result: {
        verdict: executionResult.verdict,
        overallStatus: executionResult.overallStatus,
        score: executionResult.score,
        maxScore: executionResult.maxScore,
        passedTestCases: executionResult.passedTestCases,
        totalTestCases: executionResult.totalTestCases,
        executionTime: executionResult.executionTime,
        memoryUsed: executionResult.memoryUsed,
        testCaseResults: executionResult.testCaseResults?.map(tc => ({
          status: tc.status,
          executionTime: tc.executionTime,
          memoryUsed: tc.memoryUsed,
          // Don't send expected/actual outputs for security (only status)
        })) || []
      },
      message: getResultMessage(executionResult.overallStatus)
    });

    // Emit to contest room for live leaderboard updates
    socketService.emitToContest(contestId, 'leaderboard_update', {
      userId,
      submissionId,
      status: executionResult.overallStatus,
      score: executionResult.score,
      passedTests: executionResult.passedTestCases,
      totalTests: executionResult.totalTestCases,
      executionTime: executionResult.executionTime
    });

    console.log(`✅ Submission ${submissionId} processed successfully: ${executionResult.verdict}`);
    return {
      success: true,
      submissionId,
      result: executionResult
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error processing submission ${job.data.submissionId}:`, error.message);
    
    // Update submission with error
    if (job.data.submissionId) {
      await Submission.findByIdAndUpdate(job.data.submissionId, {
        status: 'failed',
        result: {
          overallStatus: 'system_error',
          verdict: 'System Error',
          score: 0,
          totalTestCases: job.data.testCases?.length || 0,
          passedTestCases: 0,
          executionTime: 0,
          memoryUsed: 0,
          compilationError: error.message,
          testCaseResults: []
        },
        processingTime
      });

      // Notify client of error
      socketService.emitToUser(job.data.userId, 'submission_error', {
        submissionId: job.data.submissionId,
        contestId: job.data.contestId,
        error: error.message,
        message: 'Docker execution failed - please try again'
      });
    }

    throw error;
  }
});

// Helper function to get human-readable verdict message
function getVerdictMessage(status) {
  const verdicts = {
    'accepted': 'Accepted',
    'wrong_answer': 'Wrong Answer',
    'time_limit_exceeded': 'Time Limit Exceeded',
    'runtime_error': 'Runtime Error',
    'compilation_error': 'Compilation Error',
    'system_error': 'System Error',
    'pending': 'Pending'
  };
  return verdicts[status] || 'Unknown';
}

// Helper function to get result message
function getResultMessage(status) {
  const messages = {
    'accepted': '🎉 All test cases passed! Great job!',
    'wrong_answer': '❌ Some test cases failed. Check your logic.',
    'time_limit_exceeded': '⏱️ Your code took too long to execute.',
    'runtime_error': '💥 Your code crashed during execution.',
    'compilation_error': '🔨 Your code has compilation errors.',
    'system_error': '⚠️ System error occurred. Please try again.',
    'pending': '⏳ Your submission is being processed...'
  };
  return messages[status] || 'Unknown status';
}

// Helper function to update contest leaderboard
async function updateContestLeaderboard(contestId, userId, result, submissionTime) {
  try {
    await Contest.findByIdAndUpdate(
      contestId,
      {
        $pull: { leaderboard: { userId: userId } }
      }
    );

    await Contest.findByIdAndUpdate(
      contestId,
      {
        $push: {
          leaderboard: {
            userId: userId,
            score: result.score,
            totalProblems: result.totalTestCases,
            solvedProblems: result.passedTestCases,
            submissionTime: submissionTime,
            lastSubmissionTime: new Date()
          }
        }
      }
    );

    console.log(`📊 Leaderboard updated for contest ${contestId}, user ${userId}`);
  } catch (error) {
    console.error('❌ Error updating leaderboard:', error);
  }
}

console.log("🎯 Enhanced Docker-based code worker initialized and ready!");
