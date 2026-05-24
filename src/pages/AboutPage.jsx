import { useTranslation } from 'react-i18next'
import {
  Gauge,
  Accessibility,
  Languages,
  Wrench,
  FlaskConical,
  Monitor,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'

const VALUE_ICONS = {
  performance: Gauge,
  a11y: Accessibility,
  i18n: Languages,
  maintainability: Wrench,
  testing: FlaskConical,
  ux: Monitor,
}

const VALUE_KEYS = Object.keys(VALUE_ICONS)

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <main className="page-container py-10 space-y-12">
      {/* Intro */}
      <section className="max-w-2xl space-y-3">
        <h1 className="section-title text-3xl">{t('about.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('about.intro')}
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('about.purpose')}
        </p>
      </section>

      {/* Stack técnico */}
      <section aria-labelledby="stack-title">
        <h2 id="stack-title" className="section-title mb-3">
          {t('about.stack')}
        </h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
            {t('about.stackItems')}
          </p>
        </div>
      </section>

      {/* Principios técnicos */}
      <section aria-labelledby="values-title">
        <h2 id="values-title" className="section-title mb-6">
          {t('about.values.title')}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUE_KEYS.map((key) => {
            const Icon = VALUE_ICONS[key]
            return (
              <div
                key={key}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-medium text-slate-800 dark:text-slate-100">
                    {t(`about.values.${key}.title`)}
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(`about.values.${key}.desc`)}
                  </dd>
                </div>
              </div>
            )
          })}
        </dl>
      </section>

      {/* Badge version */}
      <section className="flex items-center gap-2 pt-2">
        <Badge variant="primary">v1.0.0</Badge>
        <Badge variant="success">React 18</Badge>
        <Badge variant="default">Vite 5</Badge>
        <Badge variant="default">Tailwind 3</Badge>
      </section>
    </main>
  )
}
