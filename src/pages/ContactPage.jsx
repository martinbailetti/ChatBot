import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Send } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(fields, t) {
  const errors = {}
  if (!fields.name.trim()) errors.name = t('contact.errors.nameRequired')
  if (!fields.email.trim()) {
    errors.email = t('contact.errors.emailRequired')
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = t('contact.errors.emailInvalid')
  }
  if (!fields.message.trim()) errors.message = t('contact.errors.messageRequired')
  return errors
}

const INITIAL_FIELDS = { name: '', email: '', company: '', message: '' }

export default function ContactPage() {
  const { t } = useTranslation()
  const [fields, setFields] = useState(INITIAL_FIELDS)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(fields, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    // Simulación de envío — no conecta a servidor real
    await new Promise((res) => setTimeout(res, 900))
    setSubmitting(false)
    setSuccess(true)
    setFields(INITIAL_FIELDS)
    setErrors({})
  }

  return (
    <main className="page-container py-10">
      <div className="max-w-lg">
        <h1 className="section-title text-3xl">{t('contact.title')}</h1>
        <p className="section-subtitle mt-1 mb-8">{t('contact.subtitle')}</p>

        {success ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-medium">{t('contact.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label={t('contact.name')}
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t('contact.namePlaceholder')}
              value={fields.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Input
              label={t('contact.email')}
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('contact.emailPlaceholder')}
              value={fields.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label={t('contact.company')}
              id="contact-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={t('contact.companyPlaceholder')}
              value={fields.company}
              onChange={handleChange}
            />

            <Input
              as="textarea"
              label={t('contact.message')}
              id="contact-message"
              name="message"
              rows={5}
              placeholder={t('contact.messagePlaceholder')}
              value={fields.message}
              onChange={handleChange}
              error={errors.message}
              required
              className="resize-none"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? t('contact.sending') : t('contact.send')}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
