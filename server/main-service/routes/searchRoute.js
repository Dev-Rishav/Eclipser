const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

/**
 * @route   GET /api/search
 * @desc    Search for users and posts
 * @access  Public
 */


router.get("/", searchController.searchContent);

module.exports = router;