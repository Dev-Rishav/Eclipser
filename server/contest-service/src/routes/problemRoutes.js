const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Problem management routes
router.post('/', problemController.createProblem);
router.get('/', problemController.getAllProblems);
router.get('/:problemId', problemController.getProblemById);
router.put('/:problemId', problemController.updateProblem);
router.delete('/:problemId', problemController.deleteProblem);

// Test case management
router.post('/:problemId/test-cases', problemController.uploadTestCases);

// Statistics
router.get('/:problemId/stats', problemController.getProblemStats);

module.exports = router;
