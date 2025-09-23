const express = require('express');
const SubmissionController = require('../controllers/submissionController');
const { 
  createSubmissionValidation,
  mongoIdValidation,
  paginationValidation,
  sortValidation
} = require('../middleware/validation');
const { submissionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const submissionController = new SubmissionController();

// Create a new submission
router.post('/', 
  submissionLimiter,
  createSubmissionValidation,
  submissionController.createSubmission.bind(submissionController)
);

// Get all submissions with filtering and pagination
router.get('/',
  paginationValidation,
  sortValidation,
  submissionController.getSubmissions.bind(submissionController)
);

// Get a specific submission by ID
router.get('/:id',
  mongoIdValidation,
  submissionController.getSubmissionById.bind(submissionController)
);

// Get submission status (for polling)
router.get('/:id/status',
  mongoIdValidation,
  submissionController.getSubmissionStatus.bind(submissionController)
);

// Rejudge a submission
router.post('/:id/rejudge',
  mongoIdValidation,
  submissionController.rejudgeSubmission.bind(submissionController)
);

module.exports = router;
