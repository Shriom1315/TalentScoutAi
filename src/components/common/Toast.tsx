import React from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useApp()

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  }

  const borderStyles = {
    success: 'border-emerald-200 bg-white/95',
    info: 'border-blue-200 bg-white/95',
    warning: 'border-amber-200 bg-white/95',
    error: 'border-rose-200 bg-white/95',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
          borderStyles[toast.type]
        }`}
      >
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
