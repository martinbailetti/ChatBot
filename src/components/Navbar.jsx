import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Sun, Moon, Globe, ChevronDown, LogIn, LogOut, Users, MessageSquare, FileText, Upload, HelpCircle, MessagesSquare, Settings, Server, Database } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useLanguage } from '@/hooks/useLanguage'
import useAppStore from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

const PUBLIC_NAV_LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.services', to: '/servicios' },
  { key: 'nav.about', to: '/acerca-de' },
  { key: 'nav.contact', to: '/contacto' },
]

const DEFAULT_AUTH_NAV_LINKS = [
  { key: 'nav.chat', to: '/chat', icon: MessageSquare },
]

const ADMIN_NAV_LINKS = [
  { key: 'nav.chat', to: '/chat', icon: MessageSquare },
  {
    key: 'nav.chatbot_menu',
    dropdown: true,
    icon: MessagesSquare,
    items: [
      { key: 'nav.conversations', to: '/conversaciones', icon: MessageSquare },
      { key: 'nav.messages',      to: '/mensajes',       icon: MessageSquare },
    ],
  },
  {
    key: 'nav.documents_menu',
    dropdown: true,
    icon: FileText,
    items: [
      { key: 'nav.documents_list', to: '/documentos', icon: FileText },
      { key: 'nav.ingestion',      to: '/ingestion',  icon: Upload   },
      { key: 'nav.faqs',           to: '/faqs',       icon: HelpCircle },
    ],
  },
  {
    label: 'Ajustes',
    dropdown: true,
    icon: Settings,
    items: [
      { label: 'RAG Server', to: '/ajustes/rag-server', icon: Server },
      { label: 'API Server', to: '/ajustes/api-server', icon: Database },
    ],
  },
  { key: 'users.title', to: '/usuarios', icon: Users },
]

function NavDropdown({ label, icon: Icon, items, linkClass }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors duration-150',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
        )}
      >
        {Icon && <Icon className="mr-1 h-4 w-4" aria-hidden="true" />}
        {label}
        <ChevronDown className={cn('h-3 w-3 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-1 min-w-[12rem] rounded-md border border-slate-200 bg-white py-1 shadow-md dark:border-slate-700 dark:bg-slate-800">
          {items.map(({ key, to, icon: ItemIcon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium w-full',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                )
              }
            >
              {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              {key ?? label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function LangSelector() {
  const { t } = useTranslation()
  const { currentLang, changeLanguage, supportedLangs } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
        )}
        title={t('nav.toggleDark')}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{currentLang}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Idioma"
          className={cn(
            'absolute right-0 z-50 mt-1 min-w-[8rem] rounded-md border',
            'border-slate-200 bg-white py-1 shadow-md',
            'dark:border-slate-700 dark:bg-slate-800'
          )}
        >
          {supportedLangs.map((lang) => (
            <li key={lang} role="option" aria-selected={currentLang === lang}>
              <button
                onClick={() => {
                  changeLanguage(lang)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm',
                  'hover:bg-slate-100 dark:hover:bg-slate-700',
                  currentLang === lang
                    ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                {t(`lang.${lang}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DarkModeButton() {
  const { t } = useTranslation()
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={t('nav.toggleDark')}
      title={t('nav.toggleDark')}
      className={cn(
        'rounded-md p-1.5',
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      )}
    >
      {darkMode ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}

function MobileAuthSection() {
  const { t } = useTranslation()
  const { isAuthenticated, user, logout } = useAuth()

  const mobileBtn = cn(
    'flex w-full items-center gap-2 rounded-md px-4 py-3 text-sm font-medium',
    'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
  )

  if (isAuthenticated) {
    const displayName = user?.first_name ?? user?.email ?? t('auth.user')
    return (
      <div className="flex flex-col gap-1">
        <Link
          to="/perfil"
          className={cn(
            mobileBtn,
            'text-slate-700 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
          )}
        >
          {displayName}
        </Link>
        <button
          onClick={logout}
          className={cn(
            mobileBtn,
            'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950'
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('auth.logout')}
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/login"
      className={cn(
        mobileBtn,
        'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950'
      )}
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      {t('auth.login')}
    </Link>
  )
}

function AuthSection() {
  const { t } = useTranslation()
  const { isAuthenticated, user, logout } = useAuth()

  if (isAuthenticated) {
    const displayName = user?.first_name ?? user?.email ?? t('auth.user')
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/perfil"
          className={cn(
            'text-sm font-medium max-w-[10rem] truncate',
            'text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400',
            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded'
          )}
        >
          {displayName}
        </Link>
        <button
          onClick={logout}
          title={t('auth.logout')}
          aria-label={t('auth.logout')}
          className={cn(
            'rounded-md p-1.5',
            'text-slate-600 hover:bg-red-50 hover:text-red-600',
            'dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400',
            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/login"
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
        'bg-indigo-600 text-white hover:bg-indigo-700',
        'dark:bg-indigo-500 dark:hover:bg-indigo-600',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      )}
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      {t('auth.login')}
    </Link>
  )
}

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useAppStore()
  const { isAuthenticated, isAdmin } = useAuth()

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  const navLinks = isAuthenticated
    ? (isAdmin ? ADMIN_NAV_LINKS : DEFAULT_AUTH_NAV_LINKS)
    : PUBLIC_NAV_LINKS

  const linkClass = ({ isActive }) =>
    cn(
      'text-sm font-medium px-3 py-2 rounded-md transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
    )

  const mobileLinkClass = ({ isActive }) =>
    cn(
      'block px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <nav
        className="page-container flex h-14 items-center justify-between"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
          aria-label="Chatbot Demo — Inicio"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold select-none">
            N
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Chatbot<span className="font-normal text-slate-400 dark:text-slate-500"> Demo</span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((item) =>
            item.dropdown ? (
              <NavDropdown
                key={item.key ?? item.label}
                label={item.label ?? t(item.key)}
                icon={item.icon}
                items={(item.items ?? []).map((subItem) => ({
                  ...subItem,
                  key: subItem.label ?? t(subItem.key),
                }))}
                linkClass={linkClass}
              />
            ) : (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.icon && <item.icon className="mr-1.5 inline h-4 w-4" aria-hidden="true" />}
                {t(item.key)}
              </NavLink>
            )
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex md:items-center md:gap-1">
          <LangSelector />
          <DarkModeButton />
          <div className="ml-2 border-l border-slate-200 pl-2 dark:border-slate-700">
            <AuthSection />
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <LangSelector />
          <DarkModeButton />
          <button
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className={cn(
              'rounded-md p-1.5',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
            )}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900 md:hidden"
        >
          <nav aria-label="Navegación móvil" className="flex flex-col gap-1 py-2">
            {navLinks.map((item) =>
              item.dropdown ? (
                <div key={item.key ?? item.label}>
                  <span className="block px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {item.label ?? t(item.key)}
                  </span>
                  {item.items.map(({ key, label, to, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={mobileLinkClass}
                      end={to === '/'}
                    >
                      {Icon && <Icon className="mr-2 inline h-4 w-4" aria-hidden="true" />}
                      {label ?? t(key)}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={mobileLinkClass}
                  end={item.to === '/'}
                >
                  {item.icon && <item.icon className="mr-2 inline h-4 w-4" aria-hidden="true" />}
                  {t(item.key)}
                </NavLink>
              )
            )}
          </nav>
          <div className="border-t border-slate-100 py-2 dark:border-slate-800">
            <MobileAuthSection />
          </div>
        </div>
      )}
    </header>
  )
}
