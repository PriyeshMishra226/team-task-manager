const { Task, User, Project, ProjectMember } = require('../models');

// GET /api/projects/:id/tasks
const listTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.id },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, assignedTo, dueDate } = req.body;

    // If assignedTo is provided, verify the user is a project member
    if (assignedTo) {
      const membership = await ProjectMember.findOne({
        where: { projectId: req.params.id, userId: assignedTo },
      });
      if (!membership) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project.',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'todo',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      projectId: req.params.id,
      createdBy: req.user.id,
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({ success: true, data: { task: fullTask } });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:taskId
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Check if the user is a member of the task's project
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Check project membership
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    const isAdmin = membership.role === 'admin';
    const isAssignee = task.assignedTo === req.user.id;

    // Non-admin assignees can only update status
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins or the assigned user can update this task.',
      });
    }

    if (!isAdmin && isAssignee) {
      // Assignees can only update status
      const allowedFields = ['status'];
      const requestedFields = Object.keys(req.body);
      const disallowed = requestedFields.filter((f) => !allowedFields.includes(f));
      if (disallowed.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only update the status of tasks assigned to you.',
        });
      }
    }

    // If reassigning, verify new assignee is a project member
    if (req.body.assignedTo) {
      const assigneeMembership = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: req.body.assignedTo },
      });
      if (!assigneeMembership) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project.',
        });
      }
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;
    if (req.body.assignedTo !== undefined) updateData.assignedTo = req.body.assignedTo;

    await task.update(updateData);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });

    res.json({ success: true, data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify project admin
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project admins can delete tasks.',
      });
    }

    await task.destroy();

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/my — get all tasks assigned to current user
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedTo: req.user.id },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
