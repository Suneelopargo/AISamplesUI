import { useEffect, useState } from 'react'
import AIScannerPage from './pages/AIScannerPage'
import AIClaimPage from './pages/AIClaimPage'

const getActiveView = () => {
  if (window.location.hash === '#scanner') return 'scanner'
  if (window.location.hash === '#claim') return 'claim'
  return 'home'
}

function App() {
  const [activeView, setActiveView] = useState(getActiveView)

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#home'
    }

    const onHashChange = () => {
      setActiveView(getActiveView())
    }

    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  const renderContent = () => {
    if (activeView === 'scanner') {
      return <AIScannerPage />
    }

    if (activeView === 'claim') {
      return <AIClaimPage />
    }

    return (
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 min-h-[300px] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800">My AI Samples</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-5">
      <div className="flex gap-4 md:gap-6 items-start">
        <aside className="w-[220px] md:w-[280px] bg-slate-200 rounded-xl p-4 sticky top-3 h-[calc(100vh-24px)] overflow-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-5 leading-none">Navigation</h2>

          <a
            href="#home"
            className={`block px-4 py-3 rounded-lg font-medium mb-2 transition-colors ${
              activeView === 'home'
                ? 'bg-sky-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-300'
            }`}
          >
            Home
          </a>

          <a
            href="#scanner"
            className={`block px-4 py-3 rounded-lg font-medium mb-2 transition-colors ${
              activeView === 'scanner'
                ? 'bg-sky-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-300'
            }`}
          >
            AI Scanner
          </a>

          <a
            href="#claim"
            className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'claim'
                ? 'bg-sky-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-300'
            }`}
          >
            AI Claim
          </a>
        </aside>

        <main className="flex-1 min-w-0 pt-1">{renderContent()}</main>
      </div>
    </div>
  )
}

export default App