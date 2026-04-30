const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 255 }).withMessage('Task title must be at most 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
  body('assignedTo')
    .optional({ values: 'null' })
    .isUUID().withMessage('assignedTo must be a valid UUID'),
  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Due date must be a valid ISO date'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 255 }).withMessage('Task title must be at most 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
  body('assignedTo')
    .optional({ values: 'null' })
    .isUUID().withMessage('assignedTo must be a valid UUID'),
  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Due date must be a valid ISO date'),
];

module.exports = { createTaskValidator, updateTaskValidator };
