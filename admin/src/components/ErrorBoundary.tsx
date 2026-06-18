import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ErrorState'
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
        <ErrorState
          variant='crash'
          title='Une erreur inattendue est survenue'
          description="Rechargez la page. Si le problème persiste, contactez l'administrateur."
          action={
            <Button type='button' onClick={() => window.location.reload()}>
              Recharger
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
