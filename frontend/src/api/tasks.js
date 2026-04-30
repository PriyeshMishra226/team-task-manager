import api from './axios';

export const getProjectTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const getTask = (taskId) => api.get(`/tasks/${taskId}`);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const getMyTasks = () => api.get('/tasks/my');
