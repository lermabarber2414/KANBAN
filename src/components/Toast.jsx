/**
 * Toast — ephemeral notification that auto-dismisses after 3.5 seconds.
 */
import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const isError = type === 'error'

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5
        px-4 py-3 rounded-2xl shadow-modal text-sm font-medium max-w-sm w-[calc(100%-2rem)]
        border animate-in slide-in-from-bottom-4 duration-300
        ${isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-white border-surface-200 text-gray-800'
        }`}
    >
      {isError
        ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        : <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      }
      <span className="flex-1 line-clamp-2">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 p-0.5 rounded text-gray-400 hover:text-gray-600 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
