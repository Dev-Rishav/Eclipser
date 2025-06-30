const submissionData = [
  {
    userId: "user_12345",
    code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}`,
    language: "javascript",
    submittedAt: new Date("2025-06-30T10:30:00Z"),
    result: {
      status: "accepted",
      executionTime: 85,
      memoryUsed: 42.5,
      testCasesPassed: 15,
      totalTestCases: 15,
    },
  },
  {
    userId: "user_67890",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    language: "python",
    submittedAt: new Date("2025-06-30T10:45:00Z"),
    result: {
      status: "accepted",
      executionTime: 120,
      memoryUsed: 38.2,
      testCasesPassed: 12,
      totalTestCases: 12,
    },
  },
  {
    userId: "user_11111",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {1, 2, 3, 4, 5};
    int sum = 0;
    for(int num : nums) {
        sum += num;
    }
    cout << "Sum: " << sum << endl;
    return 0;
}`,
    language: "cpp",
    submittedAt: new Date("2025-06-30T11:00:00Z"),
    result: {
      status: "wrong_answer",
      executionTime: 95,
      memoryUsed: 45.1,
      testCasesPassed: 8,
      totalTestCases: 10,
      error: "Expected output doesn't match actual output for test case 9",
    },
  },
  {
    userId: "user_22222",
    code: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    language: "java",
    submittedAt: new Date("2025-06-30T11:15:00Z"),
    result: {
      status: "time_limit_exceeded",
      executionTime: 2000,
      memoryUsed: 52.3,
      testCasesPassed: 3,
      totalTestCases: 15,
      error: "Solution exceeded time limit of 1000ms",
    },
  },
  {
    userId: "user_33333",
    code: `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
    language: "javascript",
    submittedAt: new Date("2025-06-30T11:30:00Z"),
    result: {
      status: "accepted",
      executionTime: 76,
      memoryUsed: 40.8,
      testCasesPassed: 20,
      totalTestCases: 20,
    },
  },
];

module.exports = submissionData;
