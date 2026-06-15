/**
 * ImportPanel — slide-in side panel for importing tasks from a .docx file.
 * Uses mammoth.js via the docxParser utility to extract structured tasks.
 * Shows a preview of tasks before confirming the import to GitHub.
 */
import React, { useState, useRef } from 'react'
import {
  X, Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, ChevronRight, Lightbulb, ArrowRight, RotateCcw
} from 'lucide-react'
import { parseDocxFile } from '../utils/docxParser.js'
import { PRIORITY_CONFIG } from '../utils/taskHelpers.js'

const STEP = { IDLE: 'idle', PARSING: 'parsing', PREVIEW: 'preview', IMPORTING: 'importing', DONE: 'done' }

export default function ImportPanel({ onImport, onClose }) {
  const [step, setStep] = useState(STEP.IDLE)
  const [parsedData, setParsedData] = useState(null) // { tasks, recommendations }
  const [importResult, setImportResult] = useState(null) // { imported, errors }
  const [parseError, setParseError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  // ─── File handling ──────────────────────────────────────────────────────────

  const processFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.docx')) {
      setParseError('Solo se aceptan archivos .docx')
      return
    }

    setStep(STEP.PARSING)
    setParseError('')

    try {
      const data = await parseDocxFile(file)
      if (data.tasks.length === 0) {
        setParseError('No se encontraron tareas en el documento. Verifica el formato JSON.')
        setStep(STEP.IDLE)
        return
      }
      setParsedData(data)
      setStep(STEP.PREVIEW)
    } catch (e) {
      setParseError(e.message)
      setStep(STEP.IDLE)
    }
  }

  const handleFileInput = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files?.[0])
  }

  // ─── Import confirmation ────────────────────────────────────────────────────

  const handleConfirmImport = async () => {
    setStep(STEP.IMPORTING)
    try {
      const result = await onImport(parsedData.tasks)
      setImportResult(result)
      setStep(STEP.DONE)
    } catch (e) {
      setParseError(e.message)
      setStep(STEP.PREVIEW)
    }
  }

  const handleReset = () => {
    setStep(STEP.IDLE)
    setParsedData(null)
    setImportResult(null)
    setParseError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-modal z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">Importar desde Word</h2>
            <p className="text-xs text-gray-400">Sube un .docx con estructura JSON</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── IDLE: drop zone ── */}
          {(step === STEP.IDLE || step === STEP.PARSING) && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
                  ${dragOver
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-surface-300 hover:border-brand-300 hover:bg-brand-50/50'
                  }`}
              >
                {step === STEP.PARSING ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Analizando documento...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Arrastra tu archivo aquí</p>
                      <p className="text-xs text-gray-400 mt-0.5">o haz clic para seleccionar</p>
                    </div>
                    <span className="text-xs bg-surface-100 text-gray-500 px-3 py-1 rounded-full font-mono">
                      .docx
                    </span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {parseError && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap">{parseError}</span>
                </div>
              )}

              {/* Format guide */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Formato esperado en el documento
                </h3>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre">{`===TASKS_START===
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "description": "Descripción",
      "priority": "alta|media|baja",
      "category": "Backend",
      "dueDate": "2025-12-31"
    }
  ],
  "recommendations": [
    "Sugerencia del asistente IA"
  ]
}
===TASKS_END===`}</pre>
                </div>
              </div>
            </>
          )}

          {/* ── PREVIEW: parsed tasks ── */}
          {step === STEP.PREVIEW && parsedData && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">
                  {parsedData.tasks.length} tarea{parsedData.tasks.length !== 1 ? 's' : ''} encontrada{parsedData.tasks.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Recommendations */}
              {parsedData.recommendations.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    <Lightbulb className="w-3.5 h-3.5" /> Recomendaciones del asistente
                  </h4>
                  <ul className="space-y-1.5">
                    {parsedData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                        <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Task preview list */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Vista previa de tareas
                </h4>
                <div className="space-y-2">
                  {parsedData.tasks.map((task, i) => {
                    const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.media
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-surface-50 border border-surface-200 rounded-xl"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${pCfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pCfg.badge}`}>
                              {pCfg.label}
                            </span>
                            {task.category && (
                              <span className="text-xs text-gray-400 bg-surface-200 px-1.5 py-0.5 rounded-full">
                                {task.category}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-gray-400 ml-auto">{task.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── IMPORTING ── */}
          {step === STEP.IMPORTING && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600">Creando issues en GitHub...</p>
              <p className="text-xs text-gray-400">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === STEP.DONE && importResult && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {importResult.imported.length} tarea{importResult.imported.length !== 1 ? 's' : ''} importada{importResult.imported.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Ya aparecen en tu tablero</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-700 mb-2">
                    {importResult.errors.length} tarea(s) no importada(s):
                  </p>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600">• {err.task.title}: {err.error}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  border border-surface-200 text-sm text-gray-600 hover:bg-surface-50 transition"
              >
                <RotateCcw className="w-4 h-4" /> Importar otro archivo
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step === STEP.PREVIEW && (
          <div className="flex gap-2 px-5 py-4 border-t border-surface-100 bg-surface-50">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium
                text-gray-600 hover:bg-surface-100 transition"
            >
              Cambiar archivo
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white
                text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              Importar al tablero
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
