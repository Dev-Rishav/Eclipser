const Problem = require('../models/Problem');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads (test case files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/test-cases/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only .txt, .in, .out files for test cases
    const allowedExtensions = ['.txt', '.in', '.out', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .in, .out, .json files are allowed.'));
    }
  }
});

// Create new problem
exports.createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      timeLimit,
      memoryLimit,
      examples,
      constraints,
      hints,
      testCases,
      tags,
      createdBy,
      isPublic,
      supportedLanguages,
      starterCode
    } = req.body;

    // Validate required fields
    if (!title || !description || !difficulty || !createdBy) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, difficulty, createdBy'
      });
    }

    // Validate test cases
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        error: 'At least one test case is required'
      });
    }

    // Ensure at least one sample test case exists
    const hasSampleTestCase = testCases.some(tc => !tc.isHidden);
    if (!hasSampleTestCase) {
      return res.status(400).json({
        error: 'At least one sample (non-hidden) test case is required'
      });
    }

    const problem = new Problem({
      title,
      description,
      difficulty,
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 128,
      examples: examples || [],
      constraints: constraints || [],
      hints: hints || [],
      testCases: testCases || [],
      tags: tags || [],
      createdBy,
      isPublic: isPublic !== undefined ? isPublic : false,
      supportedLanguages: supportedLanguages || ['python', 'javascript', 'java', 'cpp', 'c'],
      starterCode: starterCode || {}
    });

    const savedProblem = await problem.save();
    res.status(201).json({
      message: 'Problem created successfully',
      problem: savedProblem
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all problems
exports.getAllProblems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty,
      tags,
      search,
      createdBy,
      isPublic
    } = req.query;

    const query = {};
    
    // Build query filters
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };
    if (createdBy) query.createdBy = createdBy;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const problems = await Problem.find(query)
      .select('-testCases') // Exclude test cases for security
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get problem by ID
exports.getProblemById = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { includeHiddenTestCases } = req.query;

    let problem;
    if (includeHiddenTestCases === 'true') {
      // Only for contest creation or admin purposes
      problem = await Problem.findById(problemId);
    } else {
      // For contestants - exclude hidden test cases
      problem = await Problem.findById(problemId, {
        'testCases': {
          $filter: {
            input: '$testCases',
            cond: { $eq: ['$$this.isHidden', false] }
          }
        }
      });
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update problem
exports.updateProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;

    const problem = await Problem.findByIdAndUpdate(
      problemId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete problem
exports.deleteProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const problem = await Problem.findByIdAndDelete(problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload test cases from files
exports.uploadTestCases = [
  upload.array('testCaseFiles', 20), // Max 20 files
  async (req, res) => {
    try {
      const { problemId } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Process uploaded files and create test cases
      const newTestCases = [];
      const fs = require('fs').promises;

      for (const file of files) {
        const content = await fs.readFile(file.path, 'utf8');
        
        // Parse file based on extension
        if (file.originalname.includes('.in')) {
          // Input file
          const baseName = file.originalname.replace('.in', '');
          const outputFile = files.find(f => f.originalname === baseName + '.out');
          
          if (outputFile) {
            const outputContent = await fs.readFile(outputFile.path, 'utf8');
            newTestCases.push({
              input: content.trim(),
              expectedOutput: outputContent.trim(),
              isHidden: true, // Default to hidden
              weight: 1,
              timeLimit: problem.timeLimit,
              memoryLimit: problem.memoryLimit
            });
          }
        } else if (file.originalname.endsWith('.json')) {
          // JSON format test cases
          const testCaseData = JSON.parse(content);
          if (Array.isArray(testCaseData)) {
            newTestCases.push(...testCaseData);
          } else {
            newTestCases.push(testCaseData);
          }
        }
      }

      // Add new test cases to problem
      problem.testCases.push(...newTestCases);
      await problem.save();

      // Clean up uploaded files
      for (const file of files) {
        await fs.unlink(file.path).catch(err => console.warn('Failed to delete file:', err));
      }

      res.json({
        message: `${newTestCases.length} test cases added successfully`,
        testCases: newTestCases
      });
    } catch (error) {
      console.error('Error uploading test cases:', error);
      res.status(500).json({ error: error.message });
    }
  }
];

// Get problem statistics
exports.getProblemStats = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const Submission = require('../models/Submission');
    
    const stats = await Submission.aggregate([
      { $match: { problemId: problemId } },
      {
        $group: {
          _id: '$result.overallStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubmissions = await Submission.countDocuments({ problemId });
    
    res.json({
      problemId,
      totalSubmissions,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching problem stats:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
