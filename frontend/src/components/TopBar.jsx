import React from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const TopBar = ({ title, actions }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-8 py-4 h-16">
        <h1 className="text-xl font-semibold text-surface-900">{title}</h1>
        
        <div className="flex items-center space-x-6">
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
          
          <div className="h-6 w-px bg-surface-200 hidden sm:block"></div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-surface-900 leading-none">{user?.name}</p>
              <p className="text-xs text-surface-500 mt-1 capitalize">{user?.role}</p>
            </div>
            <Avatar name={user?.name} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
