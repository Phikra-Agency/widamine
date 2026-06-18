import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AuthWrapper, RefreshWrapper, UnauthWrapper, RoleWrapper } from '@/components/wrappers'
import { BackOfficeLayout } from '@/components/layouts'
import { Login } from '@/pages/auth'

const Dashboard = lazy(() => import('@/pages/back-office/Dashboard'))
const Users = lazy(() => import('@/pages/back-office/Users'))
const Patients = lazy(() => import('@/pages/back-office/Patients'))
const Calendar = lazy(() => import('@/pages/back-office/Calendar'))
const Contacts = lazy(() => import('@/pages/back-office/Contacts'))
const Categories = lazy(() => import('@/pages/back-office/Categories'))
const Services = lazy(() => import('@/pages/back-office/Services'))
const SallesMotifs = lazy(() => import('@/pages/back-office/SallesMotifs'))
const Settings = lazy(() => import('@/pages/back-office/Settings'))

function RoleBasedRedirect() {
  const { user } = useAuthStore()
  const role = user?.role
  if (role === 'ADMIN' || role === 'RECEPTIONIST') {
    return <Navigate to='/back-office/dashboard' />
  }
  return <Navigate to='/back-office/calendar' />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RefreshWrapper />}>
          <Route element={<AuthWrapper />}>
            <Route path='back-office' element={<BackOfficeLayout />}>
              <Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST']} />}>
                <Route path='users' element={<Suspense fallback={null}><Users /></Suspense>} />
                <Route path='categories' element={<Suspense fallback={null}><Categories /></Suspense>} />
                <Route path='services' element={<Suspense fallback={null}><Services /></Suspense>} />
                <Route path='motifs' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
                <Route path='resources' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
                <Route path='settings' element={<Suspense fallback={null}><Settings /></Suspense>} />
                <Route path='contacts' element={<Suspense fallback={null}><Contacts /></Suspense>} />
              </Route>

              <Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
                <Route path='patients' element={<Suspense fallback={null}><Patients /></Suspense>} />
                <Route path='calendar' element={<Suspense fallback={null}><Calendar /></Suspense>} />
                <Route path='dashboard' element={<Suspense fallback={null}><Dashboard /></Suspense>} />
              </Route>

              <Route index element={<RoleBasedRedirect />} />
            </Route>
          </Route>

          <Route element={<UnauthWrapper />}>
            <Route path='login' element={<Login />} />
          </Route>
        </Route>

        <Route path='/' element={<Navigate to='/back-office' replace />} />
        <Route path='*' element={<Navigate to='/back-office' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
