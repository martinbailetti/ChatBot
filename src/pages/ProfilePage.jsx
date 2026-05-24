import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, KeyRound, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authFetch } from '@/utils/apiFetch'
import { Button, Input } from '@/components/ui'
import { cn } from '@/utils/cn'

// ── Utilidades ─────────────────────────────────────────────────────────────────
const fieldClass = 'flex flex-col gap-1'
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300'
const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-0.5'

function SuccessBanner({ message }) {
  return (
    <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </div>
  )
}

// ── Panel de datos del perfil ──────────────────────────────────────────────────
function ProfileForm({ user, onUpdated }) {
  const { t } = useTranslation()
  const [fields, setFields] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccess(false)
    setApiError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!fields.first_name.trim()) errs.first_name = t('profile.errors.firstNameRequired')
    if (!fields.last_name.trim())  errs.last_name  = t('profile.errors.lastNameRequired')
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)
    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: fields.first_name.trim(),
          last_name:  fields.last_name.trim(),
        }),
      })
      if (res.success) {
        setSuccess(true)
        onUpdated(res.data)
      } else {
        setApiError(res.message ?? t('profile.saveError'))
      }
    } catch (err) {
      let message = t('profile.saveError')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {success  && <SuccessBanner message={t('profile.saveSuccess')} />}
      {apiError && <ErrorBanner  message={apiError} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="p_first_name" className={labelClass}>{t('users.firstName')}</label>
          <Input id="p_first_name" name="first_name" value={fields.first_name} onChange={handleChange} disabled={loading} />
          {errors.first_name && <span className={errorClass}>{errors.first_name}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="p_last_name" className={labelClass}>{t('users.lastName')}</label>
          <Input id="p_last_name" name="last_name" value={fields.last_name} onChange={handleChange} disabled={loading} />
          {errors.last_name && <span className={errorClass}>{errors.last_name}</span>}
        </div>
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>{t('auth.email')}</label>
        <Input value={user?.email ?? ''} disabled className="cursor-not-allowed opacity-60" />
        <span className="text-xs text-slate-400 dark:text-slate-500">{t('profile.emailReadOnly')}</span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('profile.saving') : t('profile.saveBtn')}
        </Button>
      </div>
    </form>
  )
}

// ── Panel de cambio de contraseña ──────────────────────────────────────────────
function PasswordForm() {
  const { t } = useTranslation()
  const EMPTY = { current_password: '', new_password: '', confirm_password: '' }
  const [fields,   setFields]   = useState(EMPTY)
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [apiError, setApiError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccess(false)
    setApiError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!fields.current_password)            errs.current_password = t('profile.errors.currentRequired')
    if (!fields.new_password) {
      errs.new_password = t('profile.errors.newRequired')
    } else if (fields.new_password.length < 8) {
      errs.new_password = t('profile.errors.newMin')
    }
    if (fields.new_password !== fields.confirm_password) {
      errs.confirm_password = t('profile.errors.confirmMismatch')
    }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)
    try {
      const res = await authFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: fields.current_password,
          new_password:     fields.new_password,
        }),
      })
      if (res.success) {
        setSuccess(true)
        setFields(EMPTY)
      } else {
        setApiError(res.message ?? t('profile.pwError'))
      }
    } catch (err) {
      let message = t('profile.pwError')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {success  && <SuccessBanner message={t('profile.pwSuccess')} />}
      {apiError && <ErrorBanner  message={apiError} />}

      <div className={fieldClass}>
        <label htmlFor="current_password" className={labelClass}>{t('profile.currentPassword')}</label>
        <Input id="current_password" name="current_password" type="password" autoComplete="current-password" value={fields.current_password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
        {errors.current_password && <span className={errorClass}>{errors.current_password}</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="new_password" className={labelClass}>{t('profile.newPassword')}</label>
          <Input id="new_password" name="new_password" type="password" autoComplete="new-password" value={fields.new_password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
          {errors.new_password && <span className={errorClass}>{errors.new_password}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="confirm_password" className={labelClass}>{t('profile.confirmPassword')}</label>
          <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" value={fields.confirm_password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
          {errors.confirm_password && <span className={errorClass}>{errors.confirm_password}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('profile.saving') : t('profile.pwBtn')}
        </Button>
      </div>
    </form>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { t }   = useTranslation()
  const { user: authUser, refreshMe } = useAuth()

  function handleProfileUpdated() {
    refreshMe()
  }

  const typeBadge = authUser?.type === 'ADMIN'
    ? { label: t('users.typeAdmin'),   cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' }
    : { label: t('users.typeDefault'), cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }

  return (
    <main className="page-container py-10">
      {/* Cabecera */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('profile.title')}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {authUser?.email}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', typeBadge.cls)}>
              {typeBadge.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Panel datos personales */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {t('profile.sectionData')}
          </h2>
          <ProfileForm user={authUser} onUpdated={handleProfileUpdated} />
        </section>

        {/* Panel cambio de contraseña */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {t('profile.sectionPassword')}
          </h2>
          <PasswordForm />
        </section>
      </div>
    </main>
  )
}
