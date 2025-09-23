const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// Test data for Two Sum problem
const twoSumProblem = {
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  difficulty: "easy",
  timeLimit: 1000,
  memoryLimit: 128,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6", 
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
    }
  ],
  constraints: [
    "2 <= nums.length <= 104",
    "-109 <= nums[i] <= 109",
    "-109 <= target <= 109",
    "Only one valid answer exists."
  ],
  hints: [
    "A brute force approach would be to check every pair of numbers.",
    "Think about using a hash map to store numbers you've seen before."
  ],
  testCases: [
    // Sample test cases (visible to contestants)
    {
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0,1]",
      isHidden: false,
      weight: 1
    },
    {
      input: "[3,2,4]\n6",
      expectedOutput: "[1,2]",
      isHidden: false,
      weight: 1
    },
    // Hidden test cases (for judging)
    {
      input: "[3,3]\n6",
      expectedOutput: "[0,1]",
      isHidden: true,
      weight: 2
    },
    {
      input: "[-1,-2,-3,-4,-5]\n-8",
      expectedOutput: "[2,4]",
      isHidden: true,
      weight: 2
    },
    {
      input: "[1,2,3,4,5,6]\n10",
      expectedOutput: "[3,5]",
      isHidden: true,
      weight: 2
    },
    {
      input: "[0,4,3,0]\n0",
      expectedOutput: "[0,3]",
      isHidden: true,
      weight: 2
    }
  ],
  tags: ["Array", "Hash Table", "Two Pointers"],
  supportedLanguages: ["python", "javascript", "java", "cpp", "c"],
  starterCode: {
    python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    pass

# Test your solution
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = twoSum(nums, target)
    print(result)`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};

// Test your solution
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log(result);`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = sol.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,
    cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = sol.twoSum(nums, target);
    
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    
    printf("[%d,%d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`
  },
  createdBy: "system",
  isPublic: false
};

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/contest-service');
    console.log("Connected to MongoDB");

    // Clear existing data
    await Contest.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
    console.log("Cleared existing data");

    // Create the Two Sum problem
    const problem = new Problem(twoSumProblem);
    await problem.save();
    console.log("✅ Created Two Sum problem:", problem._id);

    // Create a test contest with this problem
    const contest = new Contest({
      title: "Weekly Algorithm Challenge #1",
      description: "Test your problem-solving skills with classic array problems!",
      users: ["user_test_1", "user_test_2", "user_test_3"],
      problem: problem._id,
      problemId: problem._id.toString(),
      status: 'running', // Make it running for testing
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      submissions: [],
      maxParticipants: 50,
      isPublic: true,
      createdBy: "system",
      leaderboard: [
        {
          userId: "user_test_1",
          username: "Alice",
          score: 0,
          totalSubmissions: 0,
          lastSubmissionTime: new Date(),
          bestSubmissionTime: 0,
          rank: 1
        },
        {
          userId: "user_test_2",
          username: "Bob",
          score: 0,
          totalSubmissions: 0,
          lastSubmissionTime: new Date(),
          bestSubmissionTime: 0,
          rank: 2
        },
        {
          userId: "user_test_3",
          username: "Charlie",
          score: 0,
          totalSubmissions: 0,
          lastSubmissionTime: new Date(),
          bestSubmissionTime: 0,
          rank: 3
        }
      ],
      winner: null,
      rules: {
        allowMultipleSubmissions: true,
        submissionLimit: 10,
        penaltyPerWrongSubmission: 0
      }
    });

    await contest.save();
    console.log("✅ Created test contest:", contest._id);

    console.log("\\n🎉 Test data seeded successfully!");
    console.log("\\n📋 Contest Details:");
    console.log(`- Contest ID: ${contest._id}`);
    console.log(`- Problem ID: ${problem._id}`);
    console.log(`- Title: ${contest.title}`);
    console.log(`- Status: ${contest.status}`);
    console.log(`- Participants: ${contest.users.length}`);
    console.log(`- Problem: ${problem.title} (${problem.difficulty})`);
    console.log(`- Test Cases: ${problem.testCases.length} total (${problem.testCases.filter(tc => !tc.isHidden).length} public, ${problem.testCases.filter(tc => tc.isHidden).length} hidden)`);

    console.log("\\n🚀 You can now test the contest service with:");
    console.log("- Contest ID:", contest._id);
    console.log("- Join as user: user_test_1, user_test_2, or user_test_3");
    console.log("- Submit solutions in: python, javascript, java, cpp, c");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData, twoSumProblem };
