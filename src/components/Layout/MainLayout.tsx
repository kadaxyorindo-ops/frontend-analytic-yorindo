import { useState, type PropsWithChildren } from "react"
import { Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import Sidebar from "./Sidebar"

type MainLayoutProps = PropsWithChildren<{
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}>

const MainLayout = ({ children, title, subtitle, actions }: MainLayoutProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} user={user} onLogout={handleLogout} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen((value) => !value)}
                  className="rounded-button border border-neutral-200 p-2 text-neutral-700 transition hover:bg-neutral-100 lg:hidden"
                >
                  {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <div>
                  {title ? <h1>{title}</h1> : null}
                  {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
                </div>
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>

      {isSidebarOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default MainLayout
