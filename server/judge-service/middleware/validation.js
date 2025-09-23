const { body, param, query } = require('express-validator');

// Problem validation rules
const createProblemValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('testCases')
    .isArray({ min: 1 })
    .withMessage('At least one test case is required'),
  
  body('testCases.*.input')
    .isString()
    .withMessage('Test case input must be a string'),
  
  body('testCases.*.expectedOutput')
    .notEmpty()
    .withMessage('Test case expected output is required'),
  
  body('timeLimit')
    .optional()
    .isFloat({ min: 0.1, max: 10 })
    .withMessage('Time limit must be between 0.1 and 10 seconds'),
  
  body('memoryLimit')
    .optional()
    .isInt({ min: 16, max: 512 })
    .withMessage('Memory limit must be between 16 and 512 MB'),
  
  body('supportedLanguages')
    .isArray({ min: 1 })
    .withMessage('At least one supported language is required'),
  
  body('supportedLanguages.*')
    .isIn(['javascript', 'java'])
    .withMessage('Supported languages must be javascript or java'),
  
  body('createdBy')
    .notEmpty()
    .withMessage('Creator ID is required')
];

const updateProblemValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid problem ID'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard')
];

// Contest validation rules
const createContestValidation = [
  body('title')
    .notEmpty()
    .withMessage('Contest title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('duration')
    .isInt({ min: 30, max: 10080 })
    .withMessage('Duration must be between 30 minutes and 7 days'),
  
  body('problems')
    .isArray({ min: 1 })
    .withMessage('At least one problem is required'),
  
  body('problems.*.problemId')
    .isMongoId()
    .withMessage('Invalid problem ID'),
  
  body('problems.*.points')
    .isInt({ min: 1 })
    .withMessage('Problem points must be at least 1'),
  
  body('problems.*.order')
    .isInt({ min: 1 })
    .withMessage('Problem order must be at least 1'),
  
  body('registrationEndTime')
    .isISO8601()
    .withMessage('Registration end time must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) >= new Date(req.body.startTime)) {
        throw new Error('Registration must end before contest starts');
      }
      return true;
    }),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),
  
  body('scoringType')
    .optional()
    .isIn(['icpc', 'ioi'])
    .withMessage('Scoring type must be icpc or ioi'),
  
  body('allowedLanguages')
    .isArray({ min: 1 })
    .withMessage('At least one allowed language is required'),
  
  body('allowedLanguages.*')
    .isIn(['javascript', 'java'])
    .withMessage('Allowed languages must be javascript or java'),
  
  body('createdBy')
    .notEmpty()
    .withMessage('Creator ID is required')
];

const updateContestValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contest ID'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO date'),
  
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO date')
];

const registerContestValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contest ID'),
  
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
];

// Submission validation rules
const createSubmissionValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  
  body('contestId')
    .isMongoId()
    .withMessage('Invalid contest ID'),
  
  body('problemId')
    .isMongoId()
    .withMessage('Invalid problem ID'),
  
  body('sourceCode')
    .notEmpty()
    .withMessage('Source code is required')
    .isLength({ max: 50000 })
    .withMessage('Source code must not exceed 50000 characters'),
  
  body('language')
    .isIn(['javascript', 'java'])
    .withMessage('Language must be javascript or java')
];

// Parameter validations
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Query validations
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const sortValidation = [
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const testProblemValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid problem ID'),
  
  body('sourceCode')
    .notEmpty()
    .withMessage('Source code is required')
    .isLength({ max: 50000 })
    .withMessage('Source code must not exceed 50000 characters'),
  
  body('language')
    .isIn(['javascript', 'java'])
    .withMessage('Language must be javascript or java')
];

module.exports = {
  // Problem validations
  createProblemValidation,
  updateProblemValidation,
  testProblemValidation,
  
  // Contest validations
  createContestValidation,
  updateContestValidation,
  registerContestValidation,
  
  // Submission validations
  createSubmissionValidation,
  
  // Common validations
  mongoIdValidation,
  paginationValidation,
  sortValidation
};
