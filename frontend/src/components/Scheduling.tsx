import { AnimatePresence, motion } from 'framer-motion'
import BookingFlow from '@/components/BookingFlow'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

const overlayVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.25 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Scheduling() {
	const { isOpen, close, reset } = useScheduleModalStore()

	const handleClose = () => {
		reset()
		close()
	}

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div className='fixed inset-0 z-[9999]' initial='hidden' animate='visible' exit='exit'>
					<motion.div className='absolute inset-0 bg-black/60 backdrop-blur-md' variants={overlayVariants} onClick={handleClose} />
					<div className='pointer-events-none absolute inset-0 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4 sm:py-6'>
						<BookingFlow onClose={handleClose} />
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}
