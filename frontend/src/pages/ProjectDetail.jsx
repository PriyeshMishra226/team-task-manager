import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { updateTask, createTask, deleteTask } from '../api/tasks';
import TopBar from '../components/TopBar';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, Settings, Loader2, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const { project, loading: projectLoading, refetchProject } = useProjects(id);
  const { tasks: initialTasks, setTasks, loading: tasksLoading, refetchTasks } = useTasks(id);
  
  const [activeTask, setActiveTask] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: ''
  });

  const isAdmin = project?.myRole === 'admin';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragStart = (event) => {
    const { active } = event;
    const task = initialTasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeColumn = active.data.current?.status;
    
    // Check if dropping on a column container
    const isOverColumn = columns.find(col => col.id === overId);
    let targetStatus = activeColumn;

    if (isOverColumn) {
      targetStatus = overId;
    } else {
      // Dropping on another task
      const overTask = initialTasks.find(t => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (activeColumn !== targetStatus) {
      // Optimistic update
      const updatedTasks = initialTasks.map(t => 
        t.id === activeId ? { ...t, status: targetStatus } : t
      );
      setTasks(updatedTasks);

      try {
        await updateTask(activeId, { status: targetStatus });
      } catch (error) {
        toast.error('Failed to update task status');
        refetchTasks(); // Revert on failure
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskFormData };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      
      await createTask(id, payload);
      toast.success('Task created');
      setIsNewTaskModalOpen(false);
      setTaskFormData({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
      refetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskFormData };
      if (!payload.assignedTo) payload.assignedTo = null;
      if (!payload.dueDate) payload.dueDate = null;
      
      await updateTask(selectedTask.id, payload);
      toast.success('Task updated');
      setIsTaskDetailModalOpen(false);
      refetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(selectedTask.id);
      toast.success('Task deleted');
      setIsTaskDetailModalOpen(false);
      refetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate || ''
    });
    setIsTaskDetailModalOpen(true);
  };

  if (projectLoading) {
    return <div className="flex-1 flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  if (!project) {
    return <div className="flex-1 p-8">Project not found.</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-50 h-screen overflow-hidden">
      <TopBar 
        title={
          <div className="flex items-center space-x-3">
            <span>{project.name}</span>
            {isAdmin && <Badge variant="brand">Admin</Badge>}
          </div>
        }
        actions={
          <>
            {isAdmin && (
              <Link to={`/projects/${id}/settings`} className="text-surface-500 hover:text-surface-900 p-2 rounded-lg hover:bg-surface-100 transition-colors">
                <Settings size={20} />
              </Link>
            )}
            <div className="flex -space-x-2 mr-4">
              {project.projectMembers.slice(0, 5).map(m => (
                <div key={m.id} className="relative z-10 hover:z-20 transition-transform hover:scale-110">
                  <Avatar name={m.user.name} size="sm" />
                </div>
              ))}
              {project.projectMembers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-surface-200 border-2 border-white flex items-center justify-center text-xs font-medium text-surface-600 z-10">
                  +{project.projectMembers.length - 5}
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </button>
            )}
          </>
        }
      />

      <div className="px-8 py-4 bg-white border-b border-surface-200">
        <p className="text-surface-600">{project.description}</p>
      </div>

      <main className="flex-1 overflow-x-auto p-8">
        {tasksLoading ? (
          <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 h-full min-w-max pb-4">
              {columns.map(col => (
                <div key={col.id} className="w-80 flex-shrink-0">
                  <KanbanColumn 
                    id={col.id} 
                    title={col.title} 
                    tasks={initialTasks.filter(t => t.status === col.id)} 
                    onTaskClick={openTaskDetail}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* New Task Modal */}
      <Modal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
              <select
                value={taskFormData.status}
                onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Assign To</label>
              <select
                value={taskFormData.assignedTo}
                onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {project?.projectMembers.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 text-surface-600 font-medium hover:text-surface-900">Cancel</button>
            <button type="submit" disabled={submitting} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg flex items-center disabled:opacity-70">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Detail / Edit Modal */}
      <Modal isOpen={isTaskDetailModalOpen} onClose={() => setIsTaskDetailModalOpen(false)} title="Task Details" maxWidth="max-w-2xl">
        {selectedTask && (
          <form onSubmit={handleUpdateTask} className="space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full text-xl font-bold text-surface-900 border-none focus:ring-0 p-0 mb-1 bg-transparent"
                  placeholder="Task title"
                  disabled={!isAdmin && selectedTask.assignedTo !== project?.myUserId}
                />
                <div className="text-sm text-surface-500 flex items-center space-x-4">
                  <span>Created by {selectedTask.taskCreator?.name}</span>
                  <span>•</span>
                  <span>{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    rows="6"
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="Add more details to this task..."
                    disabled={!isAdmin && selectedTask.assignedTo !== project?.myUserId}
                  />
                </div>
              </div>
              
              <div className="space-y-4 bg-surface-50 p-4 rounded-xl border border-surface-200">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    className="w-full bg-white px-3 py-2 border border-surface-300 rounded-lg text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="w-full bg-white px-3 py-2 border border-surface-300 rounded-lg text-sm"
                    disabled={!isAdmin && selectedTask.assignedTo !== project?.myUserId}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Assignee</label>
                  <select
                    value={taskFormData.assignedTo}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                    className="w-full bg-white px-3 py-2 border border-surface-300 rounded-lg text-sm"
                    disabled={!isAdmin}
                  >
                    <option value="">Unassigned</option>
                    {project?.projectMembers.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full bg-white px-3 py-2 border border-surface-300 rounded-lg text-sm"
                    disabled={!isAdmin && selectedTask.assignedTo !== project?.myUserId}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-200 flex justify-between items-center">
              {isAdmin ? (
                <button type="button" onClick={handleDeleteTask} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center text-sm font-medium">
                  <Trash2 size={16} className="mr-2" /> Delete Task
                </button>
              ) : <div></div>}
              <div className="space-x-3 flex">
                <button type="button" onClick={() => setIsTaskDetailModalOpen(false)} className="px-4 py-2 text-surface-600 font-medium hover:bg-surface-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg flex items-center disabled:opacity-70">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
