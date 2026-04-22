import { createRoot } from 'react-dom/client'
import './index.css'
import '@mantine/dates/styles.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
	<>
		<Toaster position='top-right' reverseOrder={false} />
		<App />
	</>,
)
