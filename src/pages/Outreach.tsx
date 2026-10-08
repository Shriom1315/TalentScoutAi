import React, { useState } from 'react'
import {
  Send,
  Mail,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Outreach as OutreachModel, OutreachStatus } from '../types'
import { Badge } from '../components/common/Badge'

export const Outreach: React.FC = () => {
  const {
    outreachRecords,
    updateOutreachStatus,
    openOutreachModal,
    showToast,
  } = useApp()

  const [activeTab, setActiveTab] = useState<OutreachStatus | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const tabs: { id: OutreachStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Campaigns', count: outreachRecords.length },
    {
      id: 'draft',
      label: 'Drafts',
      count: outreachRecords.filter((o) => o.status === 'draft').length,
    },
    {
      id: 'ready',
      label: 'Ready to Send',
      count: outreachRecords.filter((o) => o.status === 'ready').length,
    },
    {
      id: 'sent',
      label: 'Sent',
      count: outreachRecords.filter((o) => o.status === 'sent').length,
    },
    {
      id: 'follow-up',
      label: 'Follow-ups',
      count: outreachRecords.filter((o) => o.status === 'follow-up').length,
    },
  ]

  const filteredRecords =
    activeTab === 'all'
      ? outreachRecords
      : outreachRecords.filter((o) => o.status === activeTab)

  const handleCopyMessage = (record: OutreachModel) => {
    const text = `Subject: ${record.subject}\n\n${record.body}`
    navigator.clipboard.writeText(text)
    setCopiedId(record.id)
    showToast('Outreach Copied', 'Subject and email pitch copied to clipboard.', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenMail = (record: OutreachModel) => {
    const mailto = `mailto:?subject=${encodeURIComponent(
      record.subject
    )}&body=${encodeURIComponent(record.body)}`
    window.open(mailto, '_blank')
    showToast('Mail Client Triggered', 'Opening your default mail client with pitch loaded.', 'info')
  }

  const getStatusBadge = (status: OutreachStatus) => {
    switch (status) {
      case 'ready':
        return <Badge variant="primary">Ready to Send</Badge>
      case 'sent':
        return <Badge variant="success">Sent</Badge>
      case 'follow-up':
        return <Badge variant="warning">Follow-up Due</Badge>
      case 'draft':
      default:
        return <Badge variant="default">Draft</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Outreach Campaign Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized, proof-of-skill pitches prepared for founders and engineering hiring leads.
          </p>
        </div>
      </div>

      {/* Safety / Compliance Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              High-Conversion Proof-of-Skill Model
            </div>
            <div className="text-[11px] text-slate-500">
              TalentScout AI never performs bulk blind emailing. All messages include working prototype links and are designed for one-to-one professional engagement.
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
          Zero Automated Spam
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No outreach records in this tab</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate an AI outreach pitch from any opportunity details page or contact intelligence card.
          </p>
        </div>
      )}

      {/* Outreach Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((record) => {
          const isCopied = copiedId === record.id

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 hover:border-slate-300 transition-all space-y-4"
            >
              {/* Card Top: Company, Contact, Job, Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {record.company}
                    </span>
                    <span>•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {record.contactName} ({record.contactRole})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role: {record.jobTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(record.status)}
                  {record.followUpDate && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{record.followUpDate}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Subject & Preview */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Subject Line
                  </span>
                  <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                    {record.subject}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Pitch Preview
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {record.body}
                  </div>
                </div>
              </div>

              {/* Strategic Rationale Points */}
              {record.keyPoints && record.keyPoints.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                  <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Personalization Strategy</span>
                  </div>
                  <ul className="space-y-0.5 text-slate-600 list-disc list-inside text-[11px]">
                    {record.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Move to:</span>
                  {(['draft', 'ready', 'sent', 'follow-up'] as OutreachStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateOutreachStatus(record.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                        record.status === st
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openOutreachModal(undefined, undefined, record)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleCopyMessage(record)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenMail(record)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Mail</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
