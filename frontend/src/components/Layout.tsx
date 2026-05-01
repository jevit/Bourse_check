import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-indigo-400">Bourse Tracker</span>
          <nav className="flex gap-1">
            <NavLink to="/portfolios" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              Portefeuilles
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              Alertes
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{username}</span>
          <button onClick={handleLogout} className="btn-secondary text-xs py-1 px-3">
            Déconnexion
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
