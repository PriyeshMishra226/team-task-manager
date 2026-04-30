const { body } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 200 }).withMessage('Project name must be at most 200 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
];

const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ max: 200 }).withMessage('Project name must be at most 200 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
];

const addMemberValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'member']).withMessage('Role must be either admin or member'),
];

module.exports = { createProjectValidator, updateProjectValidator, addMemberValidator };
