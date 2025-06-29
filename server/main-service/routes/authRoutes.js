const express = require('express');
const { register, login } = require('../controllers/authController');
const protect = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Example of a protected route
router.get('/admin', protect, roleCheck(['admin']), (req, res) => {
  res.send('Admin content');
});

module.exports = router;