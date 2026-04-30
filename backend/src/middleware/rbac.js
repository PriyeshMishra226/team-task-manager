const { ProjectMember } = require('../models');

/**
 * Checks if the authenticated user is a member of the project.
 * Expects req.params.id to contain the projectId.
 */
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const membership = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Checks if the authenticated user is an admin of the project.
 * Expects req.params.id to contain the projectId.
 */
const isProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const membership = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id,
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for this action.',
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isProjectMember, isProjectAdmin };
