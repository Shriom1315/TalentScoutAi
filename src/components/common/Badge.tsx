import React from 'react'
import { EmailStatus } from '../../types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'slate' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    slate: 'bg-slate-800 text-slate-100 border border-slate-700',
    outline: 'bg-white text-slate-600 border border-slate-200 shadow-2xs',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export const EmailStatusBadge: React.FC<{ status: EmailStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'Verified':
      return (
        <Badge variant="success" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Verified
        </Badge>
      )
    case 'High confidence':
      return (
        <Badge variant="primary" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          High confidence
        </Badge>
      )
    case 'Company contact':
      return (
        <Badge variant="warning" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Company contact
        </Badge>
      )
    case 'LinkedIn only':
      return (
        <Badge variant="default" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          LinkedIn only
        </Badge>
      )
    case 'Needs verification':
      return (
        <Badge variant="danger" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Needs verification
        </Badge>
      )
    default:
      return <Badge size={size}>{status}</Badge>
  }
}

export const MatchScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md' }> = ({
  score,
  size = 'md',
}) => {
  if (score >= 90) {
    return (
      <Badge variant="success" size={size} className="font-semibold tracking-tight">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        {score}% Match
      </Badge>
    )
  }
  if (score >= 80) {
    return (
      <Badge variant="primary" size={size} className="font-semibold tracking-tight">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        {score}% Match
      </Badge>
    )
  }
  return (
    <Badge variant="warning" size={size} className="font-semibold tracking-tight">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
      {score}% Match
    </Badge>
  )
}

export const VerificationTrustBadge: React.FC<{
  trustScore?: number
  badgeLabel?: string
  size?: 'sm' | 'md'
  onClick?: () => void
}> = ({ trustScore = 90, badgeLabel, size = 'sm', onClick }) => {
  const isHigh = trustScore >= 85
  const isMedium = trustScore >= 70

  const variant = isHigh ? 'success' : isMedium ? 'primary' : 'warning'
  const dotColor = isHigh ? 'bg-emerald-500' : isMedium ? 'bg-blue-500' : 'bg-amber-500'
  const label = badgeLabel || (isHigh ? 'TPO Verified' : 'Corporate Verified')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${
        variant === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/90 hover:bg-emerald-100'
          : variant === 'primary'
          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 hover:bg-blue-100'
          : 'bg-amber-50 text-amber-800 border border-amber-200/90 hover:bg-amber-100'
      } ${onClick ? 'cursor-pointer' : ''}`}
      title="Verified across Domain WHOIS, SSL/TLS, DNS MX, and LinkedIn"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isHigh ? 'animate-pulse' : ''}`}></span>
      <span>{label}</span>
      <span className="text-[10px] opacity-75">({trustScore}%)</span>
    </button>
  )
}

