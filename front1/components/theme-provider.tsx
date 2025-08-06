"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --theme-transition-duration: 5s;
        }
        
        .theme-transition {
          transition: background-color var(--theme-transition-duration) ease,
                      color var(--theme-transition-duration) ease;
          position: relative;
          overflow: hidden;
        }

        .theme-transition::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          background: hsl(var(--background));
          transition: transform var(--theme-transition-duration) ease;
          transform: translate(-100%, -100%) rotate(45deg);
          transform-origin: 0 0;
          pointer-events: none;
          z-index: -1;
        }

        [data-theme="dark"] .theme-transition::before {
          transform: translate(0, 0) rotate(45deg);
        }

        /* Smooth transition for other elements */
        * {
          transition-property: border-color, background-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: var(--theme-transition-duration);
        }
      `}</style>
      <div className="theme-transition">
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </div>
    </>
  )
}
