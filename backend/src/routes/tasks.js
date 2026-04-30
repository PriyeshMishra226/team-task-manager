const express = require('express');
const router = express.Router();
const { getTask, updateTask, deleteTask, getMyTasks } = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');
const { updateTaskValidator } = require('../validators/task');
const { validate } = require('../validators/validate');

router.use(isAuthenticated);

// My tasks across all projects
router.get('/my', getMyTasks);

// Single task operations
router.get('/:taskId', getTask);
router.put('/:taskId', updateTaskValidator, validate, updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
