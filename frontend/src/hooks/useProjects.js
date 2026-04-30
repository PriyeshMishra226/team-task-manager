import { useState, useEffect, useCallback } from 'react';
import { getProjects, getProject } from '../api/projects';

export const useProjects = (projectId = null) => {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(res.data.data.projects);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await getProject(id);
      setProject(res.data.data.project);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    } else {
      fetchProjects();
    }
  }, [projectId, fetchProjects, fetchProject]);

  return { projects, project, loading, error, refetchProjects: fetchProjects, refetchProject: () => fetchProject(projectId) };
};
