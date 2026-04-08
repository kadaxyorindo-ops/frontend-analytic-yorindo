import type { Dispatch, SetStateAction } from "react";
import { BarChart3, ClipboardList, Info, Menu, MessageSquareText } from "lucide-react";
import { useLocation } from "react-router-dom";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

type MenuItem = {
  name: string;
  hash: string;
  icon: typeof Info;
  isDefault?: boolean;
};

const menu: MenuItem[] = [
  { name: "Event Detail", hash: "#event-detail", icon: Info, isDefault: true },
  { name: "Event Analytics", hash: "#event-analytics", icon: BarChart3 },
  { name: "Survei Analytics", hash: "#survey-analytics", icon: ClipboardList },
  { name: "Feedback Analytics", hash: "#feedback-analytics", icon: MessageSquareText },
];

const EventSidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
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
            <div
              className={`mb-8 flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed ? (
                <div className="space-y-1 px-2">
                  <p className="text-[1.1rem] font-extrabold tracking-[-0.04em] text-[#0A2647]">
                    Event Workspace
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
                    Detail & Analytics
                  </p>
                </div>
              ) : null}

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
                const isActive =
                  activeHash === item.hash ||
                  (!!item.isDefault && (activeHash === "" || activeHash === "#"));

                return (
                  <a
                    key={item.name}
                    href={item.hash}
                    className={`flex w-full items-center rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      collapsed ? "justify-center px-0" : "gap-3"
                    } ${
                      isActive
                        ? "border-[#DDE6FF] bg-white text-[#0A2647] shadow-[0_10px_20px_rgba(10,38,71,0.07)]"
                        : "border-transparent text-[#5B6B7F] hover:border-[#E4EBF7] hover:bg-white hover:text-[#0A2647]"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={isActive ? "text-[#2F5BFF]" : "text-[#7B8CA3]"}
                    />
                    {!collapsed ? <span>{item.name}</span> : null}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default EventSidebar;

