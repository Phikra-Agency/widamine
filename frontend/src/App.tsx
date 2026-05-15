import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AuthWrapper, RefreshWrapper, UnauthWrapper, RoleWrapper } from '@/components/wrappers'
import { BackOfficeLayout, BackOfficeLayoutDark, Layout } from '@/components/layouts'
import { Login } from '@/pages/auth'
import { Users, Appointments, Calendar, Contacts, Categories, Services, Patients, Dashboard, SallesMotifs, Settings } from '@/pages/back-office'
import DashboardDark from '@/pages/back-office/DashboardDark'
import { Home, Contact, Appointment, ServiceDetail } from '@/pages'
import { useGSAP } from '@gsap/react'
import { Flip } from 'gsap/all'
import gsap from 'gsap'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

gsap.registerPlugin(useGSAP, Flip)

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
									<Route path='users' element={<Users />} />
									<Route path='patients' element={<Patients />} />
									<Route path='categories' element={<Categories />} />
									<Route path='services' element={<Services />} />
									<Route path='motifs' element={<SallesMotifs />} />
									<Route path='resources' element={<SallesMotifs />} />
								</Route>

								<Route path='back-office' element={<BackOfficeLayout />}>
									<Route element={<RoleWrapper roles={['ADMIN']} />}>
										<Route path='users' element={<Users />} />
										<Route path='categories' element={<Categories />} />
										<Route path='services' element={<Services />} />
										<Route path='motifs' element={<SallesMotifs />} />
										<Route path='resources' element={<SallesMotifs />} />
										<Route path='settings' element={<Settings />} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST']} />}>
										<Route path='contacts' element={<Contacts />} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
										<Route path='patients' element={<Patients />} />
										<Route path='appointments' element={<Appointments />} />
										<Route path='calendar' element={<Calendar />} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER']} />}>
										<Route path='dashboard' element={<Dashboard />} />
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
							<Route index element={<DashboardDark />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</DatesProvider>
		</MantineProvider>
	)
}

export default App
