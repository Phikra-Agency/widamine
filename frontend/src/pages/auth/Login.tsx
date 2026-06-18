import { useAuthStore } from '@/stores/authStore'
import { WarningCircle as AlertCircle, Password as LockKeyhole, CalendarBlank, HeartStraight, ShieldCheck, Sparkle } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

interface LoginData {
  email: string
  password: string
}

function LeafAccent({
  className,
  tone,
  float,
  entrance,
  size = 360,
}: {
  className: string
  tone: string
  float: { y: number[]; rotate: number[]; duration: number }
  entrance: { x: number; delay: number; duration: number; rotate: number }
  size?: number
}) {
  return (
    <motion.div
      className={className}
      aria-hidden='true'
      initial={{ opacity: 0, x: entrance.x, scale: 0.94, rotate: entrance.rotate }}
      animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 0.3, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div animate={{ y: float.y, rotate: float.rotate }} transition={{ duration: float.duration, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width={size} height={size} viewBox='0 0 260 260' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M52 194c36-52 70-85 114-110 40-24 66-46 88-74-6 56-20 98-46 132-28 38-68 68-118 86-14 5-27 7-38 8Z'
            stroke={tone}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M74 176c18-18 34-30 52-40 16-10 32-20 48-38-8 24-18 40-32 56-14 16-34 30-60 42'
            stroke={tone}
            strokeWidth='1.6'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='0.7'
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default function Login() {
  const { login } = useAuthStore()
  const [loginData, setLoginData] = useState<LoginData>({ email: 'admin@widamine.com', password: 'admin123' })
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function formLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    const nextErrors = { email: '', password: '', form: '' }

    if (!loginData.email.trim()) {
      nextErrors.email = "L'email est requis."
    }

    if (!loginData.password.trim()) {
      nextErrors.password = 'Le mot de passe est requis.'
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors)
      return
    }

    try {
      setLoading(true)
      setErrors(nextErrors)
      await login({
        email: loginData.email.trim(),
        password: loginData.password,
      })
      navigate('/back-office/dashboard', { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data
        if (apiError?.email === 'email_not_found') {
          setErrors({ ...nextErrors, email: 'Aucun compte ne correspond à cet email.' })
        } else if (apiError?.password === 'wrong_password') {
          setErrors({ ...nextErrors, password: 'Mot de passe incorrect.' })
        } else {
          setErrors({ ...nextErrors, form: 'Connexion impossible. Vérifiez que le backend est lancé.' })
        }
      } else {
        setErrors({ ...nextErrors, form: 'Connexion impossible. Vérifiez que le backend est lancé.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full bg-custom-white grid lg:grid-cols-2'>
      {/* Left Panel - Form */}
      <div className='flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24 xl:px-32'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className='mb-10'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex h-11 w-11 items-center justify-center rounded-full border border-secondary/10 bg-custom-white/80 shadow-sm'>
                <img src='/logo.svg' alt='Widamine' className='h-6 w-6 object-contain' />
              </div>
              <div>
                <p className='font-amoria text-sm tracking-[0.18em] text-secondary'>WIDAMINE</p>
                <p className='text-[9px] uppercase tracking-[0.28em] text-secondary/50'>Back Office</p>
              </div>
            </div>
            <p className='font-amoria text-3xl tracking-tight text-secondary'>Bon retour !</p>
            <p className='mt-2 text-sm text-secondary/50 max-w-sm'>
              Simplifiez votre flux de travail et gérez votre centre médical avec Widamine.
            </p>
          </div>

          <form onSubmit={formLogin} className='space-y-5 max-w-md'>
            {errors.form && (
              <div className='flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm'>
                <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
                <span className='text-xs'>{errors.form}</span>
              </div>
            )}

            <div>
              <input
                id='login-email'
                type='email'
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className='h-12 w-full rounded-full border border-secondary/12 bg-custom-white/70 px-5 text-sm text-secondary outline-none backdrop-blur-md transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/[0.05]'
                placeholder='Adresse email'
                autoComplete='email'
              />
              {errors.email && <p className='text-xs text-red-600 ml-4 mt-1.5'>{errors.email}</p>}
            </div>

            <div>
              <div className='relative'>
                <input
                  id='login-password'
                  type='password'
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className='h-12 w-full rounded-full border border-secondary/12 bg-custom-white/70 px-5 pr-12 text-sm text-secondary outline-none backdrop-blur-md transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/[0.05]'
                  placeholder='Mot de passe'
                  autoComplete='current-password'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-secondary/30'>
                  <LockKeyhole size={18} />
                </div>
              </div>
              {errors.password && <p className='text-xs text-red-600 ml-4 mt-1.5'>{errors.password}</p>}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='h-12 w-full rounded-full bg-primary px-6 text-sm font-medium text-custom-white shadow-[0_14px_30px_rgba(46,144,192,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Landing page vibe */}
      <div className='hidden lg:flex relative flex-col items-center justify-center overflow-hidden bg-custom-white'>
        {/* Background layers matching the landing hero */}
        <div className='absolute inset-0 bg-radial-[circle_at_30%_25%] from-accent/25 via-custom-white to-custom-white' />
        <div className='absolute inset-0 bg-radial-[circle_at_75%_70%] from-primary/12 via-transparent to-transparent' />
        <div className='absolute -top-48 -left-48 h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-2xl' />
        <div className='absolute -bottom-56 -right-56 h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-2xl' />
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(26,54,70,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,70,0.08)_1px,transparent_1px)] opacity-[0.18] [background-size:64px_64px]' />
        <div className='pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.9),transparent_55%)]' />
        <div className='pointer-events-none absolute inset-0 opacity-[0.30] bg-[radial-gradient(circle_at_85%_30%,rgba(46,144,192,0.22),transparent_55%)]' />
        <div className='pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_18%_75%,rgba(232,197,184,0.22),transparent_52%)]' />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(255,255,255,0.92)_92%)]' />

        {/* Decorative circles */}
        <div className='pointer-events-none absolute -top-24 right-10 h-56 w-56 rounded-full border border-secondary/10 bg-custom-white/40 backdrop-blur-[2px]' />
        <div className='pointer-events-none absolute bottom-16 left-10 h-40 w-40 rounded-full border border-secondary/10 bg-custom-white/35 backdrop-blur-[2px]' />

        {/* Subtle grid overlay */}
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(26,54,70,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,70,0.06)_1px,transparent_1px)] opacity-[0.12] [background-size:48px_48px]' />

        {/* Leaf accents — small, fully inside panel, subtle background texture */}
        <LeafAccent
          className='pointer-events-none absolute left-24 top-36 opacity-[0.16] mix-blend-multiply blur-[0.2px] z-0'
          tone='rgba(26,54,70,0.24)'
          float={{ y: [0, -6, 0], rotate: [-0.5, 0.4, -0.5], duration: 14 }}
          entrance={{ x: -20, delay: 0.3, duration: 0.8, rotate: -4 }}
          size={80}
        />
        <LeafAccent
          className='pointer-events-none absolute right-24 bottom-32 opacity-[0.14] mix-blend-multiply blur-[0.2px] z-0'
          tone='rgba(46,144,192,0.20)'
          float={{ y: [0, -5, 0], rotate: [0.4, -0.3, 0.4], duration: 16 }}
          entrance={{ x: 20, delay: 0.6, duration: 0.8, rotate: 4 }}
          size={70}
        />

        {/* Floating particles */}
        <motion.div
          className='pointer-events-none absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-accent/30'
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='pointer-events-none absolute top-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/25'
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className='pointer-events-none absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-secondary/15'
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Central composition */}
        <motion.div
          className='relative z-10 flex flex-col items-center'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Orbiting ring */}
          <motion.div
            className='absolute w-64 h-64 rounded-full border border-secondary/6'
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className='absolute w-52 h-52 rounded-full border border-primary/8 border-dashed'
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />

          {/* Main circle with heart */}
          <motion.div
            className='w-44 h-44 rounded-full bg-gradient-to-br from-accent/20 via-primary/10 to-custom-white border border-secondary/8 flex items-center justify-center shadow-[0_26px_60px_rgba(26,54,70,0.08)]'
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HeartStraight size={52} weight='thin' className='text-primary/40' />
          </motion.div>

          {/* Floating stat card */}
          <motion.div
            className='absolute -right-8 top-2 overflow-hidden rounded-[1.4rem] border border-secondary/10 bg-custom-white/84 shadow-[0_26px_60px_rgba(26,54,70,0.14)] backdrop-blur-[22px] p-4 w-40'
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{ opacity: { duration: 0.2, delay: 0 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                <CalendarBlank size={16} className='text-primary' />
              </div>
              <div>
                <p className='text-[11px] font-semibold text-secondary'>Consultations</p>
                <p className='text-[10px] text-secondary/44'>8 aujourd'hui</p>
              </div>
            </div>
            <div className='mt-2 flex items-center gap-2'>
              <div className='h-1.5 flex-1 bg-secondary/8 rounded-full overflow-hidden'>
                <div className='h-full w-[65%] bg-primary/60 rounded-full' />
              </div>
              <span className='text-[10px] font-medium text-primary'>65%</span>
            </div>
          </motion.div>

          {/* Floating trust card */}
          <motion.div
            className='absolute -left-12 bottom-0 overflow-hidden rounded-[1.4rem] border border-secondary/10 bg-custom-white/84 shadow-[0_26px_60px_rgba(26,54,70,0.14)] backdrop-blur-[22px] p-3.5 w-36'
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
            transition={{ opacity: { duration: 0.2, delay: 0.04 }, y: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center'>
                <ShieldCheck size={16} className='text-secondary/70' />
              </div>
              <div>
                <p className='text-[11px] font-semibold text-secondary'>Fiabilité</p>
                <p className='text-[10px] text-secondary/44'>Données sécurisées</p>
              </div>
            </div>
          </motion.div>

          {/* Floating sparkle badge */}
          <motion.div
            className='absolute right-6 -bottom-8 w-10 h-10 rounded-full border border-secondary/8 bg-custom-white/80 shadow-[0_14px_30px_rgba(26,54,70,0.10)] backdrop-blur-[12px] flex items-center justify-center'
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            transition={{ opacity: { duration: 0.2, delay: 0.08 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <Sparkle size={18} className='text-accent/70' />
          </motion.div>

          {/* Additional patient count badge */}
          <motion.div
            className='absolute -right-16 bottom-16 overflow-hidden rounded-[1.2rem] border border-secondary/8 bg-custom-white/70 shadow-[0_14px_30px_rgba(26,54,70,0.10)] backdrop-blur-[16px] p-3 w-28'
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
            transition={{ opacity: { duration: 0.2, delay: 0.12 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
          >
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center'>
                <HeartStraight size={14} className='text-primary' weight='fill' />
              </div>
              <div>
                <p className='text-[15px] font-semibold text-secondary leading-none'>124</p>
                <p className='text-[9px] text-secondary/40 mt-0.5'>Patients</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          className='absolute bottom-10 text-center px-8 z-10'
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className='text-sm font-medium text-secondary/70'>Gérez votre centre avec sérénité</p>
          <p className='text-[10px] uppercase tracking-[0.28em] text-secondary/30 mt-1'>Widamine — Sobriété Esthétique</p>
        </motion.div>
      </div>
    </div>
  )
}
