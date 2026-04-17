import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { getRestauranteId } from '@/lib/api'

interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn:  (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null)
  const [loading, setLoading]   = useState(true)
  const initStore = useStore((s) => s.init)
  const initializedRef = useRef(false)

  // Carrega store apenas uma vez por sessão
  async function bootstrapStore(sess: Session | null) {
    if (!sess) return
    if (initializedRef.current) return
    initializedRef.current = true
    try {
      const restauranteId = await getRestauranteId()
      await initStore(restauranteId)
    } catch (err) {
      console.error('[bootstrapStore] Erro ao inicializar store:', err)
      initializedRef.current = false
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess)
      bootstrapStore(sess).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess)
      // INITIAL_SESSION já é tratado pelo getSession() acima
      // TOKEN_REFRESHED não precisa reinicializar o store inteiro
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return
      if (event === 'SIGNED_OUT') {
        initializedRef.current = false
        return
      }
      if (sess) bootstrapStore(sess)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(username: string, password: string) {
    const email = `${username}@vipperfood.com`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'Usuário ou senha inválidos.' }

    // Inicializa o store imediatamente após login
    await bootstrapStore(data.session)
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    // Limpa o store
    useStore.setState({
      pedidos: [], cardapio: [], categorias: [],
      configEntrega: null, configAgente: null,
      restauranteId: null, restauranteNome: '', avatarUrl: null,
    })
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
