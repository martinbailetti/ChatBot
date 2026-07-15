import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Check, X, AlertCircle, RefreshCw, HelpCircle, Pencil, Trash2 } from 'lucide-react'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'
import useAuthStore from '@/store/useAuthStore'

const EMPTY_FAQ = { pregunta: '', respuesta: '' }

function FaqForm({ initial = EMPTY_FAQ, onSave, onCancel }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(initial)

  function update(key, value) {
    setForm(function (prev) { return Object.assign({}, prev, { [key]: value }) })
  }

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('faqs.question')} *
          </label>
          <input
            value={form.pregunta}
            onChange={function (e) { update('pregunta', e.target.value) }}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder={t('faqs.questionPlaceholder')}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('faqs.answer')} *
          </label>
          <textarea
            value={form.respuesta}
            onChange={function (e) { update('respuesta', e.target.value) }}
            rows={4}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder={t('faqs.answerPlaceholder')}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={function () { onSave(form) }}
          disabled={!form.pregunta.trim() || !form.respuesta.trim()}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {t('common.save')}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}

export default function FaqsPage() {
  const { t }   = useTranslation()
  const user    = useAuthStore(function (s) { return s.user })
  const isAdmin = user?.type === 'ADMIN'

  const [faqs, setFaqs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const [showForm, setShowForm]       = useState(false)
  const [editIdx, setEditIdx]         = useState(null)
  const [saved, setSaved]             = useState(false)

  const load = useCallback(async function () {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/faqs')
      const d   = res.data ?? {}
      setFaqs(Array.isArray(d.faqs) ? d.faqs : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function () { load() }, [load])

  async function persist(newFaqs) {
    setSaving(true)
    setError(null)
    try {
      const res = await authFetch('/api/faqs', {
        method: 'POST',
        body:   JSON.stringify({ title: '', description: '', faqs: newFaqs }),
      })
      const d = res.data ?? {}
      setFaqs(Array.isArray(d.faqs) ? d.faqs : newFaqs)
      setSaved(true)
      setTimeout(function () { setSaved(false) }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleAdd(form) {
    const updated = faqs.concat([form])
    setFaqs(updated)
    setShowForm(false)
    persist(updated)
  }

  function handleUpdate(idx, form) {
    const updated = faqs.map(function (f, i) { return i === idx ? form : f })
    setFaqs(updated)
    setEditIdx(null)
    persist(updated)
  }

  function handleDelete(idx) {
    if (!window.confirm(t('faqs.confirmDelete'))) return
    const updated = faqs.filter(function (_, i) { return i !== idx })
    setFaqs(updated)
    persist(updated)
  }

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('faqs.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('faqs.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !showForm && editIdx === null && (
            <button
              onClick={function () { setShowForm(true) }}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              {t('faqs.addNew')}
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Formulario nueva FAQ */}
      {isAdmin && showForm && (
        <div className="mb-6">
          <FaqForm
            onSave={handleAdd}
            onCancel={function () { setShowForm(false) }}
          />
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400">{t('common.loading')}</div>
      ) : faqs.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <HelpCircle className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p>{t('faqs.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {saved && (
            <div className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-4 w-4" />
              {t('common.saved')}
            </div>
          )}
          {faqs.map(function (faq, idx) {
            return (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                {editIdx === idx ? (
                  <FaqForm
                    initial={{ pregunta: faq.pregunta, respuesta: faq.respuesta }}
                    onSave={function (form) { handleUpdate(idx, form) }}
                    onCancel={function () { setEditIdx(null) }}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{faq.pregunta}</h3>
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={function () { setEditIdx(idx); setShowForm(false) }}
                            className="rounded p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title={t('common.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={function () { handleDelete(idx) }}
                            disabled={saving}
                            className="rounded p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{faq.respuesta}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
