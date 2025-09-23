const express = require('express');
const ContestController = require('../controllers/contestController');
const { 
  createContestValidation, 
  updateContestValidation,
  registerContestValidation,
  mongoIdValidation,
  paginationValidation,
  sortValidation
} = require('../middleware/validation');
const { contestCreationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const contestController = new ContestController();

// Create a new contest
router.post('/', 
  contestCreationLimiter,
  createContestValidation,
  contestController.createContest.bind(contestController)
);

// Get all contests with filtering and pagination
router.get('/',
  paginationValidation,
  sortValidation,
  contestController.getContests.bind(contestController)
);

// Get a specific contest by ID
router.get('/:id',
  mongoIdValidation,
  contestController.getContestById.bind(contestController)
);

// Update a contest
router.put('/:id',
  updateContestValidation,
  contestController.updateContest.bind(contestController)
);

// Cancel a contest
router.delete('/:id',
  mongoIdValidation,
  contestController.cancelContest.bind(contestController)
);

// Register for a contest
router.post('/:id/register',
  registerContestValidation,
  contestController.registerForContest.bind(contestController)
);

// Get contest leaderboard
router.get('/:id/leaderboard',
  mongoIdValidation,
  paginationValidation,
  contestController.getLeaderboard.bind(contestController)
);

// Get contest problems
router.get('/:id/problems',
  mongoIdValidation,
  contestController.getContestProblems.bind(contestController)
);

// Get contest statistics
router.get('/:id/stats',
  mongoIdValidation,
  contestController.getContestStats.bind(contestController)
);

module.exports = router;
