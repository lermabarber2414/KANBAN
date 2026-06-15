/**
 * SetupPage — shown when no valid config is stored.
 * Collects GitHub PAT, owner, and repo name, then validates them.
 */
import React, { useState } from 'react'
import { Github, Key, BookOpen, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { validateRepo } from '../services/githubApi.js'
import { saveConfig } from '../utils/storage.js'

export default function SetupPage({ onConfigSaved }) {
  const [form, setForm] = useState({ token: '', owner: '', repo: '' })
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState({ type: null, message: '' }) // null | 'loading' | 'error' | 'success'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))
    setStatus({ type: null, message: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.token || !form.owner || !form.repo) {
      setStatus({ type: 'error', message: 'Todos los campos son obligatorios.' })
      return
    }

    setStatus({ type: 'loading', message: 'Verificando acceso al repositorio...' })

    try {
      const repoData = await validateRepo(form)
      setStatus({ type: 'success', message: `Conectado a ${repoData.full_name}` })

      const config = { ...form, repoFullName: repoData.full_name }
      saveConfig(config)

      // Short delay so user sees the success state
      setTimeout(() => onConfigSaved(config), 800)
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  const isLoading = status.type === 'loading'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-100 flex flex-col items-center justify-center p-4">
      {/* Logo / Hero */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 17h7M17.5 14v7" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KanbanFlow</h1>
        <p className="mt-1 text-gray-500 text-sm">Gestión de tareas con GitHub Issues</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal p-8 border border-surface-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Configurar conexión</h2>
        <p className="text-sm text-gray-500 mb-6">
          Necesitas un{' '}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline font-medium"
          >
            Personal Access Token
          </a>
          {' '}con permisos de <code className="bg-surface-100 px-1 py-0.5 rounded text-xs font-mono">repo</code>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Key className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                name="token"
                value={form.token}
                onChange={handleChange}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-surface-300 text-sm font-mono
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  placeholder:text-gray-400 bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowToken(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Owner field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <User className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Usuario u organización
            </label>
            <input
              type="text"
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="tu-usuario"
              className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                placeholder:text-gray-400 bg-white transition"
            />
          </div>

          {/* Repo field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <BookOpen className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Nombre del repositorio
            </label>
            <input
              type="text"
              name="repo"
              value={form.repo}
              onChange={handleChange}
              placeholder="mi-repositorio"
              className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                placeholder:text-gray-400 bg-white transition"
            />
          </div>

          {/* Status message */}
          {status.type && status.type !== 'loading' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              status.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {status.type === 'error'
                ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              }
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700
              disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4
              rounded-lg transition-colors mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {status.message}
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                Conectar repositorio
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          El token se guarda solo en tu navegador — nunca se envía a ningún servidor externo.
        </p>
      </div>
    </div>
  )
}
