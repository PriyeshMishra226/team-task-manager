require('dotenv').config();
const { sequelize, User, Project, ProjectMember, Task } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (force: true — all tables recreated)');

    // ── Create Users ──
    const admin = await User.scope('withPassword').create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      role: 'admin',
    });

    const member = await User.scope('withPassword').create({
      name: 'Sam Rivera',
      email: 'sam@example.com',
      password: 'password123',
      role: 'member',
    });

    console.log('✅ Users created');

    // ── Create Projects ──
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved UX. Includes new landing page, about section, and contact forms.',
      createdBy: admin.id,
    });

    const project2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build the minimum viable product for our mobile application. Focus on core features: authentication, dashboard, and notifications.',
      createdBy: admin.id,
    });

    console.log('✅ Projects created');

    // ── Add Members ──
    await ProjectMember.bulkCreate([
      { projectId: project1.id, userId: admin.id, role: 'admin' },
      { projectId: project1.id, userId: member.id, role: 'member' },
      { projectId: project2.id, userId: admin.id, role: 'admin' },
      { projectId: project2.id, userId: member.id, role: 'member' },
    ]);

    console.log('✅ Project members added');

    // ── Create Tasks ──
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    await Task.bulkCreate([
      {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage design. Include hero section, features grid, and testimonials.',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow.toISOString().split('T')[0],
        projectId: project1.id,
        assignedTo: admin.id,
        createdBy: admin.id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a responsive navigation bar that works on mobile and desktop. Include hamburger menu for mobile viewport.',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek.toISOString().split('T')[0],
        projectId: project1.id,
        assignedTo: member.id,
        createdBy: admin.id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment to staging environment.',
        status: 'done',
        priority: 'high',
        dueDate: yesterday.toISOString().split('T')[0],
        projectId: project1.id,
        assignedTo: admin.id,
        createdBy: admin.id,
      },
      {
        title: 'User authentication flow',
        description: 'Implement login, signup, and password reset screens with form validation and error handling.',
        status: 'in_progress',
        priority: 'high',
        dueDate: lastWeek.toISOString().split('T')[0],
        projectId: project2.id,
        assignedTo: member.id,
        createdBy: admin.id,
      },
      {
        title: 'Dashboard wireframes',
        description: 'Create wireframes for the main dashboard view including charts, recent activity, and quick actions.',
        status: 'todo',
        priority: 'low',
        dueDate: nextWeek.toISOString().split('T')[0],
        projectId: project2.id,
        assignedTo: admin.id,
        createdBy: admin.id,
      },
    ]);

    console.log('✅ Tasks created');
    console.log('\n🎉 Seeding complete!\n');
    console.log('📧 Login credentials:');
    console.log('   Admin: alex@example.com / password123');
    console.log('   Member: sam@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
