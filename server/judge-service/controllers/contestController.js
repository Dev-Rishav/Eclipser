const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

class ContestController {
  /**
   * Create a new contest
   * POST /api/contests
   */
  async createContest(req, res) {
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
        startTime,
        endTime,
        duration,
        problems,
        maxParticipants,
        registrationStartTime,
        registrationEndTime,
        rules,
        prizes,
        visibility,
        scoringType,
        allowedLanguages,
        createdBy
      } = req.body;

      // Validate that all problems exist
      const problemIds = problems.map(p => p.problemId);
      const existingProblems = await Problem.find({
        _id: { $in: problemIds },
        isActive: true
      });

      if (existingProblems.length !== problemIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more problems do not exist'
        });
      }

      const contest = new Contest({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        problems,
        maxParticipants,
        registrationStartTime: registrationStartTime ? new Date(registrationStartTime) : new Date(),
        registrationEndTime: new Date(registrationEndTime),
        rules,
        prizes,
        visibility,
        scoringType,
        allowedLanguages,
        createdBy
      });

      const savedContest = await contest.save();

      res.status(201).json({
        success: true,
        message: 'Contest created successfully',
        data: savedContest
      });

    } catch (error) {
      console.error('Error creating contest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create contest',
        error: error.message
      });
    }
  }

  /**
   * Get all contests with pagination and filtering
   * GET /api/contests
   */
  async getContests(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        visibility = 'public',
        search,
        sortBy = 'startTime',
        sortOrder = 'desc'
      } = req.query;

      // Build filter query
      const filter = { isActive: true, visibility };
      
      if (status) {
        filter.status = status;
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
      
      const [contests, totalCount] = await Promise.all([
        Contest.find(filter)
          .populate('problems.problemId', 'title difficulty')
          .select('-contestants') // Exclude contestants from listing
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Contest.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        success: true,
        data: {
          contests,
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
      console.error('Error fetching contests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contests',
        error: error.message
      });
    }
  }

  /**
   * Get a specific contest by ID
   * GET /api/contests/:id
   */
  async getContestById(req, res) {
    try {
      const { id } = req.params;

      const contest = await Contest.findOne({ _id: id, isActive: true })
        .populate('problems.problemId', 'title description difficulty constraints inputFormat outputFormat sampleInput sampleOutput')
        .lean();
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Add current status
      const now = new Date();
      let currentStatus = 'upcoming';
      
      if (now < contest.registrationStartTime) {
        currentStatus = 'not_open';
      } else if (now >= contest.registrationStartTime && now < contest.registrationEndTime && now < contest.startTime) {
        currentStatus = 'registration_open';
      } else if (now >= contest.startTime && now < contest.endTime) {
        currentStatus = 'running';
      } else if (now >= contest.endTime) {
        currentStatus = 'completed';
      }

      contest.currentStatus = currentStatus;

      res.json({
        success: true,
        data: contest
      });

    } catch (error) {
      console.error('Error fetching contest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contest',
        error: error.message
      });
    }
  }

  /**
   * Register for a contest
   * POST /api/contests/:id/register
   */
  async registerForContest(req, res) {
    try {
      const { id } = req.params;
      const { userId, username } = req.body;

      if (!userId || !username) {
        return res.status(400).json({
          success: false,
          message: 'User ID and username are required'
        });
      }

      const contest = await Contest.findOne({ _id: id, isActive: true });
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      try {
        await contest.addContestant(userId, username);
        
        res.json({
          success: true,
          message: 'Successfully registered for contest',
          data: {
            contestId: contest._id,
            contestTitle: contest.title,
            registeredAt: new Date()
          }
        });
      } catch (registrationError) {
        res.status(400).json({
          success: false,
          message: registrationError.message
        });
      }

    } catch (error) {
      console.error('Error registering for contest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register for contest',
        error: error.message
      });
    }
  }

  /**
   * Get contest leaderboard
   * GET /api/contests/:id/leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const contest = await Contest.findOne({ _id: id, isActive: true });
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Update ranks before returning leaderboard
      contest.updateRanks();
      await contest.save();

      // Paginate contestants
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const contestants = contest.contestants
        .sort((a, b) => a.rank - b.rank)
        .slice(skip, skip + parseInt(limit));

      const totalContestants = contest.contestants.length;
      const totalPages = Math.ceil(totalContestants / parseInt(limit));

      res.json({
        success: true,
        data: {
          contestId: contest._id,
          contestTitle: contest.title,
          contestants,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount: totalContestants,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message
      });
    }
  }

  /**
   * Get contest problems
   * GET /api/contests/:id/problems
   */
  async getContestProblems(req, res) {
    try {
      const { id } = req.params;

      const contest = await Contest.findOne({ _id: id, isActive: true })
        .populate('problems.problemId')
        .lean();
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Check if contest is running or completed to show problems
      const now = new Date();
      const canViewProblems = now >= contest.startTime;

      if (!canViewProblems) {
        return res.status(403).json({
          success: false,
          message: 'Contest problems are not available yet'
        });
      }

      // Format problems for contest view
      const problems = contest.problems.map(cp => ({
        ...cp.problemId,
        contestPoints: cp.points,
        order: cp.order,
        // Remove test cases for security
        testCases: undefined
      }));

      res.json({
        success: true,
        data: {
          contestId: contest._id,
          contestTitle: contest.title,
          problems: problems.sort((a, b) => a.order - b.order)
        }
      });

    } catch (error) {
      console.error('Error fetching contest problems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contest problems',
        error: error.message
      });
    }
  }

  /**
   * Update contest
   * PUT /api/contests/:id
   */
  async updateContest(req, res) {
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

      // Don't allow updates to running or completed contests
      const existingContest = await Contest.findOne({ _id: id, isActive: true });
      if (!existingContest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      const now = new Date();
      if (now >= existingContest.startTime) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update contest that has already started'
        });
      }

      const contest = await Contest.findOneAndUpdate(
        { _id: id, isActive: true },
        req.body,
        { 
          new: true,
          runValidators: true
        }
      );

      res.json({
        success: true,
        message: 'Contest updated successfully',
        data: contest
      });

    } catch (error) {
      console.error('Error updating contest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contest',
        error: error.message
      });
    }
  }

  /**
   * Cancel a contest
   * DELETE /api/contests/:id
   */
  async cancelContest(req, res) {
    try {
      const { id } = req.params;

      const contest = await Contest.findOne({ _id: id, isActive: true });
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Don't allow cancellation of completed contests
      const now = new Date();
      if (now >= contest.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed contest'
        });
      }

      contest.status = 'cancelled';
      contest.isActive = false;
      await contest.save();

      res.json({
        success: true,
        message: 'Contest cancelled successfully'
      });

    } catch (error) {
      console.error('Error cancelling contest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel contest',
        error: error.message
      });
    }
  }

  /**
   * Get contest statistics
   * GET /api/contests/:id/stats
   */
  async getContestStats(req, res) {
    try {
      const { id } = req.params;

      const Submission = require('../models/Submission');

      const [contest, submissionStats] = await Promise.all([
        Contest.findOne({ _id: id, isActive: true }),
        Submission.aggregate([
          { $match: { contestId: mongoose.Types.ObjectId(id) } },
          {
            $group: {
              _id: {
                status: '$status',
                problemId: '$problemId'
              },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      if (!contest) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Process submission statistics
      let totalSubmissions = 0;
      const problemStats = {};
      const statusStats = {};

      submissionStats.forEach(stat => {
        totalSubmissions += stat.count;
        
        // Status statistics
        if (!statusStats[stat._id.status]) {
          statusStats[stat._id.status] = 0;
        }
        statusStats[stat._id.status] += stat.count;

        // Problem statistics
        const problemId = stat._id.problemId.toString();
        if (!problemStats[problemId]) {
          problemStats[problemId] = { total: 0, accepted: 0 };
        }
        problemStats[problemId].total += stat.count;
        if (stat._id.status === 'accepted') {
          problemStats[problemId].accepted += stat.count;
        }
      });

      res.json({
        success: true,
        data: {
          contest: {
            id: contest._id,
            title: contest.title,
            totalParticipants: contest.contestants.length,
            status: contest.status
          },
          statistics: {
            totalSubmissions,
            submissionsByStatus: statusStats,
            problemStatistics: problemStats
          }
        }
      });

    } catch (error) {
      console.error('Error fetching contest stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contest statistics',
        error: error.message
      });
    }
  }
}

module.exports = ContestController;
