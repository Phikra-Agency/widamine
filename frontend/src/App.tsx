import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthWrapper, RefreshWrapper, UnauthWrapper, RoleWrapper } from '@/components/wrappers'
import { BackOfficeLayout, Layout } from '@/components/layouts'
import { Login } from '@/pages/auth'
import { Users, Appointments, Calendar, Contacts, Categories, Services, Patients, Dashboard, Motifs, Resources } from '@/pages/back-office'
import { Home, Contact, Appointment, ServiceDetail } from '@/pages'
import { useGSAP } from '@gsap/react'
import { Flip } from 'gsap/all'
import gsap from 'gsap'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

gsap.registerPlugin(useGSAP, Flip)

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
									<Route path='motifs' element={<Motifs />} />
									<Route path='resources' element={<Resources />} />
								</Route>

								<Route path='back-office' element={<BackOfficeLayout />}>
									<Route element={<RoleWrapper roles={['ADMIN']} />}>
										<Route path='users' element={<Users />} />
										<Route path='patients' element={<Patients />} />
										<Route path='categories' element={<Categories />} />
										<Route path='services' element={<Services />} />
										<Route path='motifs' element={<Motifs />} />
										<Route path='resources' element={<Resources />} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST']} />}>
										<Route path='contacts' element={<Contacts />} />
									</Route>

									<Route element={<RoleWrapper roles={['ADMIN', 'RECEPTIONIST', 'DOCTOR']} />}>
										<Route path='appointments' element={<Appointments />} />
										<Route path='calendar' element={<Calendar />} />
										<Route path='dashboard' element={<Dashboard />} />
										<Route index element={<Navigate to='dashboard' />} />
									</Route>
								</Route>

							</Route>

							<Route element={<UnauthWrapper />}>
								<Route path='login' element={<Login />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</DatesProvider>
		</MantineProvider>
	)
}

export default App
