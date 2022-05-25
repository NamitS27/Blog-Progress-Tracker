const express = require('express');
const router = express.Router();
const blog = require('../controllers/blog.js');
const authenticateToken = require('../middlewares/authenticateUser.js');

router.post('/track-content-progress', authenticateToken, blog.trackContentProgress);
router.post('/log-time', authenticateToken, blog.logTime);
router.get('/get-time-spent/:blogId', authenticateToken, blog.timeSpent);

module.exports = router;
