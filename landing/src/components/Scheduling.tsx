import { AnimatePresence, motion } from 'framer-motion'
import BookingFlow from '@/components/BookingFlow'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

export default function Scheduling() {
	const { isOpen, close, reset } = useScheduleModalStore()

	const handleClose = () => {
		reset()
		close()
	}

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					className='fixed inset-0 z-[9999]'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
				>
					<div className='absolute inset-0 bg-black/40' onClick={handleClose} />
					<div className='pointer-events-none absolute inset-0 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4 sm:py-6'>
						<BookingFlow onClose={handleClose} />
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}
