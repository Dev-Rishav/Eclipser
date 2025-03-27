const express = require('express');
const { createPost, getAllPosts, getPostsByUser, getPostsByType, likePost, commentOnPost, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", getAllPosts);
router.get("/user/:userId", getPostsByUser);
router.get("/type/:type", getPostsByType);
router.put("/like/:id", authMiddleware, likePost);
router.post("/comment/:id", authMiddleware, commentOnPost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
