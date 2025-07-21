const redisClient = require("../configs/redis");
const searchService = require("../services/searchService");

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour

/**
 * Controller to handle searching for content (users and posts).
 * Manages caching logic and calls the search service for database queries.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const searchContent = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query cannot be empty" });
  }

  const searchQuery = q.trim();
  const cacheKey = `search:${searchQuery}`;
  console.log(`Searching for: "${searchQuery}" with cache key: "${cacheKey}"`);
  

  try {
    // 1. Check Redis Cache
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      console.log(`CACHE HIT for query: "${searchQuery}"`);
      return res.json(JSON.parse(cachedResults));
    }

    console.log(`CACHE MISS for query: "${searchQuery}". Querying DB...`);

    // 2. If no cache, call the service to fetch from the database
    const results = await searchService.fetchFromDatabase(searchQuery);

    // 3. Cache the new results in Redis
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION_SECONDS, JSON.stringify(results));
    
    // 4. Send the response
    res.json(results);

  } catch (error) {
    console.error("Error in search controller:", error.message);
    res.status(500).json({ message: "An error occurred on the server during the search." });
  }
};

module.exports = {
  searchContent,
};