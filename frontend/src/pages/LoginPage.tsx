import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/portfolios')
    } catch {
      setError('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-indigo-400 mb-1">Bourse Tracker</h1>
        <p className="text-gray-500 text-sm mb-6">Portfolio FIRE · Dividendes · Multi-enveloppes</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Identifiant</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
