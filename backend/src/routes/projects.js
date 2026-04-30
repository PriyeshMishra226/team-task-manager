const express = require('express');
const router = express.Router();
const {
  listProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { listTasks, createTask } = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');
const { isProjectMember, isProjectAdmin } = require('../middleware/rbac');
const { createProjectValidator, updateProjectValidator, addMemberValidator } = require('../validators/project');
const { createTaskValidator } = require('../validators/task');
const { validate } = require('../validators/validate');

// All project routes require authentication
router.use(isAuthenticated);

// Project CRUD
router.get('/', listProjects);
router.post('/', createProjectValidator, validate, createProject);
router.get('/:id', isProjectMember, getProject);
router.put('/:id', isProjectAdmin, updateProjectValidator, validate, updateProject);
router.delete('/:id', isProjectAdmin, deleteProject);

// Project members
router.post('/:id/members', isProjectAdmin, addMemberValidator, validate, addMember);
router.delete('/:id/members/:userId', isProjectAdmin, removeMember);

// Tasks within a project
router.get('/:id/tasks', isProjectMember, listTasks);
router.post('/:id/tasks', isProjectAdmin, createTaskValidator, validate, createTask);

module.exports = router;
