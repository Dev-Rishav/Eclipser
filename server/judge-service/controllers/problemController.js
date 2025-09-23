const Problem = require('../models/Problem');
const { validationResult } = require('express-validator');

class ProblemController {
  /**
   * Create a new problem
   * POST /api/problems
   */
  async createProblem(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        difficulty,
        tags,
        constraints,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        explanation,
        testCases,
        timeLimit,
        memoryLimit,
        supportedLanguages,
        createdBy
      } = req.body;

      const problem = new Problem({
        title,
        description,
        difficulty,
        tags,
        constraints,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        explanation,
        testCases,
        timeLimit,
        memoryLimit,
        supportedLanguages,
        createdBy
      });

      const savedProblem = await problem.save();

      res.status(201).json({
        success: true,
        message: 'Problem created successfully',
        data: savedProblem
      });

    } catch (error) {
      console.error('Error creating problem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create problem',
        error: error.message
      });
    }
  }

  /**
   * Get all problems with pagination and filtering
   * GET /api/problems
   */
  async getProblems(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        difficulty,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter query
      const filter = { isActive: true };
      
      if (difficulty) {
        filter.difficulty = difficulty;
      }
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        filter.tags = { $in: tagArray };
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [problems, totalCount] = await Promise.all([
        Problem.find(filter)
          .select('-testCases') // Exclude test cases from listing
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Problem.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        success: true,
        data: {
          problems,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching problems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problems',
        error: error.message
      });
    }
  }

  /**
   * Get a specific problem by ID
   * GET /api/problems/:id
   */
  async getProblemById(req, res) {
    try {
      const { id } = req.params;
      const { includeHidden = false } = req.query;

      const problem = await Problem.findOne({ _id: id, isActive: true });
      
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      // Filter out hidden test cases unless explicitly requested
      let problemData = problem.toObject();
      
      if (!includeHidden) {
        problemData.testCases = problemData.testCases.filter(tc => !tc.isHidden);
      }

      res.json({
        success: true,
        data: problemData
      });

    } catch (error) {
      console.error('Error fetching problem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problem',
        error: error.message
      });
    }
  }

  /**
   * Update a problem
   * PUT /api/problems/:id
   */
  async updateProblem(req, res) {
    try {
      const { id } = req.params;
      
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const problem = await Problem.findOneAndUpdate(
        { _id: id, isActive: true },
        req.body,
        { 
          new: true,
          runValidators: true
        }
      );

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      res.json({
        success: true,
        message: 'Problem updated successfully',
        data: problem
      });

    } catch (error) {
      console.error('Error updating problem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update problem',
        error: error.message
      });
    }
  }

  /**
   * Delete a problem (soft delete)
   * DELETE /api/problems/:id
   */
  async deleteProblem(req, res) {
    try {
      const { id } = req.params;

      const problem = await Problem.findOneAndUpdate(
        { _id: id, isActive: true },
        { isActive: false },
        { new: true }
      );

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      res.json({
        success: true,
        message: 'Problem deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting problem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete problem',
        error: error.message
      });
    }
  }

  /**
   * Get problem statistics
   * GET /api/problems/:id/stats
   */
  async getProblemStats(req, res) {
    try {
      const { id } = req.params;

      // Import Submission model here to avoid circular dependency
      const Submission = require('../models/Submission');

      const [problem, stats] = await Promise.all([
        Problem.findOne({ _id: id, isActive: true }),
        Submission.aggregate([
          { $match: { problemId: mongoose.Types.ObjectId(id) } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      // Process statistics
      const statisticsMap = {};
      let totalSubmissions = 0;
      
      stats.forEach(stat => {
        statisticsMap[stat._id] = stat.count;
        totalSubmissions += stat.count;
      });

      const acceptedSubmissions = statisticsMap.accepted || 0;
      const acceptanceRate = totalSubmissions > 0 ? 
        ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          problem: {
            id: problem._id,
            title: problem.title,
            difficulty: problem.difficulty
          },
          statistics: {
            totalSubmissions,
            acceptedSubmissions,
            acceptanceRate: parseFloat(acceptanceRate),
            submissionBreakdown: statisticsMap
          }
        }
      });

    } catch (error) {
      console.error('Error fetching problem stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problem statistics',
        error: error.message
      });
    }
  }

  /**
   * Test problem with sample input
   * POST /api/problems/:id/test
   */
  async testProblem(req, res) {
    try {
      const { id } = req.params;
      const { sourceCode, language } = req.body;

      if (!sourceCode || !language) {
        return res.status(400).json({
          success: false,
          message: 'Source code and language are required'
        });
      }

      const problem = await Problem.findOne({ _id: id, isActive: true });
      
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      if (!problem.supportedLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Language ${language} is not supported for this problem`
        });
      }

      // Use Judge0 service to test with sample input
      const Judge0Service = require('../services/judge0Service');
      const judge0Service = new Judge0Service();

      const testCase = {
        input: problem.sampleInput || '',
        expectedOutput: problem.sampleOutput || ''
      };

      const evaluationResult = await judge0Service.evaluateSubmission({
        sourceCode,
        language,
        testCases: [testCase]
      });

      res.json({
        success: true,
        message: 'Problem tested successfully',
        data: {
          result: evaluationResult.results[0],
          passed: evaluationResult.passedTestCases > 0,
          executionTime: evaluationResult.totalExecutionTime,
          memoryUsage: evaluationResult.maxMemoryUsage
        }
      });

    } catch (error) {
      console.error('Error testing problem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test problem',
        error: error.message
      });
    }
  }
}

module.exports = ProblemController;
