const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { codeQueue } = require('../utils/queue');
const socketService = require('../utils/socketService');

// Create contest with questions and test cases via POST body
exports.createContestWithProblem = async (req, res) => {
  try {
    const {
      // Contest details
      title,
      description,
      startTime,
      endTime,
      maxParticipants,
      isPublic,
      createdBy,
      // Problem details
      questions // Array of question objects with title, description, testCases, etc.
    } = req.body;

    console.log('🎯 Creating contest with questions:', { title, questionsCount: questions?.length });

    // Validate required fields
    if (!title || !createdBy || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, createdBy, questions array with at least one question'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.title || !question.description) {
        return res.status(400).json({ 
          error: `Question ${i + 1} missing required fields: title, description` 
        });
      }
      if (!question.testCases || question.testCases.length === 0) {
        return res.status(400).json({ 
          error: `Question ${i + 1} must have at least one test case` 
        });
      }
      // Validate test case structure
      for (let j = 0; j < question.testCases.length; j++) {
        const testCase = question.testCases[j];
        if (typeof testCase.input === 'undefined' || typeof testCase.expectedOutput === 'undefined') {
          return res.status(400).json({ 
            error: `Question ${i + 1}, test case ${j + 1} must have input and expectedOutput` 
          });
        }
      }
    }

    // Create problems from questions
    const problems = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const problem = new Problem({
        title: question.title,
        description: question.description,
        difficulty: question.difficulty || 'medium',
        timeLimit: question.timeLimit || 2000, // 2 seconds default
        memoryLimit: question.memoryLimit || 256, // 256MB default
        examples: question.examples || [],
        constraints: question.constraints || [],
        hints: question.hints || [],
        testCases: question.testCases.map(tc => ({
          input: tc.input.toString(),
          expectedOutput: tc.expectedOutput.toString(),
          isHidden: tc.isHidden || false,
          weight: tc.weight || 1
        })),
        tags: question.tags || [],
        supportedLanguages: question.supportedLanguages || ['python', 'javascript', 'java', 'cpp'],
        starterCode: question.starterCode || {},
        createdBy,
        isPublic: false // Contest problems start as private
      });

      await problem.save();
      problems.push(problem);
      console.log(`✅ Created problem: ${problem.title} with ${problem.testCases.length} test cases`);
    }

    // Create the contest with the first problem (single problem contests for now)
    const mainProblem = problems[0]; // Use first question as main problem
    
    const contest = new Contest({
      title,
      description: description || `Programming contest with ${problems.length} problem(s)`,
      users: [],
      problem: mainProblem._id,
      problemId: mainProblem._id.toString(),
      status: 'pending',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours
      submissions: [],
      maxParticipants: maxParticipants || 100,
      isPublic: isPublic !== false, // Default to true
      createdBy,
      leaderboard: [],
      winner: null,
      rules: {
        allowMultipleSubmissions: true,
        submissionLimit: 10,
        penaltyPerWrongSubmission: 5 // 5 minute penalty
      }
    });

    await contest.save();
    console.log(`🎉 Contest created: ${contest.title} (ID: ${contest._id})`);
    
    // Notify all clients about new contest
    socketService.emitContestUpdate({
      contestId: contest._id,
      type: 'contest_created',
      contest: {
        id: contest._id,
        title: contest.title,
        status: contest.status,
        participantCount: contest.users.length
      },
      problem: {
        id: mainProblem._id,
        title: mainProblem.title,
        difficulty: mainProblem.difficulty,
        testCaseCount: mainProblem.testCases.length
      },
      message: `New contest "${contest.title}" created with problem "${mainProblem.title}"`
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Contest created successfully with questions and test cases',
      data: {
        contestId: contest._id,
        contest: {
          id: contest._id,
          title: contest.title,
          description: contest.description,
          status: contest.status,
          startTime: contest.startTime,
          endTime: contest.endTime,
          maxParticipants: contest.maxParticipants,
          currentParticipants: contest.users.length,
          isPublic: contest.isPublic,
          createdBy: contest.createdBy,
          createdAt: contest.createdAt
        },
        problem: {
          id: mainProblem._id,
          title: mainProblem.title,
          description: mainProblem.description,
          difficulty: mainProblem.difficulty,
          timeLimit: mainProblem.timeLimit,
          memoryLimit: mainProblem.memoryLimit,
          supportedLanguages: mainProblem.supportedLanguages,
          totalTestCases: mainProblem.testCases.length,
          publicTestCases: mainProblem.testCases.filter(tc => !tc.isHidden).length
        },
        totalProblemsCreated: problems.length
      }
    });

  } catch (error) {
    console.error('❌ Error creating contest with questions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to create contest'
    });
  }
};

// Legacy create contest (for backward compatibility)
exports.createContest = async (req, res) => {
  try {
    const { users, problemId, startTime, endTime, title, description, createdBy } = req.body;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const contest = await Contest.create({
      title: title || `Contest for ${problem.title}`,
      description: description || '',
      users: users || [],
      problem: problemId,
      problemId, // For backward compatibility
      status: 'pending',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 2 * 60 * 60 * 1000),
      submissions: [],
      maxParticipants: 100,
      isPublic: true,
      createdBy: createdBy || 'system',
      leaderboard: [],
      winner: null,
      rules: {
        allowMultipleSubmissions: true,
        submissionLimit: 50,
        penaltyPerWrongSubmission: 0
      }
    });
    
    // Notify all clients about new contest
    socketService.emitContestUpdate({
      contestId: contest._id,
      type: 'contest_created',
      contest,
      message: 'New contest created'
    });
    
    res.json({ contestId: contest._id, contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.joinContest = async (req, res) => {
  try {
    const { contestId, userId, username } = req.body;
    const contest = await Contest.findById(contestId).populate('problem');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if (contest.users.includes(userId)) {
      return res.status(400).json({ error: 'User already in contest' });
    }

    // Check max participants limit
    if (contest.users.length >= contest.maxParticipants) {
      return res.status(400).json({ error: 'Contest is full' });
    }

    // Check if contest is still open for joining
    const now = new Date();
    if (contest.status === 'finished') {
      return res.status(400).json({ error: 'Contest has already finished' });
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      contestId, 
      { 
        $push: { users: userId },
        status: contest.status === 'pending' ? 'running' : contest.status
      },
      { new: true }
    ).populate('problem');
    
    // Add user to leaderboard
    updatedContest.leaderboard.push({
      userId,
      username: username || `User-${userId.slice(-6)}`,
      score: 0,
      totalSubmissions: 0,
      lastSubmissionTime: now,
      bestSubmissionTime: 0,
      rank: updatedContest.leaderboard.length + 1
    });

    await updatedContest.save();
    
    // Notify contest participants about new user joining
    socketService.emitContestUpdate({
      contestId,
      type: 'user_joined',
      userId,
      username,
      contest: updatedContest,
      message: `${username || 'User'} joined the contest`
    });
    
    res.json({ 
      message: 'Joined contest successfully', 
      contest: updatedContest,
      problem: {
        ...updatedContest.problem.toObject(),
        testCases: updatedContest.problem.testCases.filter(tc => !tc.isHidden) // Only send sample test cases
      }
    });
  } catch (error) {
    console.error('Error joining contest:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { contestId, userId, code, language, username } = req.body;
    
    console.log(`📝 Code submission received: Contest ${contestId}, User ${userId}, Language ${language}`);
    
    // Validate required fields
    if (!contestId || !userId || !code || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: contestId, userId, code, language' 
      });
    }
    
    // Validate contest exists and is running
    const contest = await Contest.findById(contestId).populate('problem');
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    if (contest.status !== 'running') {
      return res.status(400).json({ 
        error: `Contest is not running (current status: ${contest.status})` 
      });
    }

    if (!contest.users.includes(userId)) {
      return res.status(400).json({ 
        error: 'User not registered for this contest. Please join the contest first.' 
      });
    }

    // Check submission limits
    const userSubmissionCount = await Submission.countDocuments({ 
      contestId, 
      userId 
    });

    if (userSubmissionCount >= contest.rules.submissionLimit) {
      return res.status(400).json({ 
        error: `Maximum ${contest.rules.submissionLimit} submissions allowed per user` 
      });
    }

    // Validate programming language
    const problem = contest.problem;
    if (!problem.supportedLanguages.includes(language)) {
      return res.status(400).json({ 
        error: `Language "${language}" not supported for this problem. Supported: ${problem.supportedLanguages.join(', ')}` 
      });
    }

    // Create submission record
    const submission = await Submission.create({
      contestId,
      problemId: problem._id,
      userId,
      username: username || `User-${userId.slice(-6)}`,
      code: code.trim(),
      language,
      submittedAt: new Date(),
      status: 'pending',
      result: {
        overallStatus: 'pending',
        score: 0,
        totalTestCases: problem.testCases.length,
        passedTestCases: 0,
        testCaseResults: [],
        verdict: 'pending',
        executionTime: 0,
        memoryUsed: 0
      }
    });

    console.log(`✅ Submission created: ${submission._id}`);

    // Add submission to contest
    await Contest.findByIdAndUpdate(contestId, {
      $push: { submissions: submission._id }
    });

    // Add to Docker execution queue with high priority
    const job = await codeQueue.add('execute-code', {
      contestId,
      problemId: problem._id,
      userId,
      username: username || `User-${userId.slice(-6)}`,
      code: code.trim(),
      language,
      submissionId: submission._id.toString(),
      testCases: problem.testCases,
      timeLimit: problem.timeLimit || 2000,
      memoryLimit: problem.memoryLimit || 256
    }, {
      priority: 10, // High priority for real-time execution
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    console.log(`� Queued submission ${submission._id} for Docker execution (Job: ${job.id})`);

    // Immediate response to client with submission details
    res.json({
      success: true,
      message: 'Code submitted successfully! Docker container is spinning up...',
      data: {
        submissionId: submission._id,
        contestId,
        problemId: problem._id,
        queuePosition: await getQueuePosition(job.id),
        estimatedProcessingTime: '5-15 seconds',
        totalTestCases: problem.testCases.length,
        status: 'queued_for_execution'
      }
    });

    // Notify contest room about new submission
    socketService.emitContestUpdate({
      contestId,
      type: 'new_submission',
      userId,
      username: username || 'User',
      submissionId: submission._id,
      language,
      timestamp: new Date(),
      message: `${username || 'User'} submitted a ${language} solution - Docker execution started`
    });

  } catch (error) {
    console.error('❌ Error submitting code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Submission failed'
    });
  }
};

// Utility function to get queue position
async function getQueuePosition(jobId) {
  try {
    const waiting = await codeQueue.getJobs(['waiting']);
    const position = waiting.findIndex(job => job.id === jobId);
    return position === -1 ? 0 : position + 1;
  } catch {
    return 0;
  }
}

exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const contests = await Contest.find({ users: userId })
      .populate('problem')
      .populate({
        path: 'submissions',
        match: { userId: userId }
      })
      .sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    console.error('Error getting contest history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get contest details with problem and submissions
exports.getContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { includeHiddenTestCases } = req.query;
    
    const contest = await Contest.findById(contestId)
      .populate('problem')
      .populate('submissions');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    // Filter test cases based on user permissions
    if (contest.problem && includeHiddenTestCases !== 'true') {
      contest.problem.testCases = contest.problem.testCases.filter(tc => !tc.isHidden);
    }
    
    res.json(contest);
  } catch (error) {
    console.error('Error getting contest:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all contests
exports.getAllContests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      isPublic, 
      createdBy 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (createdBy) query.createdBy = createdBy;

    const contests = await Contest.find(query)
      .populate('problem', '-testCases') // Exclude test cases for security
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Contest.countDocuments(query);

    res.json({
      contests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting contests:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get contest submissions
exports.getContestSubmissions = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    const submissions = await Submission.find({ contestId })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Submission.countDocuments({ contestId });
    
    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting contest submissions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update contest status (for admin/system use)
exports.updateContestStatus = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { status, winner } = req.body;
    
    const updateData = { status };
    if (winner) {
      updateData.winner = winner;
    }
    
    const contest = await Contest.findByIdAndUpdate(
      contestId,
      updateData,
      { new: true }
    ).populate('problem').populate('submissions');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Emit status update
    socketService.emitContestUpdate({
      contestId,
      type: 'status_updated',
      contest,
      message: `Contest status updated to ${status}`
    });
    
    res.json({ message: 'Contest updated successfully', contest });
  } catch (error) {
    console.error('Error updating contest status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's submissions for a specific contest
exports.getUserContestSubmissions = async (req, res) => {
  try {
    const { contestId, userId } = req.params;
    
    const submissions = await Submission.find({ 
      contestId, 
      userId 
    }).sort({ submittedAt: -1 });
    
    if (submissions.length === 0) {
      return res.json([]);
    }
    
    res.json(submissions);
  } catch (error) {
    console.error('Error getting user contest submissions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get contest leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    res.json({
      contestId,
      leaderboard: contest.leaderboard.sort((a, b) => a.rank - b.rank),
      totalParticipants: contest.users.length
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Container management methods
exports.cleanupContestContainers = async (req, res) => {
  try {
    const { contestId } = req.params;
    
    // Import Docker executor
    const DockerExecutor = require('../services/dockerExecutor');
    const dockerExecutor = new DockerExecutor();
    
    console.log(`🧹 Cleaning up containers for contest: ${contestId}`);
    await dockerExecutor.cleanupContestContainers(contestId);
    
    res.json({ 
      message: `Containers cleaned up for contest ${contestId}`,
      success: true 
    });
  } catch (error) {
    console.error('Error cleaning up containers:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveContainers = async (req, res) => {
  try {
    // Import Docker executor
    const DockerExecutor = require('../services/dockerExecutor');
    const dockerExecutor = new DockerExecutor();
    
    const activeContainers = dockerExecutor.getActiveContainers();
    
    res.json({
      success: true,
      activeContainers
    });
  } catch (error) {
    console.error('Error getting active containers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update contest status and handle container cleanup
exports.updateContestStatus = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { status } = req.body;
    
    const contest = await Contest.findByIdAndUpdate(
      contestId,
      { status },
      { new: true }
    );

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // If contest is ending or cancelled, clean up containers
    if (status === 'ended' || status === 'cancelled') {
      console.log(`🧹 Contest ${contestId} is ${status}, cleaning up containers...`);
      
      try {
        const DockerExecutor = require('../services/dockerExecutor');
        const dockerExecutor = new DockerExecutor();
        await dockerExecutor.cleanupContestContainers(contestId);
        console.log(`✅ Containers cleaned up for contest ${contestId}`);
      } catch (cleanupError) {
        console.error(`⚠️ Failed to cleanup containers for contest ${contestId}:`, cleanupError);
      }
    }

    res.json({
      success: true,
      contest: {
        id: contest._id,
        title: contest.title,
        status: contest.status
      }
    });
  } catch (error) {
    console.error('Error updating contest status:', error);
    res.status(500).json({ error: error.message });
  }
};
