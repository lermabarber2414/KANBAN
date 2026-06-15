/**
 * TaskCard — the visual card displayed in each Kanban column.
 * Shows title, priority badge, category, due date, and action buttons.
 */
import React, { useState } from 'react'
import { Calendar, Tag, MoreHorizontal, Pencil, Trash2, ExternalLink, GripVertical } from 'lucide-react'
import { PRIORITY_CONFIG, formatDate, isOverdue } from '../utils/taskHelpers.js'

export default function TaskCard({ task, onEdit, onDelete, isDragging = false }) {
  const [showMenu, setShowMenu] = useState(false)
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.media
  const overdue = isOverdue(task.dueDate)

  return (
    <div
      className={`group relative bg-white rounded-xl border p-3.5 transition-all select-none
        ${isDragging
          ? 'shadow-card-hover border-brand-200'
          : 'shadow-card hover:shadow-card-hover border-surface-200 hover:border-surface-300 cursor-grab active:cursor-grabbing'
        }`}
    >
      {/* Priority indicator bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full ${priorityCfg.dot}`} />

      {/* Header row */}
      <div className="flex items-start gap-2 pl-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
            {task.title}
          </h3>
        </div>

        {/* Menu button — only visible on hover */}
        {!isDragging && (
          <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition">
            <button
              onPointerDown={(e) => e.stopPropagation()} // prevent drag on menu click
              onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
              className="p-1 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-gray-700 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onPointerDown={(e) => { e.stopPropagation(); setShowMenu(false) }}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-surface-200
                  rounded-xl shadow-modal z-20 py-1 overflow-hidden">
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                      hover:bg-surface-50 transition text-left"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  {task.htmlUrl && (
                    <a
                      href={task.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                        hover:bg-surface-50 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver en GitHub
                    </a>
                  )}
                  <div className="my-1 border-t border-surface-100" />
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                      hover:bg-red-50 transition text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-400 pl-2 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: category + priority + due date */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-2">
        {/* Priority badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
          ${priorityCfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
          {priorityCfg.label}
        </span>

        {/* Category */}
        {task.category && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-surface-100 px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />
            {task.category}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-xs ml-auto px-2 py-0.5 rounded-full
            ${overdue
              ? 'bg-red-50 text-red-600 font-medium'
              : 'bg-surface-100 text-gray-500'
            }`}>
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Double-click to edit */}
      <div
        className="absolute inset-0 rounded-xl"
        onDoubleClick={(e) => { e.stopPropagation(); onEdit?.() }}
      />
    </div>
  )
}
