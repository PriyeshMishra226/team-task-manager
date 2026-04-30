import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { updateProject, deleteProject, addProjectMember, removeProjectMember } from '../api/projects';
import TopBar from '../components/TopBar';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { ArrowLeft, Loader2, UserPlus, Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, refetchProject } = useProjects(id);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  // Initialize form when project loads
  React.useEffect(() => {
    if (project && !formData.name) {
      setFormData({ name: project.name, description: project.description || '' });
    }
  }, [project]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  }

  if (!project) {
    return <div className="flex-1 p-8">Project not found.</div>;
  }

  // Only admins can view settings
  if (project.myRole !== 'admin') {
    return (
      <div className="flex-1 p-8 text-center mt-20">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Access Denied</h2>
        <p className="text-surface-600 mb-6">Only project admins can access settings.</p>
        <Link to={`/projects/${id}`} className="text-brand-600 font-medium hover:text-brand-700">Return to Project</Link>
      </div>
    );
  }

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProject(id, formData);
      toast.success('Project details updated');
      refetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await addProjectMember(id, { email: newMemberEmail, role: newMemberRole });
      toast.success('Member added successfully');
      setNewMemberEmail('');
      refetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === project.creator?.id) {
      return toast.error('Cannot remove the project creator');
    }
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeProjectMember(id, userId);
      toast.success('Member removed');
      refetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('WARNING: This will permanently delete the project and all its tasks. Are you sure?')) return;
    
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-50 min-h-screen overflow-y-auto">
      <TopBar 
        title={
          <div className="flex items-center space-x-3">
            <Link to={`/projects/${id}`} className="text-surface-400 hover:text-surface-900 transition-colors p-1 rounded-md hover:bg-surface-100">
              <ArrowLeft size={20} />
            </Link>
            <span>Project Settings</span>
          </div>
        }
      />

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Project Details */}
        <section className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
            <h3 className="font-bold text-surface-900">General Information</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full max-w-md px-4 py-2 border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full max-w-2xl px-4 py-2 border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isUpdating} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg flex items-center disabled:opacity-70 transition-colors">
                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Team Members */}
        <section className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
            <h3 className="font-bold text-surface-900">Team Members</h3>
            <Badge variant="default">{project.projectMembers.length} Members</Badge>
          </div>
          
          <div className="p-6 border-b border-surface-200">
            <h4 className="text-sm font-medium text-surface-700 mb-3">Add New Member</h4>
            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs text-surface-500 mb-1">User Email</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-xs text-surface-500 mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-4 py-2 border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={addingMember} className="w-full sm:w-auto bg-surface-900 hover:bg-black text-white font-medium px-5 py-2.5 rounded-xl flex items-center justify-center disabled:opacity-70 transition-colors">
                {addingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus size={18} className="mr-2" /> Add</>}
              </button>
            </form>
          </div>

          <div className="divide-y divide-surface-200">
            {project.projectMembers.map((member) => (
              <div key={member.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-surface-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar name={member.user.name} />
                  <div>
                    <p className="font-medium text-surface-900">{member.user.name}</p>
                    <p className="text-sm text-surface-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-surface-500">
                    {member.role === 'admin' ? <Shield size={16} className="mr-1 text-brand-600" /> : <User size={16} className="mr-1" />}
                    <span className="capitalize">{member.role}</span>
                  </div>
                  {member.user.id !== project.creator?.id && (
                    <button 
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="text-surface-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h3 className="font-bold text-red-800">Danger Zone</h3>
          </div>
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-surface-900">Delete Project</h4>
              <p className="text-sm text-surface-500 mt-1">Once you delete a project, there is no going back. Please be certain.</p>
            </div>
            <button 
              onClick={handleDeleteProject}
              className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-medium px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Delete Project
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ProjectSettings;
