import { useTranslation } from 'react-i18next'
import {
  Settings,
  BarChart2,
  Plug,
  Zap,
  LifeBuoy,
  SlidersHorizontal,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const SERVICES = [
  { key: 'ops', Icon: Settings, badge: 'primary' },
  { key: 'reports', Icon: BarChart2, badge: 'success' },
  { key: 'integrations', Icon: Plug, badge: 'warning' },
  { key: 'automation', Icon: Zap, badge: 'primary' },
  { key: 'support', Icon: LifeBuoy, badge: 'default' },
  { key: 'config', Icon: SlidersHorizontal, badge: 'default' },
]

export default function ServicesPage() {
  const { t } = useTranslation()

  return (
    <main className="page-container py-10">
      <div className="mb-8">
        <h1 className="section-title text-3xl">{t('services.title')}</h1>
        <p className="section-subtitle mt-1">{t('services.subtitle')}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ key, Icon, badge }) => (
          <Card key={key} className="group hover:shadow-md transition-shadow duration-200">
            <Card.Body className="flex flex-col gap-4 h-full">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge variant={badge}>
                  {t(`services.${key}.title`)}
                </Badge>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  {t(`services.${key}.title`)}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`services.${key}.desc`)}
                </p>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </main>
  )
}
