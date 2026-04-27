import { useAuthStore } from '@/stores/authStore'
import { WarningCircle as AlertCircle, ArrowLeft, Password as LockKeyhole, EnvelopeSimple as Mail, ShieldCheck } from '@phosphor-icons/react'
import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

interface LoginData {
  email: string
  password: string
}

export default function Login() {
  const { login } = useAuthStore()
  const [loginData, setLoginData] = useState<LoginData>({ email: 'admin@widamine.com', password: 'admin123' })
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function formLogin(e: SubmitEvent<HTMLFormElement>) {
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
          setErrors({ ...nextErrors, form: 'Connexion impossible pour le moment. Vérifiez que le backend est lancé.' })
        }
      } else {
        setErrors({ ...nextErrors, form: 'Connexion impossible pour le moment. Vérifiez que le backend est lancé.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#f7f3ee_0%,#edf2f5_100%)] text-secondary'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute left-[-9rem] top-[-8rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[#efd0c0]/55 blur-3xl' />
        <div className='absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,rgba(12,25,41,0.32)_1px,transparent_0)] [background-size:10px_10px]' />
      </div>

      <div className='relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 py-4 sm:px-6 sm:py-10'>
        <div className='grid w-full items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)]'>
          <section className='hidden overflow-hidden rounded-[2.2rem] border border-secondary/10 bg-[linear-gradient(150deg,rgba(13,34,52,0.96),rgba(20,54,79,0.94))] p-8 text-white shadow-[0_30px_90px_rgba(10,31,47,0.16)] lg:flex lg:flex-col lg:justify-between'>
            <div>
              <Link
                to='/'
                className='inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm text-white/78 transition hover:bg-white/12 hover:text-white'
              >
                <ArrowLeft size={16} />
                Retour au site
              </Link>
            </div>

            <div className='space-y-7'>
              <div className='flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/90 shadow-[0_18px_28px_rgba(0,0,0,0.14)]'>
                  <img src='/logo.png' alt='Widamine' className='h-10 w-10 object-contain' />
                </div>
                <div>
                  <p className='font-amoria text-3xl tracking-[0.12em] text-white'>WIDAMINE</p>
                  <p className='mt-1 text-[11px] uppercase tracking-[0.34em] text-white/54'>Sobriété Esthétique</p>
                </div>
              </div>

              <div className='space-y-4'>
                <p className='text-xs uppercase tracking-[0.34em] text-[#8bd8ff]'>Connexion admin</p>
                <h1 className='max-w-xl font-amoria text-6xl leading-[0.96] text-white'>
                  Un accès plus net au rythme du centre.
                </h1>
                <p className='max-w-xl text-base leading-8 text-white/68'>
                  Connectez-vous pour piloter les rendez-vous, consulter les demandes, suivre le calendrier et garder le back-office dans la même ligne premium que l’expérience publique.
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                <InfoCard title='Réservations' text='Suivi rapide des demandes reçues.' />
                <InfoCard title='Calendrier' text='Vision quotidienne et hebdomadaire.' />
                <InfoCard title='Contacts' text='Reprise claire des messages entrants.' />
              </div>
            </div>
          </section>

          <section className='overflow-hidden rounded-[1.55rem] border border-secondary/10 bg-white/78 shadow-[0_30px_90px_rgba(10,31,47,0.08)] backdrop-blur-[20px] sm:rounded-[2.2rem]'>
            <div className='border-b border-secondary/8 px-5 py-5 sm:px-8 sm:py-6'>
              <Link
                to='/'
                className='inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-[#f8f4f1] px-4 py-2 text-sm text-secondary/72 transition hover:border-primary/18 hover:text-secondary lg:hidden'
              >
                <ArrowLeft size={16} />
                Retour au site
              </Link>
              <p className='mt-4 text-[10px] uppercase tracking-[0.34em] text-primary sm:mt-0'>Back Office</p>
              <h2 className='mt-3 font-amoria text-[2rem] leading-none text-secondary sm:text-5xl'>Connexion</h2>
              <p className='mt-4 max-w-lg text-sm leading-7 text-secondary/58 sm:text-base'>
                Utilisez votre email admin pour ouvrir l’espace de gestion. L’accès test est déjà préparé pour vous.
              </p>
            </div>

            <div className='px-5 py-5 sm:px-8 sm:py-8'>
              <div className='mb-6 grid gap-3 rounded-[1.2rem] border border-primary/10 bg-[linear-gradient(180deg,#f8fbfd_0%,#f7f2ee_100%)] p-4 sm:grid-cols-[auto_1fr] sm:rounded-[1.5rem]'>
                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary'>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className='text-sm text-secondary'>Accès de test disponible</p>
                  <p className='mt-1 text-xs leading-6 text-secondary/56'>
                    Email: <span className='font-medium text-secondary'>admin@widamine.com</span> · Mot de passe:{' '}
                    <span className='font-medium text-secondary'>admin123</span>
                  </p>
                </div>
              </div>

              <form className='space-y-5' onSubmit={formLogin}>
                {errors.form ? (
                  <div className='flex items-start gap-3 rounded-[1.2rem] border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-700'>
                    <AlertCircle size={18} className='mt-0.5 shrink-0' />
                    <span>{errors.form}</span>
                  </div>
                ) : null}

                <div className='space-y-2'>
                  <label htmlFor='login-email' className='text-sm text-secondary/72'>
                    Adresse email
                  </label>
                  <div className='relative'>
                    <Mail size={17} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary/34' />
                    <input
                      id='login-email'
                      type='email'
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className='h-14 w-full rounded-full border border-secondary/10 bg-[#fcfaf8] pl-12 pr-4 text-secondary outline-none transition focus:border-primary/24 focus:bg-white'
                      placeholder='admin@widamine.com'
                      autoComplete='email'
                    />
                  </div>
                  {errors.email ? <p className='text-sm text-red-600'>{errors.email}</p> : null}
                </div>

                <div className='space-y-2'>
                  <label htmlFor='login-password' className='text-sm text-secondary/72'>
                    Mot de passe
                  </label>
                  <div className='relative'>
                    <LockKeyhole size={17} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary/34' />
                    <input
                      id='login-password'
                      type='password'
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className='h-14 w-full rounded-full border border-secondary/10 bg-[#fcfaf8] pl-12 pr-4 text-secondary outline-none transition focus:border-primary/24 focus:bg-white'
                      placeholder='••••••••'
                      autoComplete='current-password'
                    />
                  </div>
                  {errors.password ? <p className='text-sm text-red-600'>{errors.password}</p> : null}
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='inline-flex h-14 w-full items-center justify-center rounded-full bg-secondary px-6 text-sm font-medium text-white shadow-[0_18px_34px_rgba(10,31,47,0.16)] transition hover:bg-secondary/94 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {loading ? 'Connexion...' : 'Entrer dans le back office'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className='rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm'>
      <p className='text-sm text-white'>{title}</p>
      <p className='mt-2 text-sm leading-6 text-white/56'>{text}</p>
    </div>
  )
}
