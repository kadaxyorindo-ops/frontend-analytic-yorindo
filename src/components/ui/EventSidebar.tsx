import type { Dispatch, SetStateAction } from "react";
import {
  BarChart3,
  ClipboardList,
  Info,
  Menu,
  MessageSquareText,
  Users,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

type SidebarProps = {
  eventId: string;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

type MenuItem = {
  name: string;
  to: string;
  icon: typeof Info;
};

const EventSidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { eventId } = useParams<{ eventId: string }>();
  const resolvedEventId = eventId ?? "unknown";

  const menu: MenuItem[] = [
    { name: "Event Detail", to: `/events/${resolvedEventId}`, icon: Info },
    { name: "Participants", to: `/events/${resolvedEventId}/participants`, icon: Users },
    { name: "Event Analytics", to: `/events/${resolvedEventId}/analytics`, icon: BarChart3 },
    { name: "Survei Analytics", to: `/events/${resolvedEventId}/survey-analytics`, icon: ClipboardList },
    { name: "Feedback Analytics", to: `/events/${resolvedEventId}/feedback-analytics`, icon: MessageSquareText },
  ];

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

            {!collapsed ? (
              <nav className="space-y-2">
                {menu.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "border-[#DDE6FF] bg-white text-[#0A2647] shadow-[0_10px_20px_rgba(10,38,71,0.07)]"
                          : "border-transparent text-[#5B6B7F] hover:border-[#E4EBF7] hover:bg-white hover:text-[#0A2647]"
                      }`
                    }
                    end={item.name === "Event Detail"}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={18}
                          className={isActive ? "text-[#2F5BFF]" : "text-[#7B8CA3]"}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
