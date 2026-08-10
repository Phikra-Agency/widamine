import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { C } from '@/lib/theme'
import { useContactPopupStore } from '@/stores/contactPopupStore'
import api from '@/lib/api'

export default function ContactPopup() {
  const { isOpen, close, setSubmitted } = useContactPopupStore()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({ name: '', email: '', phone: '', context: '' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await api.post('contacts', data)
      setDone(true)
      setSubmitted('contact')
      setData({ name: '', email: '', phone: '', context: '' })
    } catch {
      /* silently fail */
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    close()
    setTimeout(() => setDone(false), 200)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className='fixed inset-0 z-[9999]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className='absolute inset-0 bg-black/40' onClick={handleClose} />
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              className='pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl'
              style={{ background: 'white', boxShadow: '0 16px 48px -12px rgba(26,54,70,0.15)' }}
            >
              <div className='flex items-center justify-between px-6 pt-6 pb-2'>
                <h2 className='text-lg font-semibold' style={{ color: C.secondary }}>
                  Nous contacter
                </h2>
                <button onClick={handleClose} className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full' style={{ color: `${C.secondary}40` }}>
                  <X size={14} weight='bold' />
                </button>
              </div>

              {done ? (
                <div className='px-6 pb-8 pt-4 text-center'>
                  <p className='text-sm leading-7' style={{ color: C.secondary }}>
                    Yo on a bien reçu ton message et on revient vers toi rapidement !
                  </p>
                  <button
                    onClick={handleClose}
                    className='mt-4 inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-2 text-sm font-semibold text-white'
                    style={{ background: C.primary }}
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-3 px-6 pb-8 pt-4'>
                  <input
                    type='text' placeholder='Nom complet' required
                    className='w-full rounded-full border px-4 py-2.5 text-sm outline-none'
                    style={{ borderColor: `${C.secondary}15`, color: C.secondary }}
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                  <input
                    type='email' placeholder='Email' required
                    className='w-full rounded-full border px-4 py-2.5 text-sm outline-none'
                    style={{ borderColor: `${C.secondary}15`, color: C.secondary }}
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                  />
                  <input
                    type='tel' placeholder='Téléphone' required inputMode='numeric' pattern='[0-9]*'
                    className='w-full rounded-full border px-4 py-2.5 text-sm outline-none'
                    style={{ borderColor: `${C.secondary}15`, color: C.secondary }}
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  <textarea
                    placeholder='Votre message...' required rows={3}
                    className='w-full resize-none rounded-2xl border px-4 py-2.5 text-sm outline-none'
                    style={{ borderColor: `${C.secondary}15`, color: C.secondary }}
                    value={data.context}
                    onChange={(e) => setData({ ...data, context: e.target.value })}
                  />
                  <button
                    type='submit' disabled={loading}
                    className='inline-flex w-full cursor-pointer items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50'
                    style={{ background: C.primary }}
                  >
                    {loading ? 'Envoi...' : 'Envoyer'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
