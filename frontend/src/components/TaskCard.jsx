import React from 'react';
import Badge from './Badge';
import Avatar from './Avatar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlignLeft } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: task });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className={`bg-white p-4 rounded-xl shadow-sm border ${
        isDragging ? 'border-brand-500 shadow-md opacity-50 z-50' : 'border-surface-200 hover:border-brand-300'
      } cursor-grab active:cursor-grabbing transition-colors mb-3 group relative`}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge variant={task.priority} className="mb-2">
          {task.priority}
        </Badge>
        {task.assignee && (
          <div className="absolute top-4 right-4">
            <Avatar name={task.assignee.name} size="sm" />
          </div>
        )}
      </div>
      
      <h4 className="font-medium text-surface-900 leading-tight mb-2 pr-8">
        {task.title}
      </h4>
      
      <div className="flex items-center justify-between mt-4 text-surface-500">
        <div className="flex items-center space-x-3 text-xs">
          {task.description && (
            <div className="flex items-center text-surface-400">
              <AlignLeft size={14} className="mr-1" />
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
              <Calendar size={14} className="mr-1" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
