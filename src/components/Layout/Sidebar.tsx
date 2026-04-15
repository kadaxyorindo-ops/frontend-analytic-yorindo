import { Calendar, LayoutDashboard, LogOut, User, ClipboardList } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
type SidebarUser = {
  name: string
  email: string
  role: "super_admin" | "exhibitor" | string
  company_name?: string
}


type MenuItem = {
  path: string
  icon: LucideIcon
  label: string
  roles: Array<"super_admin" | "exhibitor">
}

interface SidebarProps {
  isOpen: boolean
  user: SidebarUser | null
  onLogout: () => void
}

const menuItems: MenuItem[] = [
  { path: "/events", icon: Calendar, label: "Events", roles: ["super_admin", "exhibitor"] },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["super_admin"] },
]

const Sidebar = ({ isOpen, user, onLogout }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

  const normalizedRole =
    user?.role === "super_admin" || user?.role === "exhibitor"
      ? user.role
      : "exhibitor"

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes((user?.role as "super_admin" | "exhibitor" | undefined) ?? "exhibitor")
  )

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh min-h-dvh w-72 flex-col border-r border-[#E5EAF3] bg-[#F6F8FC] text-[#5E6A7D] transition-transform duration-300 lg:sticky lg:top-0 lg:min-h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-6 pb-4 pt-7">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-primary">
              Yorindo EMS
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9AA5B5]">
              {normalizedRole === "super_admin"
                ? "Super Admin Panel"
                : "Exhibition Management"}
            </p>
            <p className="mt-2 text-sm text-[#7A8799]">
              {normalizedRole === "super_admin" ? user?.name : user?.company_name}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 px-4 py-4">
        {filteredItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition ${
                isActive(item.path)
                  ? "border-[#E4EBF7] bg-white text-[#2F5BFF] shadow-[0_8px_18px_rgba(47,91,255,0.08)]"
                  : "border-transparent bg-transparent text-[#4F5D73] hover:border-[#E4EBF7] hover:bg-white hover:text-[#0A2647]"
              }`}
            >
              <Icon size={18} className={isActive(item.path) ? "text-[#2F5BFF]" : ""} />
              <span>{item.label}</span>
            </button>
          )
        })}

        <div className="pt-4">
          <div className="rounded-2xl border border-[#E2E8F3] bg-white p-4 text-sm text-[#6D7788] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ClipboardList size={16} />
              <span className="font-medium">Quick Access</span>
            </div>
            <p>Kelola registration form, survey, dan analytics dari setiap event.</p>
          </div>
        </div>
      </nav>

      <div className="mt-auto px-4 py-5">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#DCE5F2] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary">{user?.name}</p>
              <p className="truncate text-xs text-[#7A8799]">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#0A2647] bg-[#0A2647] px-4 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(10,38,71,0.18)] transition hover:bg-[#133A6F] hover:text-white"
          title="Logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
