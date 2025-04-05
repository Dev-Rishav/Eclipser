const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { fetchUsersByIds,fetchSingleUserById } = require('../controllers/userController');

//this router is used to fetch users by their IDs on bulk, currently used in the comment section

const router = express.Router();

router.post("/bulk", authMiddleware, fetchUsersByIds);
router.get("/getUser/:userId", authMiddleware, fetchSingleUserById);

module.exports = router;
