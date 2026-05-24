import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Settings,
  BarChart2,
  Plug,
  Zap,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const FEATURE_ICONS = [
  { key: 'ops', Icon: Settings, color: 'text-indigo-500' },
  { key: 'reports', Icon: BarChart2, color: 'text-emerald-500' },
  { key: 'integrations', Icon: Plug, color: 'text-amber-500' },
  { key: 'automation', Icon: Zap, color: 'text-blue-500' },
]

const STATS = [
  { key: 'modules', value: '12', badge: 'success' },
  { key: 'uptime', value: '99.9 %', badge: 'primary' },
  { key: 'integrations', value: '8', badge: 'default' },
  { key: 'users', value: '340', badge: 'default' },
]

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="page-container py-10 space-y-12">
      {/* Encabezado */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 max-w-xl">
          <Badge variant="primary" className="mb-1">Demo</Badge>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {t('home.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button as={Link} to="/servicios" variant="primary" size="lg">
            {t('home.cta')}
          </Button>
        </div>
      </section>

      {/* Métricas */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="section-title mb-4">
          {t('home.stats.title')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ key, value, badge }) => (
            <div
              key={key}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t(`home.stats.${key}`)}
                </span>
                <Badge variant={badge}><TrendingUp className="h-3 w-3" /></Badge>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section aria-labelledby="features-title">
        <h2 id="features-title" className="section-title mb-1">
          {t('home.features.title')}
        </h2>
        <p className="section-subtitle mb-6 flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          {t('home.subtitle')}
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ICONS.map(({ key, Icon, color }) => (
            <Card key={key}>
              <Card.Body className="flex flex-col gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 ${color}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">
                    {t(`home.features.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(`home.features.${key}.desc`)}
                  </p>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
