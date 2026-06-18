import { Button } from '@/components/ui/button'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center'>
          <p className='text-lg font-medium text-secondary'>Une erreur inattendue est survenue</p>
          <p className='max-w-sm text-sm text-muted-foreground'>
            Rechargez la page. Si le problème persiste, contactez l&apos;administrateur.
          </p>
          <Button type='button' onClick={() => window.location.reload()}>
            Recharger
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
