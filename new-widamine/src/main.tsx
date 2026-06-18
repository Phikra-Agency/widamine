import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import { setupApiErrorHandling } from '@/lib/api'
import { Toaster } from 'react-hot-toast'

dayjs.locale('fr')
setupApiErrorHandling()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Toaster position='top-right' reverseOrder={false} />
    <App />
  </ErrorBoundary>,
)
