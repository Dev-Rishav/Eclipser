const express = require('express');
const { createPost, getAllPostsByTags,getAllRemainingPosts , getPostsByUser, getPostsByType, getPostById, likePost, commentOnPost, deletePost, getTagStats } = require('../controllers/postController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.post("/remainingPosts", authMiddleware, getAllRemainingPosts);
router.post("/tags",authMiddleware, getAllPostsByTags)
router.get("/user/:userId",authMiddleware, getPostsByUser);
router.get("/type/:type", getPostsByType);
router.get("/tagStats",authMiddleware,getTagStats); // More specific route first
router.get("/:id", authMiddleware, getPostById); // Generic route last
router.put("/like/:id", authMiddleware, likePost);
router.post("/comment/:id", authMiddleware, commentOnPost);
router.delete("/:id", authMiddleware, deletePost);
// router.get("/stream",streamUpdates); //this routes is for SSE



module.exports = router;
