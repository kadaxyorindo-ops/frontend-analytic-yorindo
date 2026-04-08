import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Headset,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type SidebarItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
};

interface WorkspaceSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
  eyebrow: string;
  title: string;
  items: SidebarItem[];
  supportLabel?: string;
}

export default function WorkspaceSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  eyebrow,
  title,
  items,
  supportLabel = "Support",
}: WorkspaceSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const roleLabel =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "event_operator"
        ? "Event Operator"
        : user?.role === "communication_operator"
          ? "Communication Operator"
          : user?.role === "survey_analyst"
            ? "Survey Analyst"
            : "EMS Staff";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#0A2647]/18 backdrop-blur-[1px] transition-opacity lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-24" : "lg:w-[288px]"}`}
      >
        <div className="h-full bg-[#F5F7FB] px-3 py-3">
          <div
            className={`flex h-full w-[288px] max-w-[85vw] flex-col rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-4 shadow-[0_14px_30px_rgba(10,38,71,0.08)] transition-[width] duration-300 lg:max-w-none ${
              collapsed ? "lg:w-24" : "lg:w-[288px]"
            }`}
          >
            <div className={`mb-8 flex items-center ${collapsed ? "lg:justify-center" : "justify-between"}`}>
              {!collapsed ? (
                <div className="space-y-1 px-2">
                  <p className="text-[1.1rem] font-extrabold tracking-[-0.04em] text-[#0A2647]">
                    {title}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
                    {eyebrow}
                  </p>
                </div>
              ) : (
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2647] text-base font-bold text-white shadow-[0_10px_22px_rgba(10,38,71,0.18)] lg:flex">
                  Y
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileOpen(false);
                    return;
                  }

                  setCollapsed((value) => !value);
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D7E1F0] bg-[#E7EEFF] text-[#0A2647] transition hover:bg-[#D9E4FF]"
                title="Toggle sidebar"
              >
                <span className="lg:hidden">
                  <X size={18} />
                </span>
                <span className="hidden lg:inline">
                  {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </span>
              </button>
            </div>

            <nav className="space-y-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl border py-3 text-sm font-semibold transition ${
                      collapsed ? "w-full justify-center px-0" : "gap-3 px-4"
                    } ${
                      isActive
                        ? "border-[#DDE6FF] bg-white text-[#0A2647] shadow-[0_10px_20px_rgba(10,38,71,0.07)]"
                        : "border-transparent text-[#5B6B7F] hover:border-[#E4EBF7] hover:bg-white hover:text-[#0A2647]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        className={isActive ? "text-[#2F5BFF]" : "text-[#7B8CA3]"}
                      />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto space-y-3">
              <button
                type="button"
                className={`flex w-full items-center rounded-2xl border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-medium text-[#43556E] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-[#C9D7F3] hover:text-[#0A2647] ${
                  collapsed ? "justify-center px-0" : "gap-3"
                }`}
              >
                <Headset size={18} className="text-[#55708E]" />
                {!collapsed ? <span>{supportLabel}</span> : null}
              </button>

              {!collapsed ? (
                <div className="rounded-2xl border border-[#DCE5F2] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                  <p className="truncate text-sm font-semibold text-[#0A2647]">
                    {user?.name ?? "Guest"}
                  </p>
                  <p className="truncate text-xs text-[#6F8098]">{roleLabel}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className={`flex w-full items-center justify-center rounded-2xl border border-[#0A2647] bg-[#0A2647] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(10,38,71,0.18)] transition hover:bg-[#133A6F] ${
                  collapsed ? "px-0" : "gap-3"
                }`}
              >
                <LogOut size={18} />
                {!collapsed ? <span>Logout</span> : null}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
