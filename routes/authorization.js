const express = require('express');
const router = express.Router();
const authorization = require('../controllers/authorization.js');

router.post('/sign-up', authorization.signUp);
router.post('/login', authorization.login);

module.exports = router;
