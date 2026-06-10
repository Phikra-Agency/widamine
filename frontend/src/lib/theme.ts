/* Shared Widamine public-page theme constants */

export const C = {
	bg: '#F7F1EB',
	primary: '#2e90c0',
	secondary: '#1a3646',
	accent: '#e8c5b8',
	orange: '#ef6007',
	yellow: '#ffb500',
	green: '#62bca1',
} as const

export const PAGE = {
	outerBg: 'bg-custom-white',
	section: 'py-24 sm:py-32 lg:py-40',
	container: 'mx-auto max-w-7xl px-4 sm:px-6',
	heading: (text: React.ReactNode) => (
		<h2 className='text-center font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
			{text}
		</h2>
	),
	cardShell: {
		rounded: 'rounded-[2rem]',
		border: 'border border-black/5',
		bg: 'bg-white',
		shadow: { boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' } as React.CSSProperties,
	},
} as const
