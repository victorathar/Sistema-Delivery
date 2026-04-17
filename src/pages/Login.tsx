import { useState, FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const { session, loading, signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(username, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#6B21A8] flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-2xl">🍕</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Vipper Food</h1>
          <p className="text-sm text-[#6B7280] mt-1">Painel Administrativo</p>
        </div>

        {/* Card */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-[#1A1A2E]">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="border-[#E5E7EB] focus-visible:ring-[#6B21A8] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#1A1A2E]">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="border-[#E5E7EB] focus-visible:ring-[#6B21A8] rounded-lg"
              />
            </div>

            {error && (
              <p className="text-sm text-[#DC2626] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#6B21A8] hover:bg-[#7C3AED] text-white rounded-lg h-10 font-medium transition-colors"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
