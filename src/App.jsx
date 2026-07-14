import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import Spinner from '@/components/ui/Spinner'
import { useDarkMode } from '@/hooks/useDarkMode'

// Lazy-load páginas para code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const UsersPage    = lazy(() => import('@/pages/UsersPage'))
const ProfilePage  = lazy(() => import('@/pages/ProfilePage'))
const ChatPage     = lazy(() => import('@/pages/ChatPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ConversationsPage  = lazy(() => import('@/pages/ConversationsPage'))
const MessagesPage       = lazy(() => import('@/pages/MessagesPage'))
const DocumentsPage      = lazy(() => import('@/pages/DocumentsPage'))
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'))
const IngestionPage      = lazy(() => import('@/pages/IngestionPage'))
const FaqsPage           = lazy(() => import('@/pages/FaqsPage'))
const RagServerSettingsPage = lazy(() => import('@/pages/RagServerSettingsPage'))
const ApiServerSettingsPage = lazy(() => import('@/pages/ApiServerSettingsPage'))

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function Layout({ children }) {
  // Aplica modo oscuro al montar
  useDarkMode()
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/acerca-de" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/conversaciones" element={<ProtectedRoute adminOnly><ConversationsPage /></ProtectedRoute>} />
          <Route path="/mensajes"       element={<ProtectedRoute adminOnly><MessagesPage /></ProtectedRoute>} />
          <Route path="/documentos"     element={<ProtectedRoute adminOnly><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documentos/detalle" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/ingestion"      element={<ProtectedRoute adminOnly><IngestionPage /></ProtectedRoute>} />
          <Route path="/faqs"           element={<ProtectedRoute adminOnly><FaqsPage /></ProtectedRoute>} />
          <Route path="/ajustes/rag-server" element={<ProtectedRoute adminOnly><RagServerSettingsPage /></ProtectedRoute>} />
          <Route path="/ajustes/api-server" element={<ProtectedRoute adminOnly><ApiServerSettingsPage /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
