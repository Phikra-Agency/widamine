import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ErrorState'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <ErrorState
      variant='notFound'
      title='Page introuvable'
      description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil."
      action={
        <Button type='button' onClick={() => navigate('/calendar', { replace: true })}>
          Retour à l'accueil
        </Button>
      }
    />
  )
}
