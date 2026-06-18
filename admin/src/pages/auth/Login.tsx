import { useAuthStore } from '@/stores/authStore'
import { parseApiError } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WarningCircle as AlertCircle, ArrowLeft, Eye, EyeSlash, User } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

type LoginStep = 'email' | 'password'

interface IdentifiedAccount {
  name: string
  email: string
}

export default function Login() {
  const { identify, login } = useAuthStore()
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('admin@widamine.com')
  const [password, setPassword] = useState('')
  const [identifiedUser, setIdentifiedUser] = useState<IdentifiedAccount | null>(null)
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  function resetToEmailStep() {
    setStep('email')
    setIdentifiedUser(null)
    setPassword('')
    setErrors({ email: '', password: '', form: '' })
    setShowPassword(false)
  }

  async function handleIdentify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    const trimmedEmail = email.trim()
    const nextErrors = { email: '', password: '', form: '' }

    if (!trimmedEmail) {
      setErrors({ ...nextErrors, email: "L'email est requis." })
      return
    }

    try {
      setLoading(true)
      setErrors(nextErrors)
      const user = await identify(trimmedEmail)
      setIdentifiedUser({ name: user.name, email: user.email })
      setEmail(user.email)
      setStep('password')
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.email === 'email_not_found' || parsed.status === 404) {
        setErrors({ ...nextErrors, email: 'Aucun compte ne correspond à cet email.' })
      } else {
        setErrors({ ...nextErrors, form: parsed.message })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading || !identifiedUser) return

    const nextErrors = { email: '', password: '', form: '' }

    if (!password.trim()) {
      setErrors({ ...nextErrors, password: 'Le mot de passe est requis.' })
      return
    }

    try {
      setLoading(true)
      setErrors(nextErrors)
      await login({
        email: identifiedUser.email,
        password,
      })
      navigate('/calendar', { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.password === 'wrong_password') {
        setErrors({ ...nextErrors, password: 'Mot de passe incorrect.' })
      } else {
        setErrors({ ...nextErrors, form: parsed.message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-dvh overflow-hidden'>
      <aside className='login-decorative-grain absolute inset-y-0 left-0 z-0 hidden w-[38%] flex-col overflow-hidden bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] lg:flex'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(88,177,224,0.22),transparent_48%)]' />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_68%,rgba(61,205,245,0.12),transparent_52%)]' />
        <div className='pointer-events-none absolute top-[18%] left-[42%] h-56 w-56 -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl' />
        <div className='pointer-events-none absolute bottom-[22%] right-[8%] h-44 w-44 rounded-full bg-[#3dcdf5]/10 blur-3xl' />

        <div className='relative z-10 flex h-full flex-col p-10 xl:p-12'>
          <img
            src='/logo.svg'
            alt='Widamine'
            className='login-logo-mask h-16 w-auto max-w-[min(100%,22rem)] object-contain object-left xl:h-[4.75rem] xl:max-w-[24rem]'
          />

          <div className='mt-16 max-w-xs'>
            <h2 className='font-work-sans text-4xl font-normal leading-tight tracking-tight text-white xl:text-[2.75rem]'>
              Espace équipe
            </h2>
            <p className='mt-3 text-sm leading-relaxed text-white/55'>
              Back-office du centre — calendrier, patients, équipe.
            </p>
          </div>

          <p className='mt-auto text-xs text-white/35'>© {new Date().getFullYear()} Widamine</p>
        </div>
      </aside>

      <div className='relative z-10 flex min-h-dvh flex-col justify-center bg-background px-6 py-12 sm:px-10 lg:ml-[calc(38%-1.25rem)] lg:rounded-l-[1.25rem] lg:px-16 lg:shadow-[-16px_0_48px_rgba(13,34,52,0.14)] xl:px-24'>
        <div className='mx-auto w-full max-w-md'>
          <img
            src='/logo.svg'
            alt='Widamine'
            className='mb-8 h-14 w-auto max-w-[min(100%,18rem)] object-contain object-left lg:hidden'
          />

          <Card className='overflow-hidden rounded-[1.35rem] border-border-subtle shadow-bo-elevated'>
            <CardHeader className='gap-1.5 pb-2'>
              <CardTitle className='font-work-sans text-2xl font-normal tracking-tight'>Connexion</CardTitle>
              <CardDescription>
                {step === 'email'
                  ? 'Saisissez votre e-mail pour identifier votre compte.'
                  : 'Saisissez votre mot de passe pour continuer.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleIdentify} className='space-y-4'>
                  {errors.form && (
                    <div
                      role='alert'
                      className='flex items-start gap-2 rounded-control border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive'
                    >
                      <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
                      <span className='text-xs leading-relaxed'>{errors.form}</span>
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <Label htmlFor='login-email'>E-mail</Label>
                    <Input
                      id='login-email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='h-10 bg-muted/35'
                      placeholder='nom@cabinet.fr'
                      autoComplete='email'
                      autoFocus
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className='text-xs text-destructive'>{errors.email}</p>}
                  </div>

                  <Button type='submit' disabled={loading} size='lg' className='login-submit-btn mt-1 h-10 w-full'>
                    {loading ? 'Vérification…' : 'Continuer'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className='space-y-4'>
                  {errors.form && (
                    <div
                      role='alert'
                      className='flex items-start gap-2 rounded-control border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive'
                    >
                      <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
                      <span className='text-xs leading-relaxed'>{errors.form}</span>
                    </div>
                  )}

                  {identifiedUser && (
                    <div className='flex items-center gap-3 rounded-control border border-border-subtle bg-muted/30 px-3 py-2.5'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                        <User size={18} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium text-foreground'>{identifiedUser.name}</p>
                        <p className='truncate text-xs text-muted-foreground'>{identifiedUser.email}</p>
                      </div>
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <Label htmlFor='login-password'>Mot de passe</Label>
                    <div className='relative'>
                      <Input
                        id='login-password'
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='h-10 bg-muted/35 pr-10'
                        placeholder='••••••••'
                        autoComplete='current-password'
                        autoFocus
                        aria-invalid={!!errors.password}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        onClick={() => setShowPassword((v) => !v)}
                        className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    {errors.password && <p className='text-xs text-destructive'>{errors.password}</p>}
                  </div>

                  <Button type='submit' disabled={loading} size='lg' className='login-submit-btn mt-1 h-10 w-full'>
                    {loading ? 'Connexion…' : 'Se connecter'}
                  </Button>

                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={resetToEmailStep}
                    className='h-9 w-full gap-1.5 text-muted-foreground hover:text-foreground'
                  >
                    <ArrowLeft size={14} />
                    Utiliser un autre e-mail
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
