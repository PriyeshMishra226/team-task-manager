const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { signupValidator, loginValidator } = require('../validators/auth');
const { validate } = require('../validators/validate');

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/me', isAuthenticated, getMe);

module.exports = router;
