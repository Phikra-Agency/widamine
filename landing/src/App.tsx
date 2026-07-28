import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

import { Layout } from '@/components/layouts'
import { Home, Contact, Appointment, ServiceCategory, ServiceDetail } from '@/pages'

gsap.registerPlugin(useGSAP)

export default function App() {
  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'fr' }}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path='contact' element={<Contact />} />
              <Route path='appointment' element={<Appointment />} />
              <Route path='category/:category' element={<ServiceCategory />} />
              <Route path='services/:slug' element={<ServiceDetail />} />
              <Route path='*' element={<>404</>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  )
}

