const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Judge0Service = require('../services/judge0Service');
const JUDGE0_CONFIG = require('../config/judge0');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

class SubmissionController {
  constructor() {
    this.judge0Service = new Judge0Service();
  }

  // Helper method to get judge0Service instance
  getJudge0Service() {
    if (!this.judge0Service) {
      this.judge0Service = new Judge0Service();
    }
    return this.judge0Service;
  }

  /**
   * Submit a solution
   * POST /api/submissions
   */
  async createSubmission(req, res) {
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

      const { userId, username, contestId, problemId, sourceCode, language } = req.body;

      // Validate contest and problem exist
      const [contest, problem] = await Promise.all([
        Contest.findOne({ _id: contestId, isActive: true }),
        Problem.findOne({ _id: problemId, isActive: true })
      ]);

      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      // Check if contest is running
    //   if (!contest.isContestActive()) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Contest is not currently running'
    //     });
    //   }

      // Check if user is registered for the contest
      const contestant = contest.contestants.find(c => c.userId === userId);
      if (!contestant) {
        return res.status(403).json({
          success: false,
          message: 'User is not registered for this contest'
        });
      }

      // Check if language is supported
      if (!contest.allowedLanguages.includes(language) || !problem.supportedLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Language ${language} is not supported for this problem`
        });
      }

      // Validate Judge0 configuration
      const judge0Service = this.getJudge0Service();
      if (!judge0Service.validateConfig()) {
        return res.status(500).json({
          success: false,
          message: 'Judge service is not properly configured'
        });
      }

      // Create submission record
      const languageId = JUDGE0_CONFIG.LANGUAGE_IDS[language];
      const submission = new Submission({
        userId,
        username,
        contestId,
        problemId,
        sourceCode,
        language,
        languageId,
        status: 'evaluating'
      });

      const savedSubmission = await submission.save();

      // Start evaluation asynchronously
      this.evaluateSubmissionAsync(savedSubmission._id, problem);

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: {
          submissionId: savedSubmission._id,
          status: savedSubmission.status,
          submittedAt: savedSubmission.createdAt
        }
      });

    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create submission',
        error: error.message
      });
    }
  }

  /**
   * Get submissions with pagination and filtering
   * GET /api/submissions
   */
  async getSubmissions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        contestId,
        problemId,
        status,
        language,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter query
      const filter = {};
      
      if (userId) filter.userId = userId;
      if (contestId) filter.contestId = contestId;
      if (problemId) filter.problemId = problemId;
      if (status) filter.status = status;
      if (language) filter.language = language;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [submissions, totalCount] = await Promise.all([
        Submission.find(filter)
          .populate('contestId', 'title')
          .populate('problemId', 'title difficulty')
          .select('-sourceCode -testCaseResults') // Exclude large fields from listing
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Submission.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        success: true,
        data: {
          submissions,
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
      console.error('Error fetching submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions',
        error: error.message
      });
    }
  }

  /**
   * Get a specific submission by ID
   * GET /api/submissions/:id
   */
  async getSubmissionById(req, res) {
    try {
      const { id } = req.params;

      const submission = await Submission.findById(id)
        .populate('contestId', 'title')
        .populate('problemId', 'title difficulty')
        .lean();
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.json({
        success: true,
        data: submission
      });

    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submission',
        error: error.message
      });
    }
  }

  /**
   * Get submission status (for polling)
   * GET /api/submissions/:id/status
   */
  async getSubmissionStatus(req, res) {
    try {
      const { id } = req.params;

      const submission = await Submission.findById(id)
        .select('status score passedTestCases totalTestCases executionTime memoryUsage isAccepted')
        .lean();
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.json({
        success: true,
        data: {
          submissionId: id,
          status: submission.status,
          score: submission.score,
          passedTestCases: submission.passedTestCases,
          totalTestCases: submission.totalTestCases,
          executionTime: submission.executionTime,
          memoryUsage: submission.memoryUsage,
          isAccepted: submission.isAccepted
        }
      });

    } catch (error) {
      console.error('Error fetching submission status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submission status',
        error: error.message
      });
    }
  }

  /**
   * Evaluate submission asynchronously
   * @private
   */
  async evaluateSubmissionAsync(submissionId, problem) {
    try {
      console.log(`Starting evaluation for submission ${submissionId}`);
      console.log('Problem test cases:', JSON.stringify(problem.testCases, null, 2));
      
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        console.error(`Submission ${submissionId} not found`);
        return;
      }

      console.log('Submission details:', {
        language: submission.language,
        sourceCodeLength: submission.sourceCode.length,
        languageId: submission.languageId
      });

      // Evaluate with Judge0
      const judge0Service = new Judge0Service();
      const evaluationResult = await judge0Service.evaluateSubmission({
        sourceCode: submission.sourceCode,
        language: submission.language,
        testCases: problem.testCases
      });

      console.log('Evaluation result:', JSON.stringify(evaluationResult, null, 2));

      // Update submission with results
      submission.updateEvaluationResults(evaluationResult);
      
      // Calculate points
      const contestProblem = await Contest.findOne(
        { _id: submission.contestId, 'problems.problemId': submission.problemId },
        { 'problems.$': 1 }
      );
      
      const maxPoints = contestProblem?.problems[0]?.points || problem.totalPoints;
      submission.calculatePoints(maxPoints);

      await submission.save();

      // Update contest leaderboard if submission is accepted or improved
      if (submission.isAccepted || submission.score > 0) {
        await this.updateContestLeaderboard(submission);
      }

      console.log(`Evaluation completed for submission ${submissionId}: ${submission.status}`);

    } catch (error) {
      console.error(`Error evaluating submission ${submissionId}:`, error);
      
      // Update submission with error status
      try {
        await Submission.findByIdAndUpdate(submissionId, {
          status: 'internal_error',
          error: error.message
        });
      } catch (updateError) {
        console.error(`Failed to update submission ${submissionId} with error status:`, updateError);
      }
    }
  }

  /**
   * Update contest leaderboard after submission
   * @private
   */
  async updateContestLeaderboard(submission) {
    try {
      // Get all accepted submissions for this user in this contest
      const acceptedSubmissions = await Submission.find({
        userId: submission.userId,
        contestId: submission.contestId,
        isAccepted: true
      }).distinct('problemId');

      // Calculate total score for this user
      const userSubmissions = await Submission.aggregate([
        {
          $match: {
            userId: submission.userId,
            contestId: submission.contestId
          }
        },
        {
          $sort: { createdAt: 1 } // Ensure we get the first accepted submission for each problem
        },
        {
          $group: {
            _id: '$problemId',
            bestSubmission: { $first: '$$ROOT' }
          }
        },
        {
          $match: {
            'bestSubmission.isAccepted': true
          }
        }
      ]);

      const totalScore = userSubmissions.reduce((sum, sub) => sum + sub.bestSubmission.points, 0);
      const problemsSolved = acceptedSubmissions.length;

      // Update contest contestant data
      const contest = await Contest.findById(submission.contestId);
      await contest.updateContestantScore(submission.userId, totalScore, problemsSolved);

      console.log(`Updated leaderboard for user ${submission.userId}: ${totalScore} points, ${problemsSolved} problems solved`);

    } catch (error) {
      console.error('Error updating contest leaderboard:', error);
    }
  }

  /**
   * Rejudge a submission
   * POST /api/submissions/:id/rejudge
   */
  async rejudgeSubmission(req, res) {
    try {
      const { id } = req.params;

      const submission = await Submission.findById(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      const problem = await Problem.findById(submission.problemId);
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      // Reset submission status
      submission.status = 'evaluating';
      submission.score = 0;
      submission.passedTestCases = 0;
      submission.failedTestCases = 0;
      submission.testCaseResults = [];
      submission.isAccepted = false;
      submission.points = 0;
      
      await submission.save();

      // Start evaluation asynchronously
      this.evaluateSubmissionAsync(submission._id, problem);

      res.json({
        success: true,
        message: 'Submission queued for rejudging',
        data: {
          submissionId: submission._id,
          status: submission.status
        }
      });

    } catch (error) {
      console.error('Error rejudging submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rejudge submission',
        error: error.message
      });
    }
  }
}

module.exports = SubmissionController;
