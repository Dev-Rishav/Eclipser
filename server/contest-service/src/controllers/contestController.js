const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const { codeQueue } = require('../utils/queue');
const socketService = require('../utils/socketService');

exports.createContest = async (req, res) => {
  try {
    const { users, problemId, startTime, endTime } = req.body;
    const contest = await Contest.create({
      users,
      problemId,
      status: 'pending',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours from now
      submissions: [],
      winner: null
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
    res.status(500).json({ error: error.message });
  }
};

exports.joinContest = async (req, res) => {
  try {
    const { contestId, userId } = req.body;
    const contest = await Contest.findById(contestId);
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if (contest.users.includes(userId)) {
      return res.status(400).json({ error: 'User already in contest' });
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      contestId, 
      { 
        $push: { users: userId },
        status: 'running'
      },
      { new: true }
    );
    
    // Notify contest participants about new user joining
    socketService.emitContestUpdate({
      contestId,
      type: 'user_joined',
      userId,
      contest: updatedContest,
      message: `User ${userId} joined the contest`
    });
    
    res.json({ message: 'Joined contest successfully', contest: updatedContest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { contestId, userId, code, language } = req.body;
    
    // Validate contest exists and is running
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    if (contest.status !== 'running') {
      return res.status(400).json({ error: 'Contest is not currently running' });
    }

    if (!contest.users.includes(userId)) {
      return res.status(400).json({ error: 'User not registered for this contest' });
    }

    // Create submission record
    const submission = await Submission.create({
      userId,
      code,
      language,
      submittedAt: new Date(),
      result: { status: 'pending' } // Will be updated by worker
    });

    // Add submission to contest
    await Contest.findByIdAndUpdate(contestId, {
      $push: { submissions: submission._id }
    });

    // Add to queue for processing
    const job = await codeQueue.add({ 
      contestId, 
      userId, 
      code, 
      language,
      submissionId: submission._id
    });
    
    res.json({ 
      message: 'Code submitted successfully', 
      submissionId: submission._id,
      jobId: job.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const contests = await Contest.find({ users: userId })
      .populate('submissions')
      .sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contest details with submissions
exports.getContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const contest = await Contest.findById(contestId)
      .populate('submissions');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contests
exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('submissions')
      .sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contest submissions
exports.getContestSubmissions = async (req, res) => {
  try {
    const { contestId } = req.params;
    const contest = await Contest.findById(contestId)
      .populate('submissions');

      // console.log(contest);
      
    
    if (!contest) {
      return res.status(404).json({ error: ' Contest not found' });
    }
    
    res.json(contest.submissions);
  } catch (error) {
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
    ).populate('submissions');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    res.json({ message: 'Contest updated successfully', contest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's submissions for a specific contest
exports.getUserContestSubmissions = async (req, res) => {
  try {
    const { contestId, userId } = req.params;
    
    const contest = await Contest.findById(contestId)
      .populate({
        path: 'submissions',
        match: { userId: userId }
      });
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    res.json(contest.submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
