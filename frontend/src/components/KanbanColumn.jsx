import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const KanbanColumn = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full bg-surface-50/50 rounded-2xl border border-surface-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200 bg-surface-100/50 flex justify-between items-center">
        <h3 className="font-semibold text-surface-700 capitalize">
          {title.replace('_', ' ')}
        </h3>
        <span className="bg-surface-200 text-surface-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-3 overflow-y-auto transition-colors ${
          isOver ? 'bg-brand-50/50' : ''
        }`}
      >
        <SortableContext 
          id={id}
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-surface-400 text-sm p-4 text-center border-2 border-dashed border-surface-200 rounded-xl">
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
