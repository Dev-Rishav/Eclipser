const express = require('express');
const router = express.Router();
const controller = require('../controllers/contestController');

router.post('/create', controller.createContest);
router.post('/join', controller.joinContest);
router.post('/submit', controller.submitCode);
router.get('/history/:userId', controller.getHistory);

module.exports = router;
