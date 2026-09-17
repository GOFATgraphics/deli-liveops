import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, playUiSound, type Theme } from '../../lib/ui-polish'

export function UiPolishProvider() {
  const [theme, setTheme] = useState<Theme>('light')
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
      setShowTop(window.scrollY > 500)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('button, [role="button"]')
      if (button && !button.hasAttribute('data-no-ui-sound')) playUiSound('click')
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    playUiSound('click')
  }

  return (
    <>
      <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-background px-4 py-2 text-sm font-medium shadow transition-transform focus:translate-y-0">
        Skip to content
      </a>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[110] h-1 origin-left bg-primary" style={{ transform: `scaleX(${progress / 100})` }} />
      <div className="fixed bottom-5 right-5 z-50 flex gap-2">
        <button type="button" className="ui-polish-button rounded-full border bg-background p-3 shadow-lg" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {showTop && (
          <button type="button" className="ui-polish-button rounded-full border bg-background p-3 shadow-lg" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑
          </button>
        )}
      </div>
      <button type="button" className="fixed right-5 top-5 z-50 rounded-md border bg-background px-3 py-2 md:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation menu" onClick={() => setMenuOpen(v => !v)}>
        {menuOpen ? '×' : '☰'}
      </button>
    </>
  )
}
