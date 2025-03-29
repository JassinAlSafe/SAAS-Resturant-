import { shadcnPlugin } from "./src/lib/shadcn-plugin";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    safelist: [
        'hover:shadow',
        'hover:shadow-md',
        'hover:shadow-lg',
        'hover:shadow-xl',
    ],
    plugins: [
        shadcnPlugin,
        daisyui
    ],
    daisyui: {
        themes: [{
            restaurant: {
                "primary": "hsl(24 100% 50%)", // Vibrant orange
                "primary-content": "hsl(0 0% 100%)", // White
                "secondary": "hsl(0 0% 95%)", // Very light gray
                "secondary-content": "hsl(0 0% 10%)", // Near black
                "accent": "hsl(24 100% 96%)", // Light orange
                "accent-content": "hsl(24 90% 40%)", // Dark orange
                "neutral": "hsl(0 0% 10%)", // Near black
                "neutral-content": "hsl(0 0% 100%)", // White
                "base-100": "hsl(0 0% 100%)", // Pure white
                "base-content": "hsl(0 0% 10%)", // Near black
                "info": "hsl(198 93% 60%)",
                "success": "hsl(142 76% 36%)",
                "warning": "hsl(38 92% 50%)",
                "error": "hsl(0 84% 60%)"
            },
            "restaurant-dark": {
                "primary": "hsl(24 100% 50%)", // Vibrant orange
                "primary-content": "hsl(0 0% 100%)", // White
                "secondary": "hsl(0 0% 15%)", // Very dark gray
                "secondary-content": "hsl(0 0% 100%)", // White
                "accent": "hsl(24 30% 15%)", // Dark orange
                "accent-content": "hsl(0 0% 100%)", // White
                "neutral": "hsl(0 0% 100%)", // White
                "neutral-content": "hsl(0 0% 10%)", // Near black
                "base-100": "hsl(0 0% 10%)", // Near black
                "base-content": "hsl(0 0% 100%)", // White
                "info": "hsl(198 93% 60%)",
                "success": "hsl(142 76% 36%)",
                "warning": "hsl(38 92% 50%)",
                "error": "hsl(0 84% 60%)"
            }
        }],
        darkTheme: "restaurant-dark",
    }
};

export default config;