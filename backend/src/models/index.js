const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// ── User ↔ Project (creator) ──
User.hasMany(Project, { foreignKey: 'createdBy', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// ── User ↔ Project (many-to-many via ProjectMember) ──
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'members',
});

// ── ProjectMember associations ──
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'memberships' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers' });

// ── Task associations ──
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });

Task.belongsTo(User, { foreignKey: 'createdBy', as: 'taskCreator' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
};
