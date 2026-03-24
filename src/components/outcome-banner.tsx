'use client'

import type { SessionOutcome } from '@/lib/types'

interface OutcomeBannerProps {
  outcome: SessionOutcome
}

export function OutcomeBanner({ outcome }: OutcomeBannerProps) {
  const config = {
    win: {
      bg: 'bg-green-900/50 border-green-700',
      text: 'text-green-300',
      title: '客户决定购买！',
      subtitle: '恭喜，你成功说服了客户。',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    lose: {
      bg: 'bg-red-900/50 border-red-700',
      text: 'text-red-300',
      title: '时间到！客户未被说服',
      subtitle: '对话时间已用完，客户没有做出购买决定。',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    timeout: {
      bg: 'bg-red-900/50 border-red-700',
      text: 'text-red-300',
      title: '时间到！客户未被说服',
      subtitle: '对话时间已用完，客户没有做出购买决定。',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  }

  const c = config[outcome]

  return (
    <div className={`${c.bg} border rounded-lg p-6 flex items-center gap-4`}>
      <div className={c.text}>{c.icon}</div>
      <div>
        <h2 className={`text-xl font-bold ${c.text}`}>{c.title}</h2>
        <p className="text-zinc-400 text-sm mt-1">{c.subtitle}</p>
      </div>
    </div>
  )
}
