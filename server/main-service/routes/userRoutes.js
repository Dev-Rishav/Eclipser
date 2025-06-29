const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { fetchUsersByIds,fetchSingleUserById } = require('../controllers/userController');
const { followUser, unfollowUser, getFollowStatus } = require('../controllers/followController');
const updateFollowerCount = require('../middlewares/updateFollowerCount');

//this router is used to fetch users by their IDs on bulk, currently used in the comment section

const router = express.Router();

router.post("/bulk", authMiddleware, fetchUsersByIds);
router.get("/getUser/:userId", authMiddleware, fetchSingleUserById);
router.post('/follow',authMiddleware, followUser, updateFollowerCount);
router.post('/unfollow',authMiddleware, unfollowUser, updateFollowerCount);
router.get("/followStats/:userId",authMiddleware,getFollowStatus);


module.exports = router;
