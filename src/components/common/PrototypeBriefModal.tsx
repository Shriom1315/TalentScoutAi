import React, { useState } from 'react'
import {
  X,
  Code2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Layers,
  CheckSquare,
  FileText,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const PrototypeBriefModal: React.FC = () => {
  const { activePrototypeBrief, closePrototypeBrief, showToast } = useApp()
  const [copied, setCopied] = useState(false)

  if (!activePrototypeBrief) return null

  const opp = activePrototypeBrief.opportunity
  const proto = opp.prototypeIdea

  const briefMarkdown = `# Proof-of-Skill Specification: ${proto.title}
**Target Company:** ${opp.company} (${opp.role})
**Estimated Effort:** ${proto.estimatedEffort}
**Target Tech Stack:** ${proto.techStack.join(', ')}

## 1. Problem Statement
${proto.problem}

## 2. Prototype Concept
${proto.description}

## 3. Why This Demonstrates Immediate Value
${proto.whyItMatches}

## 4. Key Functional Features
${proto.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 5. Implementation Roadmap
- [ ] Day 1: Project setup, component scaffolding, and mock state architecture
- [ ] Day 2: Polish responsive layouts, micro-interactions, and publish live deployment on Vercel
- [ ] Deliverable: 45-second Loom video demo + public GitHub repository with clear README
`

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(briefMarkdown)
    setCopied(true)
    showToast('Brief Copied', 'Full Markdown specification copied to clipboard.', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Structured Proof-of-Skill Brief
              </h3>
              <p className="text-xs text-slate-500">
                Tailored for {opp.company} • {opp.role}
              </p>
            </div>
          </div>
          <button
            onClick={closePrototypeBrief}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Banner */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white/80 px-2 py-0.5 rounded border border-indigo-200">
                Suggested Mini-Project
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">{proto.title}</h4>
              <p className="text-xs text-slate-600 mt-1">{proto.description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{proto.estimatedEffort}</span>
            </div>
          </div>

          {/* Problem & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Problem It Addresses
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{proto.problem}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Why It Impresses Recruiters
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{proto.whyItMatches}</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Recommended Tech Stack
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {proto.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              MVP Scope (Deliver in 1-2 Days)
            </h5>
            <div className="space-y-2">
              {proto.keyFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Copy markdown to create your GitHub README or project brief.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Brief Spec</span>
                </>
              )}
            </button>
            <button
              onClick={closePrototypeBrief}
              className="px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
