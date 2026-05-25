import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AuthWrapper, RefreshWrapper, UnauthWrapper, RoleWrapper } from '@/components/wrappers'
import { BackOfficeLayout, BackOfficeLayoutDark, Layout } from '@/components/layouts'
import { Login } from '@/pages/auth'
import { Home, Contact, Appointment, ServiceDetail } from '@/pages'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

gsap.registerPlugin(useGSAP)
	
const Dashboard = lazy(() => import('@/pages/back-office/Dashboard'))
const Users = lazy(() => import('@/pages/back-office/Users'))
const Patients = lazy(() => import('@/pages/back-office/Patients'))
const Appointments = lazy(() => import('@/pages/back-office/Appointments'))
const Calendar = lazy(() => import('@/pages/back-office/Calendar'))
const Contacts = lazy(() => import('@/pages/back-office/Contacts'))
const Categories = lazy(() => import('@/pages/back-office/Categories'))
const Services = lazy(() => import('@/pages/back-office/Services'))
const SallesMotifs = lazy(() => import('@/pages/back-office/SallesMotifs'))
const Settings = lazy(() => import('@/pages/back-office/Settings'))
const DashboardDark = lazy(() => import('@/pages/back-office/DashboardDark'))

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
		<MantineProvider>
			<DatesProvider settings={{ locale: 'fr' }}>
				<BrowserRouter>
					<Routes>
						<Route element={<Layout />}>
							<Route index element={<Home />} />
							<Route path='contact' element={<Contact />} />
							<Route path='appointment' element={<Appointment />} />
							<Route path='services/:slug' element={<ServiceDetail />} />
							<Route path='*' element={<>404</>} />
						</Route>

						<Route element={<RefreshWrapper />}>
							<Route element={<AuthWrapper />}>
								<Route path='admin' element={<BackOfficeLayout />}>
									<Route index element={<Dashboard />} />
									<Route path='users' element={<Suspense fallback={null}><Users /></Suspense>} />
									<Route path='patients' element={<Suspense fallback={null}><Patients /></Suspense>} />
									<Route path='categories' element={<Suspense fallback={null}><Categories /></Suspense>} />
									<Route path='services' element={<Suspense fallback={null}><Services /></Suspense>} />
									<Route path='motifs' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
									<Route path='resources' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
								</Route>

								<Route path='back-office' element={<BackOfficeLayout />}>
									<Route element={<RoleWrapper roles={['ADMIN']} />}>
										<Route path='users' element={<Suspense fallback={null}><Users /></Suspense>} />
										<Route path='categories' element={<Suspense fallback={null}><Categories /></Suspense>} />
										<Route path='services' element={<Suspense fallback={null}><Services /></Suspense>} />
										<Route path='motifs' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
										<Route path='resources' element={<Suspense fallback={null}><SallesMotifs /></Suspense>} />
										<Route path='settings' element={<Suspense fallback={null}><Settings /></Suspense>} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST']} />}>
										<Route path='contacts' element={<Suspense fallback={null}><Contacts /></Suspense>} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
										<Route path='patients' element={<Suspense fallback={null}><Patients /></Suspense>} />
										<Route path='appointments' element={<Suspense fallback={null}><Appointments /></Suspense>} />
										<Route path='calendar' element={<Suspense fallback={null}><Calendar /></Suspense>} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
										<Route path='dashboard' element={<Suspense fallback={null}><Dashboard /></Suspense>} />
									</Route>

									{/* Default redirect based on role */}
									<Route index element={<RoleBasedRedirect />} />
								</Route>
							</Route>

							<Route element={<UnauthWrapper />}>
								<Route path='login' element={<Login />} />
							</Route>
						</Route>

						<Route path='admin1' element={<BackOfficeLayoutDark />}>
							<Route index element={<Suspense fallback={null}><DashboardDark /></Suspense>} />
						</Route>
					</Routes>
				</BrowserRouter>
			</DatesProvider>
		</MantineProvider>
	)
}

export default App
