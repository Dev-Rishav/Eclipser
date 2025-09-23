const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:5001';
const WS_URL = 'ws://localhost:5001';

class ContestTestClient {
  constructor() {
    this.contestId = null;
    this.problemId = null;
    this.ws = null;
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket() {
    this.ws = new WebSocket(WS_URL);
    
    this.ws.on('open', () => {
      console.log('🔌 Connected to WebSocket');
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      console.log('📡 WebSocket Message:', message);
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket Error:', error);
    });
  }

  // Create a new contest with problem
  async createContestWithProblem() {
    try {
      console.log('\\n🏗️  Creating contest with Two Sum problem...');
      
      const contestData = {
        title: "Test Programming Contest",
        description: "A test contest to validate the system",
        createdBy: "test-user",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        maxParticipants: 10,
        isPublic: true,
        problem: {
          title: "Two Sum",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          difficulty: "easy",
          timeLimit: 1000,
          memoryLimit: 128,
          examples: [
            {
              input: "nums = [2,7,11,15], target = 9",
              output: "[0,1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
          ],
          testCases: [
            {
              input: "[2,7,11,15]\\n9",
              expectedOutput: "[0,1]",
              isHidden: false,
              weight: 1
            },
            {
              input: "[3,2,4]\\n6",
              expectedOutput: "[1,2]",
              isHidden: false,
              weight: 1
            },
            {
              input: "[3,3]\\n6",
              expectedOutput: "[0,1]",
              isHidden: true,
              weight: 2
            }
          ],
          supportedLanguages: ["python", "javascript", "java"],
          starterCode: {
            python: `def twoSum(nums, target):
    pass

# Test
nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
print(result)`,
            javascript: `function twoSum(nums, target) {
    // Your code here
}

const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log(result);`
          }
        }
      };

      const response = await axios.post(`${BASE_URL}/api/contests/create-with-problem`, contestData);
      console.log('✅ Contest created successfully!');
      console.log('Contest ID:', response.data.data.contestId);
      console.log('Problem ID:', response.data.data.problemId);
      
      this.contestId = response.data.data.contestId;
      this.problemId = response.data.data.problemId;
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error creating contest:', error.response?.data || error.message);
      throw error;
    }
  }

  // Join a contest
  async joinContest(contestId, userId) {
    try {
      console.log(`\\n👤 User ${userId} joining contest ${contestId}...`);
      
      const response = await axios.post(`${BASE_URL}/api/contests/${contestId}/join`, {
        userId: userId,
        username: `TestUser_${userId}`
      });
      
      console.log('✅ Joined contest successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ Error joining contest:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get contest details
  async getContest(contestId) {
    try {
      console.log(`\\n📋 Getting contest details for ${contestId}...`);
      
      const response = await axios.get(`${BASE_URL}/api/contests/${contestId}`);
      console.log('✅ Contest details retrieved');
      console.log('Title:', response.data.data.title);
      console.log('Status:', response.data.data.status);
      console.log('Participants:', response.data.data.users.length);
      console.log('Problem:', response.data.data.problem?.title);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error getting contest:', error.response?.data || error.message);
      throw error;
    }
  }

  // Submit a solution
  async submitSolution(contestId, userId, language = 'python') {
    try {
      console.log(`\\n💻 Submitting ${language} solution...`);
      
      let code;
      if (language === 'python') {
        code = `def twoSum(nums, target):
    num_dict = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_dict:
            return [num_dict[complement], i]
        num_dict[num] = i
    return []

# Test
nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
print(result)`;
      } else if (language === 'javascript') {
        code = `function twoSum(nums, target) {
    const numMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log(result);`;
      }

      const response = await axios.post(`${BASE_URL}/api/contests/${contestId}/submit`, {
        userId: userId,
        language: language,
        code: code
      });
      
      console.log('✅ Solution submitted!');
      console.log('Submission ID:', response.data.data.submissionId);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error submitting solution:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(contestId) {
    try {
      console.log(`\\n🏆 Getting leaderboard for contest ${contestId}...`);
      
      const response = await axios.get(`${BASE_URL}/api/contests/${contestId}/leaderboard`);
      console.log('✅ Leaderboard retrieved');
      
      const leaderboard = response.data.data.leaderboard;
      console.log('\\n📊 Current Leaderboard:');
      leaderboard.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.username} - Score: ${entry.score}, Submissions: ${entry.totalSubmissions}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get all problems
  async getProblems() {
    try {
      console.log('\\n📚 Getting all problems...');
      
      const response = await axios.get(`${BASE_URL}/api/problems`);
      console.log('✅ Problems retrieved');
      console.log(`Found ${response.data.data.length} problems`);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error getting problems:', error.response?.data || error.message);
      throw error;
    }
  }

  // Run complete test suite
  async runFullTest() {
    try {
      console.log('🚀 Starting Contest Service Test Suite');
      console.log('=====================================');
      
      // Connect to WebSocket
      this.connectWebSocket();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 1. Create contest with problem
      const contestData = await this.createContestWithProblem();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Join contest with multiple users
      await this.joinContest(this.contestId, 'user1');
      await this.joinContest(this.contestId, 'user2');
      await this.joinContest(this.contestId, 'user3');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Get contest details
      await this.getContest(this.contestId);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Submit solutions
      await this.submitSolution(this.contestId, 'user1', 'python');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for processing

      await this.submitSolution(this.contestId, 'user2', 'javascript');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for processing

      // 5. Get leaderboard
      await this.getLeaderboard(this.contestId);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. Get all problems
      await this.getProblems();

      console.log('\\n🎉 Test suite completed successfully!');
      console.log('=====================================');
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
      }
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      if (this.ws) {
        this.ws.close();
      }
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const testClient = new ContestTestClient();
  testClient.runFullTest();
}

module.exports = ContestTestClient;
