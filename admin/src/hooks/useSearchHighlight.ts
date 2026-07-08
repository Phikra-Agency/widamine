import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useSearchHighlight(type: string, duration = 2000) {
  const location = useLocation()
  const handledRef = useRef<string | null>(null)

  useEffect(() => {
    const sh = (location.state as { sh?: string })?.sh
    if (!sh || handledRef.current === sh) return
    handledRef.current = sh

    const [shType, shId] = sh.split(':')
    if (shType !== type || !shId) return

    window.history.replaceState({}, document.title)

    const el = document.querySelector<HTMLElement>(`[data-id="${CSS.escape(shId)}"]`)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('search-highlight')
    const timer = setTimeout(() => el.classList.remove('search-highlight'), duration)

    return () => { clearTimeout(timer); el.classList.remove('search-highlight') }
  }, [location.state, type, duration])
}
