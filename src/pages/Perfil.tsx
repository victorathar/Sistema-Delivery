import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Building2, Phone, Clock, Calendar,
  ShieldCheck, ShieldAlert, Mail, LogOut, ArrowLeft,
  Pencil, Check, X, Camera, Loader2,
} from 'lucide-react'
import {
  fetchPerfil, type PerfilUsuario,
  updateUsernameField, updateEmailField,
  updateRestauranteNome, updateRestauranteWhatsapp,
  uploadAvatar,
} from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useStore } from '@/store/useStore'
import { toast } from 'sonner'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

type EditField = 'username' | 'email' | 'restaurante_nome' | 'restaurante_whatsapp' | null

export default function Perfil() {
  const navigate    = useNavigate()
  const { signOut } = useAuth()

  const restauranteNome = useStore((s) => s.restauranteNome)
  const setRestauranteNome = (nome: string) => useStore.setState({ restauranteNome: nome })

  const [perfil, setPerfil]     = useState<PerfilUsuario | null>(null)
  const [loading, setLoading]   = useState(true)
  const [erro, setErro]         = useState<string | null>(null)
  const [saindo, setSaindo]     = useState(false)

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Edição inline
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    fetchPerfil()
      .then(setPerfil)
      .catch(() => setErro('Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(field: EditField, currentValue: string) {
    setEditField(field)
    setEditValue(currentValue)
  }

  function cancelEdit() {
    setEditField(null)
    setEditValue('')
  }

  async function saveEdit() {
    if (!perfil || !editField || !editValue.trim()) return
    setSaving(true)
    try {
      const val = editValue.trim()
      if (editField === 'username') {
        await updateUsernameField(val)
        setPerfil({ ...perfil, username: val })
        toast.success('Usuário atualizado!')
      } else if (editField === 'email') {
        await updateEmailField(val)
        setPerfil({ ...perfil, email: val })
        toast.success('E-mail atualizado! Verifique sua caixa de entrada para confirmar.')
      } else if (editField === 'restaurante_nome') {
        await updateRestauranteNome(perfil.restaurante_id, val)
        setPerfil({ ...perfil, restaurante_nome: val })
        setRestauranteNome(val)
        toast.success('Nome da empresa atualizado!')
      } else if (editField === 'restaurante_whatsapp') {
        await updateRestauranteWhatsapp(perfil.restaurante_id, val)
        setPerfil({ ...perfil, restaurante_whatsapp: val })
        toast.success('WhatsApp atualizado!')
      }
      setEditField(null)
      setEditValue('')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2 MB.')
      return
    }
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      setPerfil((p) => p ? { ...p, avatar_url: url } : p)
      useStore.setState({ avatarUrl: url })
      toast.success('Foto atualizada!')
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao enviar a foto.')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSignOut() {
    setSaindo(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = (perfil?.username ?? restauranteNome)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-violet-100/50 dark:from-primary/20 dark:to-violet-900/20 border border-primary/20 rounded-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative shrink-0 group/avatar">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-soft overflow-hidden">
            {perfil?.avatar_url
              ? <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              : (initials || <User className="w-8 h-8" />)}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity disabled:cursor-not-allowed"
            title="Alterar foto"
          >
            {uploadingAvatar
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-foreground">
            {loading ? '...' : (perfil?.username ?? '—')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? '' : (perfil?.email ?? '')}
          </p>
          {perfil && (
            <span className={`inline-flex items-center gap-1.5 mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${
              perfil.role === 'admin'
                ? 'bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700'
                : 'bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700'
            }`}>
              {perfil.role === 'admin'
                ? <><ShieldCheck className="w-3.5 h-3.5" /> Administrador</>
                : <><ShieldAlert className="w-3.5 h-3.5" /> Staff</>
              }
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-muted-foreground text-sm">Carregando perfil...</div>
      )}

      {erro && (
        <div className="text-center py-10 text-destructive text-sm">{erro}</div>
      )}

      {perfil && !loading && (
        <>
          {/* Seção: Conta */}
          <div className="bg-background border border-border rounded-card overflow-hidden shadow-soft">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Conta</h2>
            </div>
            <div className="divide-y divide-border">
              <EditableRow
                icon={<User className="w-4 h-4 text-muted-foreground" />}
                label="Usuário"
                value={perfil.username}
                field="username"
                editField={editField}
                editValue={editValue}
                saving={saving}
                onEdit={() => startEdit('username', perfil.username)}
                onCancel={cancelEdit}
                onSave={saveEdit}
                onChange={setEditValue}
              />
              <EditableRow
                icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                label="E-mail"
                value={perfil.email}
                field="email"
                inputType="email"
                editField={editField}
                editValue={editValue}
                saving={saving}
                onEdit={() => startEdit('email', perfil.email)}
                onCancel={cancelEdit}
                onSave={saveEdit}
                onChange={setEditValue}
              />
              <Row
                icon={perfil.role === 'admin'
                  ? <ShieldCheck className="w-4 h-4 text-violet-500" />
                  : <ShieldAlert className="w-4 h-4 text-sky-500" />}
                label="Perfil de acesso"
                value={perfil.role === 'admin' ? 'Administrador' : 'Staff'}
              />
              <Row
                icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                label="Membro desde"
                value={formatDate(perfil.usuario_criado_em)}
              />
              {perfil.ultimo_acesso && (
                <Row
                  icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                  label="Último acesso"
                  value={formatDateTime(perfil.ultimo_acesso)}
                />
              )}
            </div>
          </div>

          {/* Seção: Restaurante */}
          <div className="bg-background border border-border rounded-card overflow-hidden shadow-soft">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Restaurante</h2>
            </div>
            <div className="divide-y divide-border">
              <EditableRow
                icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                label="Nome da empresa"
                value={perfil.restaurante_nome}
                field="restaurante_nome"
                editField={editField}
                editValue={editValue}
                saving={saving}
                onEdit={() => startEdit('restaurante_nome', perfil.restaurante_nome)}
                onCancel={cancelEdit}
                onSave={saveEdit}
                onChange={setEditValue}
              />
              <EditableRow
                icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                label="WhatsApp"
                value={perfil.restaurante_whatsapp}
                field="restaurante_whatsapp"
                inputType="tel"
                editField={editField}
                editValue={editValue}
                saving={saving}
                onEdit={() => startEdit('restaurante_whatsapp', perfil.restaurante_whatsapp)}
                onCancel={cancelEdit}
                onSave={saveEdit}
                onChange={setEditValue}
              />
              <Row
                icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                label="Horário"
                value={`${formatTime(perfil.horario_abertura)} – ${formatTime(perfil.horario_fechamento)}`}
              />
              <Row
                icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                label="Cadastrado em"
                value={formatDate(perfil.restaurante_criado_em)}
              />
            </div>
          </div>

          {/* Botão sair */}
          <button
            onClick={handleSignOut}
            disabled={saindo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/85 transition-colors disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {saindo ? 'Saindo...' : 'Sair da conta'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Row somente leitura ──────────────────────────────────────────────────────
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="shrink-0">{icon}</div>
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground min-w-0 break-all">{value}</span>
    </div>
  )
}

// ─── Row editável ─────────────────────────────────────────────────────────────
function EditableRow({
  icon, label, value, field, inputType = 'text',
  editField, editValue, saving,
  onEdit, onCancel, onSave, onChange,
}: {
  icon: React.ReactNode
  label: string
  value: string
  field: EditField
  inputType?: string
  editField: EditField
  editValue: string
  saving: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onChange: (v: string) => void
}) {
  const isEditing = editField === field

  return (
    <div className="group flex items-center gap-3 px-5 py-3 min-h-[52px] hover:bg-muted/20 transition-colors">
      <div className="shrink-0">{icon}</div>
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <input
            autoFocus
            type={inputType}
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave()
              if (e.key === 'Escape') onCancel()
            }}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-input border border-primary/50 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={onSave}
            disabled={saving || !editValue.trim()}
            className="p-1.5 rounded-input bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 shrink-0"
            title="Salvar"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="p-1.5 rounded-input hover:bg-secondary text-muted-foreground transition-colors shrink-0"
            title="Cancelar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground min-w-0 break-all">{value}</span>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-input hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100"
            title={`Editar ${label}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
