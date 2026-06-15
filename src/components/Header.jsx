import React, { useState } from 'react'
import {
  LayoutDashboard, RefreshCw, Plus, Upload, LogOut,
  Github, ChevronDown, Loader2
} from 'lucide-react'

export default function Header({
  config, taskCount, onRefresh, onNewTask, onImport, onLogout, loading
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-base hidden sm:block">KanbanFlow</span>
        </div>

        {/* Repo badge */}
        <a
          href={`https://github.com/${config.owner}/${config.repo}`}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800
            bg-surface-100 hover:bg-surface-200 px-2.5 py-1.5 rounded-lg transition font-mono"
        >
          <Github className="w-3.5 h-3.5" />
          {config.owner}/{config.repo}
        </a>

        {/* Task count */}
        <span className="text-xs text-gray-400 hidden sm:block">
          {taskCount} tarea{taskCount !== 1 ? 's' : ''}
        </span>

        {/* Actions */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar"
          className="p-2 rounded-lg text-gray-500 hover:bg-surface-100 hover:text-gray-900
            disabled:opacity-50 transition"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />
          }
        </button>

        <button
          onClick={onImport}
          title="Importar desde Word"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            text-gray-700 hover:bg-surface-100 border border-surface-200 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Importar</span>
        </button>

        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva tarea</span>
        </button>

        {/* Account menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-1 p-2 rounded-lg text-gray-500 hover:bg-surface-100 transition"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-surface-200
                rounded-xl shadow-modal z-20 py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-surface-100">
                  <p className="text-xs text-gray-400">Conectado como</p>
                  <p className="text-sm font-medium text-gray-800 truncate font-mono">{config.owner}</p>
                </div>
                <button
                  onClick={() => { setShowMenu(false); onLogout() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                    hover:bg-red-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Desconectar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
