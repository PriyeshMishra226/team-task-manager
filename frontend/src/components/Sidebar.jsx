import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
  ];

  return (
    <aside className="w-64 bg-surface-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-3 text-brand-400 hover:text-brand-300 transition-colors">
          <Briefcase className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-medium shadow-sm'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-surface-300 hover:bg-surface-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
