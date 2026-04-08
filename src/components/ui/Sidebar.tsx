import type { Dispatch, SetStateAction } from "react";
import {
  Calendar,
  Headset,
  LogOut,
  Menu,
  LineChart,
  MessageSquareText,
  ClipboardList,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

type MenuItem = {
  name: string;
  path?: string;
  hash?: string;
  icon: typeof Calendar;
};

const menu: MenuItem[] = [
  { name: "Event", path: "/events", icon: Calendar },
  { name: "Survey Analytics", hash: "#survey-analytics", icon: ClipboardList },
  { name: "Event Analytics", hash: "#event-analytics", icon: LineChart },
  { name: "Feedback Analytics", hash: "#feedback-analytics", icon: MessageSquareText },
];

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const activeHash = location.hash;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        collapsed ? "w-24" : "w-[288px]"
      }`}
    >
      <div className="h-full bg-[#F5F7FB] px-3 py-3">
        <div className="flex h-full flex-col rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-4 shadow-[0_14px_30px_rgba(10,38,71,0.08)]">
          <div>
            <div className={`mb-8 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              {collapsed ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2647] text-sm font-bold text-white shadow-[0_10px_22px_rgba(10,38,71,0.18)]">
                  Y
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  <p className="text-[1.1rem] font-extrabold tracking-[-0.04em] text-[#0A2647]">Yorindo EMS</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
                    Exhibition Management
                  </p>
                </div>
              )}

              <button
                onClick={() => setCollapsed((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D7E1F0] bg-[#E7EEFF] text-[#0A2647] transition hover:bg-[#D9E4FF]"
                title="Toggle sidebar"
                type="button"
              >
                <Menu size={18} />
              </button>
            </div>

            <nav className="space-y-2">
              {menu.map((item) => {
                const isActive = item.path
                  ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  : activeHash === item.hash;

                const classes = `flex w-full items-center rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  collapsed ? "justify-center px-0" : "gap-3"
                } ${
                  isActive
                    ? "border-[#DDE6FF] bg-white text-[#0A2647] shadow-[0_10px_20px_rgba(10,38,71,0.07)]"
                    : "border-transparent text-[#5B6B7F] hover:border-[#E4EBF7] hover:bg-white hover:text-[#0A2647]"
                }`;

                const content = (
                  <>
                    <item.icon size={18} className={isActive ? "text-[#2F5BFF]" : "text-[#7B8CA3]"} />
                    {!collapsed ? <span>{item.name}</span> : null}
                  </>
                );

                return item.path ? (
                  <Link key={item.name} to={item.path} className={classes}>
                    {content}
                  </Link>
                ) : (
                  <a key={item.name} href={item.hash} className={classes}>
                    {content}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-3">
            <button
              type="button"
              className={`flex w-full items-center rounded-2xl border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-medium text-[#43556E] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-[#C9D7F3] hover:text-[#0A2647] ${
                collapsed ? "justify-center px-0" : "gap-3"
              }`}
            >
              <Headset size={18} className="text-[#55708E]" />
              {!collapsed ? <span>Support</span> : null}
            </button>

            {!collapsed ? (
              <div className="rounded-2xl border border-[#DCE5F2] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                <p className="truncate text-sm font-semibold text-[#0A2647]">{user?.name ?? "Guest"}</p>
                <p className="truncate text-xs text-[#6F8098]">
                  {user?.role === "super_admin"
                    ? "Super Admin"
                    : user?.role === "event_operator"
                      ? "Event Operator"
                      : user?.role === "communication_operator"
                        ? "Communication Operator"
                        : user?.role === "survey_analyst"
                          ? "Survey Analyst"
                          : "Visitor"}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={logout}
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
  );
};

export default Sidebar;
