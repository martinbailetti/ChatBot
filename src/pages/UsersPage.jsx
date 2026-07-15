import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, RefreshCw, X, Check, Users, AlertCircle, Pencil, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authFetch } from '@/utils/apiFetch'
import { Button, Input, Badge } from '@/components/ui'
import { cn } from '@/utils/cn'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY_FORM = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  type: 'DEFAULT',
}

const EMPTY_EDIT_FORM = {
  email: '',
  first_name: '',
  last_name: '',
  type: 'DEFAULT',
}

function validate(fields, t) {
  const errors = {}
  if (!fields.email.trim()) {
    errors.email = t('users.errors.emailRequired')
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = t('users.errors.emailInvalid')
  }
  if (!fields.first_name.trim()) errors.first_name = t('users.errors.firstNameRequired')
  if (!fields.last_name.trim())  errors.last_name  = t('users.errors.lastNameRequired')
  if (!fields.password) {
    errors.password = t('users.errors.passwordRequired')
  } else if (fields.password.length < 8) {
    errors.password = t('users.errors.passwordMin')
  }
  if (fields.password !== fields.password_confirm) {
    errors.password_confirm = t('users.errors.passwordMismatch')
  }
  if (!['ADMIN', 'DEFAULT'].includes(fields.type)) {
    errors.type = t('users.errors.typeInvalid')
  }
  return errors
}

function validateEdit(fields, t) {
  const errors = {}
  if (!fields.email.trim()) {
    errors.email = t('users.errors.emailRequired')
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = t('users.errors.emailInvalid')
  }
  if (!fields.first_name.trim()) errors.first_name = t('users.errors.firstNameRequired')
  if (!fields.last_name.trim())  errors.last_name  = t('users.errors.lastNameRequired')
  if (!['ADMIN', 'DEFAULT'].includes(fields.type)) {
    errors.type = t('users.errors.typeInvalid')
  }
  return errors
}

function normalizeTreeNode(node) {
  if (!node || typeof node !== 'object') return null
  const path = typeof node.path === 'string' ? node.path : ''
  const name = typeof node.name === 'string' && node.name.trim() ? node.name : path
  const children = Array.isArray(node.children)
    ? node.children.map(normalizeTreeNode).filter(Boolean)
    : []
  return { name, path, children }
}

function PathTreeSelector({ tree, selectedPaths, onChange, loading, error }) {
  const { t } = useTranslation()
  const selectedSet = useMemo(() => new Set(selectedPaths), [selectedPaths])
  const [expanded, setExpanded] = useState(() => new Set(tree?.path ? [tree.path] : []))

  useEffect(() => {
    setExpanded(new Set(tree?.path ? [tree.path] : []))
  }, [tree?.path])

  function handleToggleExpand(path) {
    if (!path) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  function handleToggleNode(node, checked) {
    const next = new Set(selectedSet)
    if (checked) next.add(node.path)
    else next.delete(node.path)
    onChange(Array.from(next).sort())
  }

  function renderNode(node, depth = 0) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const isExpanded = expanded.has(node.path)
    const isChecked = selectedSet.has(node.path)
    const inputId = `user-path-${node.path.replace(/[^a-zA-Z0-9_-]/g, '_')}`

    return (
      <div key={node.path || `${node.name}-${depth}`} className="select-none">
        <div
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && handleToggleExpand(node.path)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label={hasChildren ? t('common.actions') : t('common.loading')}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded
                ? <ChevronDown className="h-4 w-4" aria-hidden="true" />
                : <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : null}
          </button>

          <input
            id={inputId}
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleToggleNode(node, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
          />

          <label htmlFor={inputId} className="text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
            {node.name}
          </label>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('users.pathsTitle')}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('users.pathsSelected', { count: selectedPaths.length })}
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('users.pathsHelp')}
      </p>

      {loading ? (
        <div className="rounded-md border border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t('users.pathsLoading')}
        </div>
      ) : error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {t('users.pathsError')}
        </div>
      ) : !tree ? (
        <div className="rounded-md border border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t('users.pathsEmpty')}
        </div>
      ) : (
        <div className="max-h-64 overflow-auto rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {renderNode(tree)}
        </div>
      )}
    </div>
  )
}

// ── Componente de fila de tabla ───────────────────────────────────────────────
function UserRow({ user, onEdit }) {
  const { t } = useTranslation()
  const date = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : '—'
  const isAdmin = user.type === 'ADMIN'
  const pathCount = Array.isArray(user.paths) ? user.paths.length : 0

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
        #{user.Id}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {t('users.pathsSelected', { count: pathCount })}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          isAdmin
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        )}>
          {isAdmin ? t('users.typeAdmin') : t('users.typeDefault')}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-xs text-slate-400 dark:text-slate-500">
        {date}
      </td>
      <td className="px-4 py-3 text-right">
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(user)}>
          <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t('common.edit')}
        </Button>
      </td>
    </tr>
  )
}

// ── Formulario de nuevo usuario ───────────────────────────────────────────────
function NewUserForm({ onCreated, onCancel, pathTree, pathTreeLoading, pathTreeError }) {
  const { t } = useTranslation()
  const [fields, setFields]   = useState(EMPTY_FORM)
  const [selectedPaths, setSelectedPaths] = useState([])
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(fields, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setApiError(null)

    try {
      const res = await authFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email:      fields.email.trim(),
          first_name: fields.first_name.trim(),
          last_name:  fields.last_name.trim(),
          password:   fields.password,
          type:       fields.type,
          paths:      selectedPaths,
        }),
      })

      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          onCreated(res.data)
        }, 800)
      } else {
        setApiError(res.message ?? t('users.createError'))
      }
    } catch (err) {
      let message = t('users.createError')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('users.createSuccess')}
        </p>
      </div>
    )
  }

  const fieldClass = 'flex flex-col gap-1'
  const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300'
  const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-0.5'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {apiError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="first_name" className={labelClass}>{t('users.firstName')}</label>
          <Input id="first_name" name="first_name" value={fields.first_name} onChange={handleChange} disabled={loading} placeholder={t('users.firstNamePlaceholder')} />
          {errors.first_name && <span className={errorClass}>{errors.first_name}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="last_name" className={labelClass}>{t('users.lastName')}</label>
          <Input id="last_name" name="last_name" value={fields.last_name} onChange={handleChange} disabled={loading} placeholder={t('users.lastNamePlaceholder')} />
          {errors.last_name && <span className={errorClass}>{errors.last_name}</span>}
        </div>
      </div>

      <div className={fieldClass}>
        <label htmlFor="new_email" className={labelClass}>{t('auth.email')}</label>
        <Input id="new_email" name="email" type="email" autoComplete="off" value={fields.email} onChange={handleChange} disabled={loading} placeholder="usuario@ejemplo.com" />
        {errors.email && <span className={errorClass}>{errors.email}</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="new_password" className={labelClass}>{t('auth.password')}</label>
          <Input id="new_password" name="password" type="password" autoComplete="new-password" value={fields.password} onChange={handleChange} disabled={loading} placeholder="••••••••" />
          {errors.password && <span className={errorClass}>{errors.password}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="password_confirm" className={labelClass}>{t('users.passwordConfirm')}</label>
          <Input id="password_confirm" name="password_confirm" type="password" autoComplete="new-password" value={fields.password_confirm} onChange={handleChange} disabled={loading} placeholder="••••••••" />
          {errors.password_confirm && <span className={errorClass}>{errors.password_confirm}</span>}
        </div>
      </div>

      <div className={fieldClass}>
        <label htmlFor="user_type" className={labelClass}>{t('users.type')}</label>
        <select
          id="user_type"
          name="type"
          value={fields.type}
          onChange={handleChange}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="DEFAULT">{t('users.typeDefault')}</option>
          <option value="ADMIN">{t('users.typeAdmin')}</option>
        </select>
        {errors.type && <span className={errorClass}>{errors.type}</span>}
      </div>

      <PathTreeSelector
        tree={pathTree}
        selectedPaths={selectedPaths}
        onChange={setSelectedPaths}
        loading={pathTreeLoading}
        error={pathTreeError}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          <UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {loading ? t('users.creating') : t('users.createBtn')}
        </Button>
      </div>
    </form>
  )
}

function EditUserForm({ user, onSaved, onCancel, pathTree, pathTreeLoading, pathTreeError }) {
  const { t } = useTranslation()
  const [fields, setFields] = useState(EMPTY_EDIT_FORM)
  const [selectedPaths, setSelectedPaths] = useState([])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setFields({
      email: user.email ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      type: user.type ?? 'DEFAULT',
    })
    setSelectedPaths(Array.isArray(user.paths) ? user.paths : [])
    setErrors({})
    setApiError(null)
  }, [user])

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateEdit(fields, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setApiError(null)

    try {
      const res = await authFetch(`/api/users/${user.Id}`, {
        method: 'PUT',
        body: JSON.stringify({
          email: fields.email.trim(),
          first_name: fields.first_name.trim(),
          last_name: fields.last_name.trim(),
          type: fields.type,
          paths: selectedPaths,
        }),
      })

      if (res.success) {
        onSaved(res.data)
      } else {
        setApiError(res.message ?? t('users.updateError'))
      }
    } catch (err) {
      let message = t('users.updateError')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'flex flex-col gap-1'
  const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300'
  const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-0.5'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {apiError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="edit_first_name" className={labelClass}>{t('users.firstName')}</label>
          <Input id="edit_first_name" name="first_name" value={fields.first_name} onChange={handleChange} disabled={loading} placeholder={t('users.firstNamePlaceholder')} />
          {errors.first_name && <span className={errorClass}>{errors.first_name}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="edit_last_name" className={labelClass}>{t('users.lastName')}</label>
          <Input id="edit_last_name" name="last_name" value={fields.last_name} onChange={handleChange} disabled={loading} placeholder={t('users.lastNamePlaceholder')} />
          {errors.last_name && <span className={errorClass}>{errors.last_name}</span>}
        </div>
      </div>

      <div className={fieldClass}>
        <label htmlFor="edit_email" className={labelClass}>{t('auth.email')}</label>
        <Input id="edit_email" name="email" type="email" autoComplete="off" value={fields.email} onChange={handleChange} disabled={loading} placeholder="usuario@ejemplo.com" />
        {errors.email && <span className={errorClass}>{errors.email}</span>}
      </div>

      <div className={fieldClass}>
        <label htmlFor="edit_user_type" className={labelClass}>{t('users.type')}</label>
        <select
          id="edit_user_type"
          name="type"
          value={fields.type}
          onChange={handleChange}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="DEFAULT">{t('users.typeDefault')}</option>
          <option value="ADMIN">{t('users.typeAdmin')}</option>
        </select>
        {errors.type && <span className={errorClass}>{errors.type}</span>}
      </div>

      <PathTreeSelector
        tree={pathTree}
        selectedPaths={selectedPaths}
        onChange={setSelectedPaths}
        loading={pathTreeLoading}
        error={pathTreeError}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {loading ? t('users.editing') : t('users.editBtn')}
        </Button>
      </div>
    </form>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function UsersPage() {
  const { t }   = useTranslation()
  const { isAuthenticated } = useAuth()

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [pathTree, setPathTree] = useState(null)
  const [pathTreeLoading, setPathTreeLoading] = useState(true)
  const [pathTreeError, setPathTreeError] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await authFetch('/api/users')
      if (res.success) {
        setUsers(res.data?.users ?? [])
      } else {
        setFetchError(res.message ?? t('users.fetchError'))
      }
    } catch (err) {
      setFetchError(t('users.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const loadPathTree = useCallback(async () => {
    setPathTreeLoading(true)
    setPathTreeError(null)
    try {
      const res = await authFetch('/api/documents/tree')
      if (res.success) {
        setPathTree(normalizeTreeNode(res.data))
      } else {
        setPathTree(null)
        setPathTreeError(res.message ?? t('users.pathsError'))
      }
    } catch (err) {
      setPathTree(null)
      setPathTreeError(t('users.pathsError'))
    } finally {
      setPathTreeLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
      loadPathTree()
    }
  }, [isAuthenticated, loadUsers, loadPathTree])

  function handleCreated() {
    setShowForm(false)
    setEditingUser(null)
    loadUsers()
  }

  function handleUpdated() {
    setEditingUser(null)
    loadUsers()
  }

  function handleStartEdit(user) {
    setEditingUser(user)
    setShowForm(false)
  }

  return (
    <main className="page-container py-10">
      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('users.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('users.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadUsers} disabled={loading} title={t('dashboard.refresh')}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowForm((v) => !v)
              setEditingUser(null)
            }}
          >
            {showForm
              ? <><X className="mr-1.5 h-4 w-4" aria-hidden="true" />{t('common.cancel')}</>
              : <><UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />{t('users.newUser')}</>
            }
          </Button>
        </div>
      </div>

      {/* Formulario de nuevo usuario */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('users.newUser')}
          </h2>
          <NewUserForm
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
            pathTree={pathTree}
            pathTreeLoading={pathTreeLoading}
            pathTreeError={pathTreeError}
          />
        </div>
      )}

      {editingUser && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('users.editUser')}: {editingUser.first_name} {editingUser.last_name}
          </h2>
          <EditUserForm
            user={editingUser}
            onSaved={handleUpdated}
            onCancel={() => setEditingUser(null)}
            pathTree={pathTree}
            pathTreeLoading={pathTreeLoading}
            pathTreeError={pathTreeError}
          />
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        {/* Cabecera de tabla y contador */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('users.list')}
          </span>
          {!loading && (
            <Badge variant="default">{users.length}</Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" aria-hidden="true" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
            <Button variant="ghost" size="sm" onClick={loadUsers}>{t('dashboard.refresh')}</Button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('users.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-16">
                    ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('users.nameEmail')}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('users.type')}
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('users.createdAt')}
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.Id} user={user} onEdit={handleStartEdit} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
