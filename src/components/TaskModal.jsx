/**
 * TaskModal — slide-up modal for creating or editing a task.
 * Form state is fully local; parent receives the final data on save.
 */
import React, { useState, useEffect, useRef } from 'react'
import { X, Trash2, Loader2, Calendar, Tag, AlignLeft, Flag } from 'lucide-react'
import { COLUMNS, PRIORITY_CONFIG, todayISO } from '../utils/taskHelpers.js'

const PRIORITIES = ['alta', 'media', 'baja']

export default function TaskModal({ task, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...task })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const titleRef = useRef(null)

  useEffect(() => {
    // Auto-focus title on open
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('El título es obligatorio.')
      titleRef.current?.focus()
      return
    }
    setSaving(true)
    try {
      await onSave({ ...form, title: form.title.trim() })
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 flex md:items-center md:justify-center z-50 p-0 md:p-4">
        <div className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-modal
          overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh]">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
            <h2 className="font-semibold text-gray-900 flex-1">
              {isNew ? 'Nueva tarea' : 'Editar tarea'}
            </h2>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-500 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Título *
              </label>
              <input
                ref={titleRef}
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="¿En qué hay que trabajar?"
                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  placeholder:text-gray-300 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                <AlignLeft className="w-3 h-3" /> Descripción
              </label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Contexto, detalles, links..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  placeholder:text-gray-300 transition"
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Flag className="w-3 h-3" /> Prioridad
                </label>
                <div className="flex gap-1.5">
                  {PRIORITIES.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    const active = form.priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleChange('priority', p)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition
                          ${active
                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                            : 'bg-white border-surface-200 text-gray-400 hover:border-surface-300'
                          }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    bg-white transition"
                >
                  {COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category + Due date row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Tag className="w-3 h-3" /> Categoría
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  placeholder="ej. Backend"
                  className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    placeholder:text-gray-300 transition"
                />
              </div>

              {/* Due date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Calendar className="w-3 h-3" /> Fecha límite
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={todayISO()}
                  onChange={e => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center gap-2 px-5 py-4 border-t border-surface-100 bg-surface-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-surface-200 text-sm font-medium
                text-gray-600 hover:bg-surface-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700
                disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isNew ? 'Crear tarea' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
