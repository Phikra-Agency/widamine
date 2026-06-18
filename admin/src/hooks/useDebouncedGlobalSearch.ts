import { useDebounce } from 'use-debounce'
import { useGlobalSearchStore } from '@/stores/globalSearchStore'

export function useDebouncedGlobalSearch(delay = 300) {
  const term = useGlobalSearchStore((state) => state.term)
  const [debouncedTerm] = useDebounce(term, delay)
  return debouncedTerm
}
