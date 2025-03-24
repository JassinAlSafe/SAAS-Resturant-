import localFont from 'next/font/local'

// Cabinet Grotesk - for headlines (using Variable font for better compatibility)
export const cabinetGrotesk = localFont({
    src: '../../public/fonts/cabinet-grotesk/CabinetGrotesk-Variable.woff2',
    variable: '--font-cabinet-grotesk',
    display: 'swap',
})

// Satoshi - for body text (using Variable font for better compatibility)
export const satoshi = localFont({
    src: '../../public/fonts/satoshi/Satoshi-Variable.woff2',
    variable: '--font-satoshi',
    display: 'swap',
}) 