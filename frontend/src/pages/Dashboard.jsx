import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import TopBar from '../components/TopBar';
import { SkeletonCard } from '../components/Skeleton';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { createProject } from '../api/projects';
import { FolderKanban, CheckSquare, Clock, Plus, Loader2, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { projects, loading: projectsLoading, refetchProjects } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks(null, true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject(formData);
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      refetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const metrics = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-brand-600', bg: 'bg-brand-100' },
    { label: 'Tasks Assigned', value: tasks.length, icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Overdue Tasks', value: overdueTasks, icon: Clock, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Completed Tasks', value: completedTasks, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="flex-1 bg-surface-50 min-h-screen">
      <TopBar 
        title="Dashboard" 
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        }
      />

      <main className="p-8 max-w-7xl mx-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {projectsLoading || tasksLoading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-surface-900">{metric.value}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Tasks Table */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-surface-900 mb-4">My Tasks</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface-50 text-surface-600 border-b border-surface-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Task</th>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Priority</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {tasksLoading ? (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-surface-500">Loading tasks...</td></tr>
                    ) : tasks.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-surface-500">No tasks assigned to you yet.</td></tr>
                    ) : (
                      tasks.slice(0, 5).map(task => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                        return (
                          <tr key={task.id} className="hover:bg-surface-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-surface-900">{task.title}</td>
                            <td className="px-6 py-4 text-surface-500">{task.project?.name}</td>
                            <td className="px-6 py-4">
                              <Badge variant={task.priority}>{task.priority}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                            </td>
                            <td className={`px-6 py-4 flex items-center space-x-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-surface-500'}`}>
                              {task.dueDate ? (
                                <>
                                  <Calendar size={14} />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </>
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {tasks.length > 5 && (
                <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 text-center">
                  <Link to="/my-tasks" className="text-brand-600 font-medium hover:text-brand-700 text-sm">View all tasks</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <h2 className="text-lg font-bold text-surface-900 mb-4">Recent Projects</h2>
            <div className="space-y-4">
              {projectsLoading ? (
                Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : projects.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200 text-center">
                  <FolderKanban className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500 font-medium mb-4">No projects yet</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-brand-600 font-medium hover:text-brand-700 text-sm">Create your first project</button>
                </div>
              ) : (
                projects.slice(0, 4).map(project => (
                  <div key={project.id} className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200 hover:border-brand-300 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{project.name}</h3>
                      {project.myRole === 'admin' && <Badge variant="brand" className="ml-2">Admin</Badge>}
                    </div>
                    <p className="text-sm text-surface-500 mb-4 line-clamp-2 min-h-[2.5rem]">{project.description || 'No description'}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-surface-500 flex items-center space-x-3">
                        <span className="flex items-center"><Users size={14} className="mr-1" /> {project.memberCount}</span>
                        <span className="flex items-center"><CheckSquare size={14} className="mr-1" /> {project.taskCount}</span>
                      </div>
                      <Link to={`/projects/${project.id}`} className="text-brand-600 font-medium hover:text-brand-700">Open &rarr;</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="What is this project about?"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-surface-600 hover:text-surface-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-70"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
