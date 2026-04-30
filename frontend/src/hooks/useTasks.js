import { useState, useEffect, useCallback } from 'react';
import { getProjectTasks, getMyTasks } from '../api/tasks';

export const useTasks = (projectId = null, myTasksOnly = false) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (myTasksOnly) {
        res = await getMyTasks();
      } else if (projectId) {
        res = await getProjectTasks(projectId);
      } else {
        setTasks([]);
        setLoading(false);
        return;
      }
      setTasks(res.data.data.tasks);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, myTasksOnly]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, setTasks, loading, error, refetchTasks: fetchTasks };
};
