import { useAuthStore } from '@/stores/authStore'
import { parseApiError } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WarningCircle as AlertCircle, Eye, EyeSlash } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginData {
  email: string
  password: string
}

export default function Login() {
  const { login } = useAuthStore()
  const [loginData, setLoginData] = useState<LoginData>({ email: 'admin@widamine.com', password: 'admin123' })
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.email === 'email_not_found') {
        setErrors({ ...nextErrors, email: 'Aucun compte ne correspond à cet email.' })
      } else if (parsed.fieldErrors.password === 'wrong_password') {
        setErrors({ ...nextErrors, password: 'Mot de passe incorrect.' })
      } else if (parsed.status === 404 && parsed.fieldErrors.email) {
        setErrors({ ...nextErrors, email: 'Aucun compte ne correspond à cet email.' })
      } else {
        setErrors({ ...nextErrors, form: parsed.message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='grid min-h-screen w-full bg-custom-white lg:grid-cols-2'>
      <div className='flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24 xl:px-32'>
        <div className='mb-10'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-full border border-secondary/10 bg-custom-white/80 shadow-sm'>
              <img src='/logo.png' alt='Widamine' className='h-6 w-6 object-contain' />
            </div>
            <p className='text-sm font-medium tracking-tight text-secondary'>Widamine</p>
          </div>
          <p className='text-2xl font-medium tracking-tight text-secondary'>Connexion</p>
        </div>

        <form onSubmit={formLogin} className='max-w-md space-y-5'>
          {errors.form && (
            <div className='flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700'>
              <AlertCircle size={16} className='mt-0.5 shrink-0' weight='fill' />
              <span className='text-xs'>{errors.form}</span>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='login-email' className='sr-only'>
              Email
            </Label>
            <Input
              id='login-email'
              type='email'
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className='h-12 rounded-full px-5'
              placeholder='Adresse email'
              autoComplete='email'
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className='ml-4 text-xs text-red-600'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='login-password' className='sr-only'>
              Mot de passe
            </Label>
            <div className='relative'>
              <Input
                id='login-password'
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className='h-12 rounded-full px-5 pr-12'
                placeholder='Mot de passe'
                autoComplete='current-password'
                aria-invalid={!!errors.password}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-secondary/45 hover:text-secondary'
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            {errors.password && <p className='ml-4 text-xs text-red-600'>{errors.password}</p>}
          </div>

          <Button
            type='submit'
            disabled={loading}
            size='lg'
            className='h-12 w-full rounded-full'
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>

      <div className='relative hidden items-center justify-center overflow-hidden bg-custom-white lg:flex'>
        <div className='absolute inset-0 bg-radial-[circle_at_30%_25%] from-accent/20 via-custom-white to-custom-white' />
        <div className='absolute inset-0 bg-radial-[circle_at_75%_70%] from-primary/10 via-transparent to-transparent' />
        <img src='/logo.png' alt='' className='relative z-10 h-16 w-16 opacity-80' />
      </div>
    </div>
  )
}
