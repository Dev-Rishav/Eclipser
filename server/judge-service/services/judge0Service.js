const axios = require('axios');
const JUDGE0_CONFIG = require('../config/judge0');

class Judge0Service {
  constructor() {
    this.baseURL = JUDGE0_CONFIG.BASE_URL;
    this.headers = JUDGE0_CONFIG.getHeaders();
    this.timeout = JUDGE0_CONFIG.TIMEOUT;
    this.maxRetries = JUDGE0_CONFIG.MAX_RETRIES;
    this.retryDelay = JUDGE0_CONFIG.RETRY_DELAY;
  }

  /**
   * Create a submission on Judge0 via RapidAPI
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Submission result with token
   */
  async createSubmission(submissionData) {
    try {
      const {
        sourceCode,
        languageId,
        stdin = '',
        expectedOutput = '',
      } = submissionData;

      const payload = {
        source_code: sourceCode,  // Send as plain text, not base64
        language_id: languageId,
        stdin: stdin || '',  // Send as plain text, not base64
        expected_output: expectedOutput || '',  // Send as plain text, not base64
        cpu_time_limit: JUDGE0_CONFIG.LIMITS.CPU_TIME_LIMIT,
        memory_limit: JUDGE0_CONFIG.LIMITS.MEMORY_LIMIT,
        wall_time_limit: JUDGE0_CONFIG.LIMITS.WALL_TIME_LIMIT,
        redirect_stderr_to_stdout: false
      };

      console.log('Creating submission with payload:', {
        source_code: sourceCode.length > 100 ? sourceCode.substring(0, 100) + '...' : sourceCode,
        language_id: languageId,
        stdin: stdin || '',
        expected_output: expectedOutput || ''
      });

      const response = await axios.post(
        `${this.baseURL}${JUDGE0_CONFIG.ENDPOINTS.SUBMISSIONS}`,
        payload,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      console.log('Submission created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error.response?.data || error.message);
      throw new Error(`Failed to create submission: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get submission result by token with retry mechanism
   * @param {string} token - Submission token
   * @returns {Promise<Object>} Submission result
   */
  async getSubmissionResult(token) {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        const response = await axios.get(
          `${this.baseURL}${JUDGE0_CONFIG.ENDPOINTS.SUBMISSION_BY_TOKEN.replace('{token}', token)}`,
          {
            headers: this.headers,
            timeout: this.timeout
          }
        );

        const result = response.data;
        
        console.log('Submission result retrieved:', {
          token,
          status: result.status,
          time: result.time,
          memory: result.memory,
          stdout: result.stdout || null,
          stderr: result.stderr || null,
          compile_output: result.compile_output || null,
          message: result.message || null
        });

        return result;
      } catch (error) {
        console.error(`Error getting submission result (attempt ${retries + 1}):`, error.response?.data || error.message);
        
        if (retries === this.maxRetries - 1) {
          throw new Error(`Failed to get submission result after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        await this.sleep(this.retryDelay);
        retries++;
      }
    }
  }

  /**
   * Submit and wait for result
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Complete submission result
   */
  async submitAndWait(submissionData) {
    try {
      // Create submission
      const submission = await this.createSubmission(submissionData);
      
      if (!submission.token) {
        throw new Error('No token received from Judge0 API');
      }

      // Wait a bit before polling
      await this.sleep(1000);

      // Get result
      const result = await this.getSubmissionResult(submission.token);
      
      return {
        ...result,
        token: submission.token
      };
    } catch (error) {
      console.error('Error in submitAndWait:', error.message);
      throw error;
    }
  }

  /**
   * Evaluate submission against multiple test cases
   * @param {Object} evaluationData - Evaluation data
   * @returns {Promise<Object>} Evaluation results
   */
  async evaluateSubmission(evaluationData) {
    try {
      const { sourceCode, language, testCases } = evaluationData;
      const languageId = JUDGE0_CONFIG.LANGUAGE_IDS[language.toLowerCase()];
      
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const results = [];
      let totalPassed = 0;
      let totalExecutionTime = 0;
      let maxMemoryUsage = 0;

      // Process each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          const submissionData = {
            sourceCode,
            languageId,
            stdin: testCase.input || '',
            expectedOutput: testCase.expectedOutput || ''
          };

          const result = await this.submitAndWait(submissionData);
          
          const testCaseResult = {
            testCase: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout || '',
            status: result.status,
            time: parseFloat(result.time) || 0,
            memory: parseInt(result.memory) || 0,
            passed: false,
            error: result.stderr || result.compile_output || result.message || null
          };

          console.log(`Test case ${i + 1} result:`, {
            status: result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            message: result.message
          });

          // Check if test case passed
          if (result.status?.id === JUDGE0_CONFIG.STATUS_IDS.ACCEPTED) {
            const actualOutput = (result.stdout || '').trim();
            const expectedOutput = (testCase.expectedOutput || '').trim();
            
            if (actualOutput === expectedOutput) {
              testCaseResult.passed = true;
              totalPassed++;
            }
          }

          totalExecutionTime += testCaseResult.time;
          maxMemoryUsage = Math.max(maxMemoryUsage, testCaseResult.memory);
          
          results.push(testCaseResult);

          // Small delay between test cases to avoid rate limiting
          if (i < testCases.length - 1) {
            await this.sleep(500);
          }

        } catch (error) {
          console.error(`Error evaluating test case ${i + 1}:`, error.message);
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            status: { id: JUDGE0_CONFIG.STATUS_IDS.INTERNAL_ERROR, description: 'Internal Error' },
            time: 0,
            memory: 0,
            passed: false,
            error: error.message
          });
        }
      }

      const overallResult = {
        language,
        totalTestCases: testCases.length,
        passedTestCases: totalPassed,
        failedTestCases: testCases.length - totalPassed,
        score: Math.round((totalPassed / testCases.length) * 100),
        totalExecutionTime: Math.round(totalExecutionTime * 1000) / 1000, // Round to 3 decimal places
        maxMemoryUsage,
        results
      };

      console.log('Evaluation completed:', {
        score: overallResult.score,
        passed: `${totalPassed}/${testCases.length}`,
        totalTime: overallResult.totalExecutionTime
      });

      return overallResult;

    } catch (error) {
      console.error('Error in evaluateSubmission:', error.message);
      throw error;
    }
  }

  /**
   * Get available languages from Judge0
   * @returns {Promise<Array>} Available languages
   */
  async getLanguages() {
    try {
      const response = await axios.get(
        `${this.baseURL}${JUDGE0_CONFIG.ENDPOINTS.LANGUAGES}`,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting languages:', error.response?.data || error.message);
      throw new Error(`Failed to get languages: ${error.message}`);
    }
  }

  /**
   * Get system information
   * @returns {Promise<Object>} System information
   */
  async getSystemInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}${JUDGE0_CONFIG.ENDPOINTS.SYSTEM_INFO}`,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting system info:', error.response?.data || error.message);
      throw new Error(`Failed to get system info: ${error.message}`);
    }
  }

  /**
   * Helper method to sleep/delay
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate RapidAPI configuration
   * @returns {boolean} Whether configuration is valid
   */
  validateConfig() {
    if (!JUDGE0_CONFIG.RAPIDAPI_KEY) {
      console.error('RapidAPI key is not configured');
      return false;
    }
    return true;
  }
}

module.exports = Judge0Service;
