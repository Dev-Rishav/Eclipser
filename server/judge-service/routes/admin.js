const express = require('express');
const Judge0Service = require('../services/judge0Service');

const router = express.Router();
const judge0Service = new Judge0Service();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Judge service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await judge0Service.getLanguages();
    
    // Filter to only supported languages
    const supportedLanguages = languages.filter(lang => 
      [62, 63].includes(lang.id) // Java and JavaScript
    );

    res.json({
      success: true,
      data: {
        supported: supportedLanguages,
        total: languages.length
      }
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages',
      error: error.message
    });
  }
});

// Get Judge0 system information
router.get('/system-info', async (req, res) => {
  try {
    const systemInfo = await judge0Service.getSystemInfo();
    
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system information',
      error: error.message
    });
  }
});

// Test Judge0 connection
router.get('/test-connection', async (req, res) => {
  try {
    // Simple connectivity test
    const testSubmission = await judge0Service.createSubmission({
      sourceCode: 'console.log("Hello, World!");',
      languageId: 63, // JavaScript
      stdin: ''
    });

    if (testSubmission.token) {
      res.json({
        success: true,
        message: 'Successfully connected to Judge0 API',
        data: {
          token: testSubmission.token,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to connect to Judge0 API'
      });
    }
  } catch (error) {
    console.error('Error testing Judge0 connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Judge0 API',
      error: error.message
    });
  }
});

// Get service statistics
router.get('/stats', async (req, res) => {
  try {
    const Contest = require('../models/Contest');
    const Problem = require('../models/Problem');
    const Submission = require('../models/Submission');

    const [contestCount, problemCount, submissionCount, recentSubmissions] = await Promise.all([
      Contest.countDocuments({ isActive: true }),
      Problem.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Submission.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('status language createdAt')
        .lean()
    ]);

    // Get submission statistics by status
    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {};
    submissionStats.forEach(stat => {
      statusMap[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalContests: contestCount,
          totalProblems: problemCount,
          totalSubmissions: submissionCount
        },
        submissionsByStatus: statusMap,
        recentSubmissions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: error.message
    });
  }
});

module.exports = router;
