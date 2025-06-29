const Contest = require('../models/Contest');
const { codeQueue } = require('../utils/queue');

exports.createContest = async (req, res) => {
  const { users, problemId } = req.body;
  const contest = await Contest.create({
    users,
    problemId,
    status: 'pending',
    startTime: new Date(),
  });
  res.json({ contestId: contest._id });
};

exports.joinContest = async (req, res) => {
  const { contestId } = req.body;
  const contest = await Contest.findByIdAndUpdate(contestId, { status: 'running' });
  res.json({ message: 'Joined contest', contest });
};

exports.submitCode = async (req, res) => {
  const { contestId, userId, code, language } = req.body;
  const job = await codeQueue.add({ contestId, userId, code, language });
  res.json({ message: 'Code submitted', jobId: job.id });
};

exports.getHistory = async (req, res) => {
  const { userId } = req.params;
  const contests = await Contest.find({ users: userId });
  res.json(contests);
};
