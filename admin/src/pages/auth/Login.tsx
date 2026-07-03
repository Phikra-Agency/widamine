import { useAuthStore } from '@/stores/authStore'
import { getFieldErrorForKey, parseApiError } from '@/lib/errors'
import { loginEmailSchema, loginPasswordSchema } from '@/lib/formSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WarningCircle as AlertCircle, ArrowLeft, Eye, EyeSlash, User } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
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
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const emailValidation = useFormValidation(loginEmailSchema, { email })
  const passwordValidation = useFormValidation(loginPasswordSchema, { password })

  useEffect(() => {
    if (step === 'email') {
      passwordValidation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when step changes
  }, [step])

  function resetToEmailStep() {
    setStep('email')
    setIdentifiedUser(null)
    setPassword('')
    setFormError('')
    setShowPassword(false)
    passwordValidation.reset()
  }

  async function handleIdentify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    setFormError('')
    if (!emailValidation.validateAll()) return

    const trimmedEmail = email.trim()

    try {
      setLoading(true)
      const user = await identify(trimmedEmail)
      setIdentifiedUser({ name: user.name, email: user.email })
      setEmail(user.email)
      emailValidation.reset()
      setStep('password')
    } catch (error) {
      const parsed = parseApiError(error)
      const emailError = getFieldErrorForKey(parsed, 'email')
      if (emailError) {
        emailValidation.setFieldError('email', emailError)
      } else {
        setFormError(parsed.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading || !identifiedUser) return

    setFormError('')
    if (!passwordValidation.validateAll()) return

    try {
      setLoading(true)
      await login({
        email: identifiedUser.email,
        password,
      })
      navigate('/calendar', { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      const passwordError = getFieldErrorForKey(parsed, 'password')
      if (passwordError) {
        passwordValidation.setFieldError('password', passwordError)
      } else {
        setFormError(parsed.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const emailError = emailValidation.getError('email')
  const passwordError = passwordValidation.getError('password')

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
            className='mb-8 mx-auto h-14 w-auto max-w-[min(100%,18rem)] object-contain object-center lg:hidden'
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
                <form onSubmit={handleIdentify} noValidate className='space-y-4'>
                  {formError && (
                    <div
                      role='alert'
                      className='flex items-start gap-2 rounded-control border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive'
                    >
                      <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
                      <span className='text-xs leading-relaxed'>{formError}</span>
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <Label htmlFor='login-email'>E-mail</Label>
                    <Input
                      id='login-email'
                      type='email'
                      value={email}
                      onChange={(e) => {
                        const next = e.target.value
                        setEmail(next)
                        emailValidation.onFieldChange('email', { email: next })
                      }}
                      onBlur={() => emailValidation.onFieldBlur('email', { email })}
                      className='h-10 bg-muted/35'
                      placeholder='nom@cabinet.fr'
                      autoComplete='email'
                      autoFocus
                      aria-invalid={!!emailError}
                    />
                    {emailError && <p className='text-xs text-destructive'>{emailError}</p>}
                  </div>

                  <Button type='submit' disabled={loading} size='lg' className='login-submit-btn mt-1 h-10 w-full'>
                    {loading ? 'Vérification…' : 'Continuer'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} noValidate className='space-y-4'>
                  {formError && (
                    <div
                      role='alert'
                      className='flex items-start gap-2 rounded-control border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive'
                    >
                      <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
                      <span className='text-xs leading-relaxed'>{formError}</span>
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
                        onChange={(e) => {
                          const next = e.target.value
                          setPassword(next)
                          passwordValidation.onFieldChange('password', { password: next })
                        }}
                        onBlur={() => passwordValidation.onFieldBlur('password', { password })}
                        className='h-10 bg-muted/35 pr-10'
                        placeholder='••••••••'
                        autoComplete='current-password'
                        autoFocus
                        aria-invalid={!!passwordError}
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
                    {passwordError && <p className='text-xs text-destructive'>{passwordError}</p>}
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
