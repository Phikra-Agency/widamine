import { useState, useRef, useEffect } from 'react'
import { ChatDots, PaperPlaneRight, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, TYPE } from '@/lib/theme'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { useContactPopupStore } from '@/stores/contactPopupStore'
import { API_BASE_URL } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  'Nos soins visage',
  'Prendre rendez-vous',
  'Où vous situez-vous ?',
  'Équipe du centre',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const openScheduleModal = useScheduleModalStore((s) => s.open)
  const openContactPopup = useContactPopupStore((s) => s.open)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const scheduleSubmitted = useScheduleModalStore((s) => s.submitted)
  const contactSubmitted = useContactPopupStore((s) => s.submitted)

  useEffect(() => {
    const type = scheduleSubmitted || contactSubmitted
    if (!type) return

    const msg =
      type === 'booking'
        ? 'Le client vient de soumettre une demande de réservation sur le site. Réponds de façon naturelle et chaleureuse pour confirmer la réception en une phrase.'
        : 'Le client vient de soumettre un message de contact sur le site. Réponds de façon naturelle et chaleureuse pour confirmer la réception en une phrase.'

    setOpen(true)
    const fetchReply = async () => {
      setLoading(true)
      try {
        const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))
        const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history }),
        })
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
        useScheduleModalStore.getState().clearSubmitted()
        useContactPopupStore.getState().setSubmitted(null)
      }
    }
    fetchReply()
  }, [scheduleSubmitted, contactSubmitted])

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      if (data.trigger === 'booking') {
        openScheduleModal()
      } else if (data.trigger === 'contact') {
        openContactPopup()
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Je n\'ai pas pu me connecter. Vous pouvez nous joindre au **+212 (535) 624 696**.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className='fixed bottom-6 right-6 z-50 flex cursor-pointer items-center justify-center rounded-full text-white'
        style={{
          background: C.secondary,
          width: 52,
          height: 52,
          boxShadow: '0 8px 24px -6px rgba(26,54,70,0.3)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {open ? <X size={18} weight='bold' /> : <ChatDots size={20} weight='fill' />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className='fixed bottom-20 right-6 z-40 flex w-[340px] flex-col overflow-hidden sm:w-[380px]'
            style={{
              maxHeight: 'calc(100vh - 120px)',
              height: 520,
              borderRadius: 16,
              background: 'white',
              boxShadow: '0 16px 48px -12px rgba(26,54,70,0.15)',
              border: '1px solid rgba(26,54,70,0.06)',
            }}
          >
            <Header />

            <div
              ref={listRef}
              className='flex-1 overflow-y-auto px-4 pb-3 pt-2'
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.orange}30 transparent` }}
            >
              <div className='space-y-3'>
                {messages.map((msg, i) =>
                  msg.role === 'assistant' ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                    >
                      <div
                        className='inline-block max-w-[88%] px-3.5 py-2.5'
                        style={{
                          background: C.bg,
                          borderRadius: '2px 12px 12px 12px',
                        }}
                      >
                        <div className='text-[13px]' style={{ color: C.secondary, lineHeight: 1.6, fontFamily: "'Poppins Light', sans-serif" }}>
                          <Markdown content={msg.content} />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                      className='flex justify-end'
                    >
                      <div
                        className='inline-block max-w-[80%] px-3.5 py-2.5 text-white'
                        style={{
                          background: C.primary,
                          borderRadius: '12px 2px 12px 12px',
                        }}
                      >
                        <p className='text-[13px]' style={{ lineHeight: 1.6, fontFamily: "'Poppins Light', sans-serif" }}>
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ),
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className='inline-flex items-center gap-1 px-3.5 py-3'
                      style={{ background: C.bg, borderRadius: '2px 12px 12px 12px' }}
                    >
                      {[0, 140, 280].map((d) => (
                        <span
                          key={d}
                          className='rounded-full'
                          style={{
                            width: 5,
                            height: 5,
                            background: `${C.secondary}30`,
                            animation: `dotPulse 1.2s ease-in-out ${d}ms infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {messages.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className='flex flex-wrap gap-1.5 pt-3 pb-1'
                >
                  {QUICK_ACTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className='cursor-pointer rounded-full px-3 py-1.5 text-[11px] transition-all hover:-translate-y-0.5'
                      style={{
                        background: 'transparent',
                        color: C.secondary,
                        border: '1px solid rgba(26,54,70,0.1)',
                        fontWeight: 500,
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div
              className='flex shrink-0 items-end gap-2 px-4 pb-4 pt-2'
              style={{ borderTop: '1px solid rgba(26,54,70,0.05)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Votre message...'
                rows={1}
                className='min-w-0 resize-none border-none px-3 py-2 text-[13px] outline-none'
                style={{
                  background: C.bg,
                  borderRadius: 10,
                  color: C.secondary,
                  fontFamily: "'Poppins Light', sans-serif",
                  maxHeight: 72,
                  width: 0,
                  flex: '1 1 0%',
                }}
              />
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-white transition disabled:opacity-20'
                style={{ background: C.primary, borderRadius: 10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <PaperPlaneRight size={16} weight='fill' />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}

function Header() {
  return (
    <div
      className='relative shrink-0 flex items-center justify-between px-5 py-4'
      style={{ borderBottom: '1px solid rgba(26,54,70,0.06)' }}
    >
      <div className='flex items-center gap-2.5'>
        <div className='relative'>
          <img src='/logo.svg' alt='Widamine' className='h-8 w-8 object-contain' />
          <span
            className='absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-[1.5px] border-white'
            style={{ background: C.green }}
          />
        </div>
        <div>
          <p
            className='text-[13px]'
            style={{
              fontFamily: TYPE.headingFamily,
              color: C.secondary,
              letterSpacing: '-0.01em',
            }}
          >
            Widamine Center
          </p>
          <p className='text-[10px]' style={{ color: `${C.secondary}50` }}>
            En ligne
          </p>
        </div>
      </div>
    </div>
  )
}

function Markdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Checkboxes: - [ ] or - [x]
    const cbMatch = line.match(/^[-*]\s*\[([ x])\]\s*(.*)/)
    if (cbMatch) {
      const checked = cbMatch[1] === 'x'
      const text = cbMatch[2]
      elements.push(
        <div key={i} className='flex items-start gap-1.5' style={{ margin: '2px 0' }}>
          <span
            className='mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border'
            style={{
              borderColor: `${C.secondary}30`,
              background: checked ? C.primary : 'transparent',
              color: 'white',
              fontSize: 9,
            }}
          >
            {checked && '✓'}
          </span>
          <span>{renderInline(text)}</span>
        </div>,
      )
      i++
      continue
    }

    // Table: detect first | line
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      // Filter out separator line (|---|---|)
      const dataLines = tableLines.filter((l) => !l.match(/^\|[\s-|]+\|$/))
      if (dataLines.length > 0) {
        const parseRow = (row: string) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        const header = parseRow(dataLines[0])
        const rows = dataLines.slice(1).map(parseRow)
        elements.push(
          <div key={`t-${i}`} className='my-1.5 overflow-x-auto'>
            <table className='w-full text-[11px]' style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th
                      key={hi}
                      className='px-2 py-1 text-left font-semibold'
                      style={{ borderBottom: `1px solid ${C.secondary}20`, color: C.secondary }}
                    >
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className='px-2 py-1'
                        style={{ borderBottom: `1px solid ${C.secondary}10`, color: C.secondary }}
                      >
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
        continue
      }
    }

    // Bullet list: - or *
    if (line.match(/^[-*]\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className='my-1 ml-1 list-none space-y-0.5'>
          {items.map((item, ui) => (
            <li key={ui} className='flex items-start gap-1.5'>
              <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full' style={{ background: C.primary }} />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const items: string[] = []
      let num = 1
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className='my-1 ml-1 list-none space-y-0.5'>
          {items.map((item, ui) => (
            <li key={ui} className='flex items-start gap-1.5'>
              <span className='text-[11px] font-semibold' style={{ color: C.primary, minWidth: 14 }}>
                {ui + 1}.
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Horizontal rule: --- or *** or ___
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className='my-2'
          style={{ border: 'none', borderTop: `1px solid ${C.secondary}15` }}
        />,
      )
      i++
      continue
    }

    // Heading: ### or ## or #
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const sizes: Record<number, string> = { 1: '14px', 2: '13px', 3: '12px', 4: '11px' }
      elements.push(
        <div
          key={`h-${i}`}
          className='font-semibold'
          style={{
            fontSize: sizes[level] || '12px',
            color: C.secondary,
            marginTop: level <= 2 ? 6 : 4,
            marginBottom: 2,
            letterSpacing: '-0.01em',
          }}
        >
          {renderInline(headingMatch[2])}
        </div>,
      )
      i++
      continue
    }

    // Empty line = spacing
    if (line.trim() === '') {
      elements.push(<div key={i} className='h-1.5' />)
      i++
      continue
    }

    // Regular line
    elements.push(
      <div key={i} style={{ margin: '1px 0' }}>
        {renderInline(line)}
      </div>,
    )
    i++
  }

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode[] {
  // Split by bold, italic, code, links, and emoji
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|[\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu
  const parts = text.split(regex)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className='rounded px-1 py-0.5 text-[11px]'
          style={{ background: `${C.secondary}10`, color: C.primary }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} style={{ color: C.primary, textDecoration: 'underline' }}>
          {linkMatch[1]}
        </a>
      )
    }
    // Emoji: render via Twemoji CDN for consistent look
    if (/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(part) && part.length <= 4) {
      const codepoints = [...part]
        .map((c) => c.codePointAt(0)!.toString(16))
        .filter((c) => c !== 'fe0f')
        .join('-')
      return (
        <img
          key={i}
          src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15/assets/svg/${codepoints}.svg`}
          alt={part}
          className='inline-block'
          style={{ width: '1.15em', height: '1.15em', verticalAlign: '-0.17em' }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )
    }
    return <span key={i}>{part}</span>
  })
}
