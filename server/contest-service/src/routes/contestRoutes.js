const express = require('express');
const router = express.Router();
const controller = require('../controllers/contestController');

// Contest management routes
router.post('/create', controller.createContest);
router.post('/join', controller.joinContest);
router.post('/submit', controller.submitCode);

// Contest retrieval routes
router.get('/all', controller.getAllContests);
router.get('/:contestId', controller.getContest);
router.get('/history/:userId', controller.getHistory);

// Submission routes
router.get('/:contestId/submissions', controller.getContestSubmissions);
router.get('/:contestId/submissions/:userId', controller.getUserContestSubmissions);

// Contest status management
router.put('/:contestId/status', controller.updateContestStatus);

// Health check
router.get('/ping', (req,res)=> {
  console.log("Contest service is alive");
  return res.status(200).json({ message: "Contest service is alive" });
});

module.exports = router;
