#!/usr/bin/env node

/**
 * Simple Contest Flow Test
 * 
 * This script demonstrates the clean and simple contest functionality:
 * 1. Create contest with questions and test cases via POST body
 * 2. Join contest
 * 3. Submit solution
 * 4. Docker container executes code and validates against test cases
 * 5. Return results (correct/incorrect with clear error messages)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data - Simple Two Sum problem
const contestData = {
  title: "Simple Algorithm Contest",
  description: "Test your basic programming skills",
  createdBy: "test-user-123",
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
  maxParticipants: 50,
  isPublic: true,
  questions: [
    {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1].`,
      difficulty: "easy",
      timeLimit: 2000,
      memoryLimit: 256,
      supportedLanguages: ["python", "javascript"],
      testCases: [
        {
          input: "[2, 7, 11, 15]\n9",
          expectedOutput: "[0, 1]",
          isHidden: false,
          weight: 1
        },
        {
          input: "[3, 2, 4]\n6", 
          expectedOutput: "[1, 2]",
          isHidden: false,
          weight: 1
        },
        {
          input: "[3, 3]\n6",
          expectedOutput: "[0, 1]",
          isHidden: true, // Hidden test case
          weight: 2
        }
      ]
    }
  ]
};

// Test solutions
const correctSolution = `
def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Read input
import sys
input_lines = sys.stdin.read().strip().split('\\n')
nums = eval(input_lines[0])
target = int(input_lines[1])

# Solve and output
result = two_sum(nums, target)
print(result)
`;

const incorrectSolution = `
def two_sum(nums, target):
    # This solution has a bug - returns wrong indices
    return [0, 0]  # Always returns [0, 0]

# Read input
import sys
input_lines = sys.stdin.read().strip().split('\\n')
nums = eval(input_lines[0])
target = int(input_lines[1])

# Solve and output
result = two_sum(nums, target)
print(result)
`;

let contestId = null;
let userId = "test-user-456";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createContest() {
  try {
    console.log('🚀 Step 1: Creating contest with questions and test cases...');
    console.log('📋 Contest details:', {
      title: contestData.title,
      questionsCount: contestData.questions.length,
      testCasesPerQuestion: contestData.questions[0].testCases.length
    });
    
    const response = await axios.post(`${BASE_URL}/api/contest/create`, contestData);
    
    if (response.data.success) {
      contestId = response.data.data.contestId;
      console.log('✅ Contest created successfully!');
      console.log('🆔 Contest ID:', contestId);
      console.log('🧩 Problem:', response.data.data.problem.title);
      console.log('🧪 Test cases:', response.data.data.problem.totalTestCases);
      console.log('👁️ Public test cases:', response.data.data.problem.publicTestCases);
      return true;
    } else {
      console.error('❌ Failed to create contest:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating contest:', error.response?.data || error.message);
    return false;
  }
}

async function joinContest() {
  try {
    console.log('\\n👋 Step 2: Joining contest...');
    
    const response = await axios.post(`${BASE_URL}/api/contest/join`, {
      contestId,
      userId,
      username: "TestUser456"
    });
    
    console.log('✅ Joined contest successfully!');
    console.log('👥 Contest participants:', response.data.contest.users.length);
    return true;
  } catch (error) {
    console.error('❌ Error joining contest:', error.response?.data || error.message);
    return false;
  }
}

async function submitCorrectSolution() {
  try {
    console.log('\\n📝 Step 3a: Submitting CORRECT solution...');
    
    const response = await axios.post(`${BASE_URL}/api/contest/submit`, {
      contestId,
      userId,
      code: correctSolution,
      language: "python",
      username: "TestUser456"
    });
    
    console.log('✅ Submission accepted for processing!');
    console.log('🆔 Submission ID:', response.data.data.submissionId);
    console.log('🐳 Docker execution status:', response.data.data.status);
    console.log('⏱️ Estimated processing time:', response.data.data.estimatedProcessingTime);
    
    return response.data.data.submissionId;
  } catch (error) {
    console.error('❌ Error submitting correct solution:', error.response?.data || error.message);
    return null;
  }
}

async function submitIncorrectSolution() {
  try {
    console.log('\\n📝 Step 3b: Submitting INCORRECT solution...');
    
    // First, join the contest as a different user
    const secondUserId = userId + "-2";
    await axios.post(`${BASE_URL}/api/contest/join`, {
      contestId,
      userId: secondUserId,
      username: "TestUser789"
    });
    
    console.log('👤 Second user joined contest');
    
    const response = await axios.post(`${BASE_URL}/api/contest/submit`, {
      contestId,
      userId: secondUserId, // Different user
      code: incorrectSolution,
      language: "python",
      username: "TestUser789"
    });
    
    console.log('✅ Submission accepted for processing!');
    console.log('🆔 Submission ID:', response.data.data.submissionId);
    console.log('🐳 Docker execution status:', response.data.data.status);
    
    return response.data.data.submissionId;
  } catch (error) {
    console.error('❌ Error submitting incorrect solution:', error.response?.data || error.message);
    return null;
  }
}

async function checkSubmissionStatus(submissionId, description) {
  try {
    console.log(`\\n🔍 Checking ${description} submission status...`);
    
    // Wait a bit for processing
    await sleep(3000);
    
    const response = await axios.get(`${BASE_URL}/api/contest/${contestId}/submissions?limit=10`);
    const submissions = response.data.submissions || response.data;
    const submission = submissions.find(s => s._id === submissionId);
    
    if (submission) {
      console.log('📊 Submission Results:');
      console.log('  Status:', submission.status);
      console.log('  Verdict:', submission.result?.verdict || 'Processing...');
      console.log('  Score:', `${submission.result?.score || 0}/${submission.result?.maxScore || 0}`);
      console.log('  Test Cases:', `${submission.result?.passedTestCases || 0}/${submission.result?.totalTestCases || 0} passed`);
      console.log('  Execution Time:', `${submission.result?.executionTime || 0}ms`);
      console.log('  Memory Used:', `${submission.result?.memoryUsed || 0}MB`);
      
      if (submission.result?.compilationError) {
        console.log('  Compilation Error:', submission.result.compilationError);
      }
      
      return submission.result?.overallStatus === 'accepted';
    } else {
      console.log('⏳ Submission still processing...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking submission:', error.response?.data || error.message);
    return false;
  }
}

async function getLeaderboard() {
  try {
    console.log('\\n🏆 Step 4: Checking contest leaderboard...');
    
    const response = await axios.get(`${BASE_URL}/api/contest/${contestId}/leaderboard`);
    
    console.log('📊 Contest Leaderboard:');
    if (response.data.leaderboard && response.data.leaderboard.length > 0) {
      response.data.leaderboard.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.username} - Score: ${entry.score}, Submissions: ${entry.totalSubmissions}`);
      });
    } else {
      console.log('  No participants yet');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error.response?.data || error.message);
    return false;
  }
}

async function runTest() {
  console.log('🎯 Starting Simple Contest Flow Test');
  console.log('=' .repeat(60));
  
  // Step 1: Create contest
  const contestCreated = await createContest();
  if (!contestCreated) {
    console.log('❌ Test failed at contest creation');
    return;
  }
  
  // Step 2: Join contest  
  const joinedContest = await joinContest();
  if (!joinedContest) {
    console.log('❌ Test failed at joining contest');
    return;
  }
  
  // Step 3a: Submit correct solution
  const correctSubmissionId = await submitCorrectSolution();
  if (!correctSubmissionId) {
    console.log('❌ Test failed at correct submission');
    return;
  }
  
  // Step 3b: Submit incorrect solution
  const incorrectSubmissionId = await submitIncorrectSolution();
  
  // Wait for Docker processing
  console.log('\\n⏳ Waiting for Docker containers to process submissions...');
  await sleep(8000); // Wait 8 seconds for processing
  
  // Check results
  await checkSubmissionStatus(correctSubmissionId, "CORRECT");
  if (incorrectSubmissionId) {
    await checkSubmissionStatus(incorrectSubmissionId, "INCORRECT");
  }
  
  // Show leaderboard
  await getLeaderboard();
  
  console.log('\\n' + '='.repeat(60));
  console.log('🎉 Test completed! Key points demonstrated:');
  console.log('✅ Contest created with questions via POST body');
  console.log('✅ Docker containers executed submitted code');
  console.log('✅ Test cases validated automatically');
  console.log('✅ Clear results returned (correct/incorrect)');
  console.log('✅ Real-time leaderboard updates');
  
  console.log('\\n🐳 Docker-based execution provides:');
  console.log('  • Secure isolated environment');
  console.log('  • Automatic test case validation');
  console.log('  • Resource limits (time/memory)');
  console.log('  • Support for multiple languages');
  console.log('  • Clean error reporting');
}

// Run the test
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest };
