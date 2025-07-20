const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { fetchUsersByIds, fetchSingleUserById, fetchAllUsers } = require('../controllers/userController');
const { followUser, unfollowUser, getFollowStatus, getFollowers, getFollowing } = require('../controllers/followController');
const updateFollowerCount = require('../middlewares/updateFollowerCount');

//this router is used to fetch users by their IDs on bulk, currently used in the comment section

const router = express.Router();

// User management routes
router.get("/", authMiddleware, fetchAllUsers); // Get all users with search
router.post("/bulk", authMiddleware, fetchUsersByIds);
router.get("/getUser/:userId", authMiddleware, fetchSingleUserById);

// Follow system routes
router.post('/follow',authMiddleware, followUser, updateFollowerCount);
router.post('/unfollow',authMiddleware, unfollowUser, updateFollowerCount);
router.get("/followStats/:userId",authMiddleware,getFollowStatus);
router.get("/followers/:userId", authMiddleware, getFollowers);
router.get("/following/:userId", authMiddleware, getFollowing);

module.exports = router;
