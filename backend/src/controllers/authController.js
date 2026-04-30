const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/signup
const signup = async (req, res, next) => {
  console.log(`[AUTH] Incoming signup request for email: ${req.body?.email}`);
  try {
    const { name, email, password } = req.body;
    
    console.log(`[AUTH] Validating existing user...`);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`[AUTH] User with email ${email} already exists.`);
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    console.log(`[AUTH] Creating new user...`);
    const user = await User.scope('withPassword').create({ name, email, password });
    
    console.log(`[AUTH] User created successfully. ID: ${user.id}`);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`[AUTH] Error during signup:`, error);
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  console.log(`[AUTH] Incoming login request for email: ${req.body?.email}`);
  try {
    const { email, password } = req.body;

    console.log(`[AUTH] Fetching user by email...`);
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      console.log(`[AUTH] User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    console.log(`[AUTH] Verifying password...`);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[AUTH] Password verification failed for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    console.log(`[AUTH] Login successful. Generating token for User ID: ${user.id}`);
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`[AUTH] Error during login:`, error);
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe };
