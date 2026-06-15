/**
 * KanbanColumn — a droppable column containing SortableTaskCards.
 * Uses dnd-kit's useDroppable to accept dragged cards.
 */
import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { STATUS_CONFIG } from '../utils/taskHelpers.js'
import SortableTaskCard from './SortableTaskCard.jsx'

export default function KanbanColumn({ column, tasks, loading, onAddTask, onEditTask, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column })
  const cfg = STATUS_CONFIG[column]

  return (
    <div className="flex flex-col w-72 md:w-80 shrink-0">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 border ${cfg.headerBg} ${cfg.headerBorder}`}>
        <span className={`text-sm font-semibold ${cfg.color}`}>{column}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${cfg.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2.5 p-2 rounded-xl min-h-[200px] transition-colors
          ${isOver ? 'bg-brand-50 ring-2 ring-brand-300 ring-inset' : 'bg-surface-100'}`}
      >
        {/* Skeleton loader */}
        {loading && tasks.length === 0 && (
          <>
            {[1, 2].map(i => (
              <div key={i} className="h-24 rounded-xl bg-surface-200 animate-pulse" />
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Sin tareas</p>
          </div>
        )}

        {/* Task cards */}
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>

        {/* Add task button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 w-full px-3 py-2 mt-1 rounded-lg text-sm
            text-gray-400 hover:text-gray-600 hover:bg-surface-200 transition group"
        >
          <Plus className="w-4 h-4 group-hover:text-brand-500 transition" />
          Añadir tarea
        </button>
      </div>
    </div>
  )
}
