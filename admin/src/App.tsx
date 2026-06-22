import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthWrapper, RefreshWrapper, UnauthWrapper, RoleWrapper } from '@/components/wrappers'
import { BackOfficeLayout } from '@/components/layouts'
import { Login } from '@/pages/auth'
import { NotFound } from '@/pages/error'

const Users = lazy(() => import('@/pages/back-office/Users'))
const Patients = lazy(() => import('@/pages/back-office/Patients'))
const Calendar = lazy(() => import('@/pages/back-office/Calendar'))
const Contacts = lazy(() => import('@/pages/back-office/Contacts'))
const Resources = lazy(() => import('@/pages/back-office/Resources'))
const Motifs = lazy(() => import('@/pages/back-office/Motifs'))
const Settings = lazy(() => import('@/pages/back-office/Settings'))
const Reservations = lazy(() => import('@/pages/back-office/Reservations'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RefreshWrapper />}>
          <Route element={<UnauthWrapper />}>
            <Route path='login' element={<Login />} />
          </Route>

          <Route element={<AuthWrapper />}>
            <Route element={<BackOfficeLayout />}>
              <Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST']} />}>
                <Route path='users' element={<Suspense fallback={null}><Users /></Suspense>} />
                <Route path='motifs' element={<Suspense fallback={null}><Motifs /></Suspense>} />
                <Route path='resources' element={<Suspense fallback={null}><Resources /></Suspense>} />
                <Route path='settings' element={<Suspense fallback={null}><Settings /></Suspense>} />
                <Route path='contacts' element={<Suspense fallback={null}><Contacts /></Suspense>} />
                <Route path='reservations' element={<Suspense fallback={null}><Reservations /></Suspense>} />
              </Route>

              <Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
                <Route path='patients' element={<Suspense fallback={null}><Patients /></Suspense>} />
                <Route path='calendar' element={<Suspense fallback={null}><Calendar /></Suspense>} />
                <Route path='dashboard' element={<Navigate to='/calendar' replace />} />
              </Route>

              <Route index element={<Navigate to='/calendar' replace />} />
              <Route path='*' element={<NotFound />} />
            </Route>
          </Route>
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
