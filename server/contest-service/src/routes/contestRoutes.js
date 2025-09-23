const express = require('express');
const router = express.Router();
const controller = require('../controllers/contestController');

// Contest management routes
router.post('/create', controller.createContestWithProblem); // Enhanced route (main endpoint)
router.post('/create-legacy', controller.createContest); // Legacy route
router.post('/join', controller.joinContest);
router.post('/submit', controller.submitCode);

// Health check (must come before /:contestId)
router.get('/ping', (req, res) => {
  console.log("Contest service is alive");
  return res.status(200).json({ message: "Contest service is alive" });
});

// Contest retrieval routes
router.get('/all', controller.getAllContests);
router.get('/:contestId', controller.getContest);
router.get('/history/:userId', controller.getHistory);

// Submission routes
router.get('/:contestId/submissions', controller.getContestSubmissions);
router.get('/:contestId/submissions/:userId', controller.getUserContestSubmissions);

// Leaderboard route
router.get('/:contestId/leaderboard', controller.getLeaderboard);

// Contest status management
router.put('/:contestId/status', controller.updateContestStatus);

// Container management routes
router.delete('/:contestId/containers', controller.cleanupContestContainers);
router.get('/containers/active', controller.getActiveContainers);

module.exports = router;
