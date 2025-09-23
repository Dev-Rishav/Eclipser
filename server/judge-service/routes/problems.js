const express = require('express');
const ProblemController = require('../controllers/problemController');
const { 
  createProblemValidation, 
  updateProblemValidation, 
  mongoIdValidation,
  paginationValidation,
  sortValidation,
  testProblemValidation
} = require('../middleware/validation');
const { problemCreationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const problemController = new ProblemController();

// Create a new problem
router.post('/', 
  problemCreationLimiter,
  createProblemValidation,
  problemController.createProblem.bind(problemController)
);

// Get all problems with filtering and pagination
router.get('/',
  paginationValidation,
  sortValidation,
  problemController.getProblems.bind(problemController)
);

// Get a specific problem by ID
router.get('/:id',
  mongoIdValidation,
  problemController.getProblemById.bind(problemController)
);

// Update a problem
router.put('/:id',
  updateProblemValidation,
  problemController.updateProblem.bind(problemController)
);

// Delete a problem (soft delete)
router.delete('/:id',
  mongoIdValidation,
  problemController.deleteProblem.bind(problemController)
);

// Get problem statistics
router.get('/:id/stats',
  mongoIdValidation,
  problemController.getProblemStats.bind(problemController)
);

// Test problem with sample input
router.post('/:id/test',
  testProblemValidation,
  problemController.testProblem.bind(problemController)
);

module.exports = router;
