const express = require('express');
const router = express.Router();
const blog = require('../controllers/blog.js');
const authenticateToken = require('../middlewares/authenticateUser.js');

router.post('/track-content-progress', authenticateToken, blog.trackContentProgress);
router.get('/blog-progress/:blogId', authenticateToken, blog.fetchBlogProgress);
router.post('/log-time', authenticateToken, blog.logTime);
router.get('/time-spent/:blogId', authenticateToken, blog.timeSpent);
router.post('/create-blog', authenticateToken, blog.createBlog);
router.post('/update-blog', authenticateToken, blog.updateBlog);

module.exports = router;
