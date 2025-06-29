const Contest = require('../models/Contest');
const { codeQueue } = require('../utils/queue');

exports.createContest = async (req, res) => {
  try {
    const { users, problemId } = req.body;
    const contest = await Contest.create({
      users,
      problemId,
      status: 'pending',
      startTime: new Date(),
    });
    res.json({ contestId: contest._id });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ error: 'Failed to create contest' });
  }
};

exports.joinContest = async (req, res) => {
  try {
    const { contestId } = req.body;
    const contest = await Contest.findByIdAndUpdate(contestId, { status: 'running' });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    res.json({ message: 'Joined contest', contest });
  } catch (error) {
    console.error('Error joining contest:', error);
    res.status(500).json({ error: 'Failed to join contest' });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { contestId, userId, code, language } = req.body;
    if (!codeQueue) {
      return res.status(500).json({ error: 'Code queue not available' });
    }
    const job = await codeQueue.add({ contestId, userId, code, language });
    res.json({ message: 'Code submitted', jobId: job.id });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const contests = await Contest.find({ users: userId });
    res.json(contests);
  } catch (error) {
    console.error('Error fetching contest history:', error);
    res.status(500).json({ error: 'Failed to fetch contest history' });