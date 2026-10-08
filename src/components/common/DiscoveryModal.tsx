import React from 'react'
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Building2,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const DISCOVERY_STEPS = [
  'Connecting to Indian IT hubs & tech pipelines (Bengaluru, Hyderabad, Pune, NCR, Mumbai)',
  'Scraping live engineering and product vacancies across Indian tech companies & startups',
  'Filtering early-career, MCA, and React/Node/Full Stack roles',
  'Extracting hiring manager & recruiter decision makers',
  'Executing RFC-5321 DNS MX mailbox verification via dnspython',
  'Calculating dynamic match scores against candidate credentials',
]

export const DiscoveryModal: React.FC = () => {
  const {
    isDiscoveryModalOpen,
    isDiscovering,
    discoveryStep,
    discoveryStepsCompleted,
    discoveryStatusText,
    closeDiscoveryModal,
    runDiscovery,
    opportunities,
    contacts,
  } = useApp()

  if (!isDiscoveryModalOpen) return null

  const isComplete = !isDiscovering && discoveryStepsCompleted.length >= DISCOVERY_STEPS.length
  const strongMatchesCount = opportunities.filter((o) => o.matchScore >= 80).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Sparkles className={`w-5 h-5 ${isDiscovering ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {isDiscovering
                  ? 'Real-Time Scraper Running'
                  : isComplete
                  ? 'Live Scraping Completed'
                  : 'Run Real-Time Live Scraper'}
              </h3>
              <p className="text-xs text-slate-500">
                {isDiscovering
                  ? (discoveryStatusText || 'Harvesting live tech postings from Indian IT hubs & verifying records')
                  : isComplete
                  ? 'Pipeline synchronized with fresh live developer postings from Indian IT hubs'
                  : 'Live scrape from Indian IT Hubs (Bengaluru, Hyderabad, Pune, Mumbai, NCR) & tech feeds'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
              <span>Execution Progress</span>
              <span>
                {Math.min(100, Math.round((discoveryStepsCompleted.length / DISCOVERY_STEPS.length) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(100, (discoveryStepsCompleted.length / DISCOVERY_STEPS.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Stepper items */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {DISCOVERY_STEPS.map((stepText, idx) => {
              const isDone = discoveryStepsCompleted.includes(stepText)
              const isCurrent = isDiscovering && discoveryStep === idx + 1

              return (
                <div
                  key={stepText}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                    isDone
                      ? 'bg-emerald-50/60 text-slate-800'
                      : isCurrent
                      ? 'bg-blue-50 text-blue-900 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{stepText}</span>
                </div>
              )
            })}
          </div>

          {/* Completed Metrics Summary */}
          {isComplete && (
            <div className="mt-6 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100/80 text-center">
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">{opportunities.length}</div>
                  <div className="text-[11px] text-slate-600">Live Opportunities</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-center">
                  <div className="flex items-center justify-center text-emerald-600 mb-1">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">{strongMatchesCount}</div>
                  <div className="text-[11px] text-slate-600">Strong Matches</div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-center">
                  <div className="flex items-center justify-center text-indigo-600 mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">{contacts.length}</div>
                  <div className="text-[11px] text-slate-600">Contacts Harvested</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  RFC-5321 DNS MX Validated & Deduplicated
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">100% Real Feeds</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Multi-source live web pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            {!isDiscovering && !isComplete && (
              <button
                type="button"
                onClick={() => runDiscovery()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Start Live Scrape Now</span>
              </button>
            )}
            {isComplete && (
              <button
                type="button"
                onClick={closeDiscoveryModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>View Discovered Roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {!isDiscovering && !isComplete && (
              <button
                type="button"
                onClick={closeDiscoveryModal}
                className="px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
