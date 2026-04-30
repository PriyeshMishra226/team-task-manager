const { Project, ProjectMember, User, Task, sequelize } = require('../models');

// GET /api/projects
const listProjects = async (req, res, next) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ['projectId', 'role'],
    });

    const projectIds = memberships.map((m) => m.projectId);

    const projects = await Project.findAll({
      where: { id: projectIds },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
        { model: Task, as: 'tasks', attributes: ['id'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = projects.map((p) => ({
      ...p.toJSON(),
      memberCount: p.projectMembers.length,
      taskCount: p.tasks.length,
      myRole: memberships.find((m) => m.projectId === p.id)?.role,
    }));

    res.json({ success: true, data: { projects: data } });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await sequelize.transaction(async (t) => {
      const newProject = await Project.create(
        { name, description, createdBy: req.user.id },
        { transaction: t }
      );

      await ProjectMember.create(
        { projectId: newProject.id, userId: req.user.id, role: 'admin' },
        { transaction: t }
      );

      return newProject;
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.status(201).json({ success: true, data: { project: fullProject } });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'taskCreator', attributes: ['id', 'name', 'email'] },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({
      success: true,
      data: {
        project: {
          ...project.toJSON(),
          myRole: req.membership?.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { name, description } = req.body;
    await project.update({ name: name || project.name, description: description ?? project.description });

    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await sequelize.transaction(async (t) => {
      await Task.destroy({ where: { projectId: project.id }, transaction: t });
      await ProjectMember.destroy({ where: { projectId: project.id }, transaction: t });
      await project.destroy({ transaction: t });
    });

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    const existing = await ProjectMember.findOne({
      where: { projectId: req.params.id, userId: user.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User is already a member of this project.' });
    }

    const membership = await ProjectMember.create({
      projectId: req.params.id,
      userId: user.id,
      role,
    });

    const member = await ProjectMember.findByPk(membership.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    res.status(201).json({ success: true, data: { member } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself from the project.' });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId: id, userId },
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Member not found in this project.' });
    }

    // Unassign tasks from removed member
    await Task.update(
      { assignedTo: null },
      { where: { projectId: id, assignedTo: userId } }
    );

    await membership.destroy();

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
