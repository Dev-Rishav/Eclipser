const express = require('express');
const router = express.Router();
const controller = require('../controllers/contestController');

router.post('/create', controller.createContest);
router.post('/join', controller.joinContest);
router.post('/submit', controller.submitCode);
router.get('/history/:userId', controller.getHistory);
router.get('/ping', (req,res)=> {
  console.log("Contest service is alive");
  return res.status(200).json({ message: "Contest service is alive" });
});

module.exports = router;
