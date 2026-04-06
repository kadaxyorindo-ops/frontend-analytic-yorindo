import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Exhibitors", path: "/exhibitors", icon: Users },
    { name: "Attendees", path: "/attendees", icon: Users },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300
      ${collapsed ? "w-20" : "w-48"}`}
    >
      {/* WRAPPER */}
      <div className="h-full p-3 bg-[#F3F4F6]">
        <div
          className="h-full flex flex-col justify-between
          rounded-[24px]
          border border-[#D7E1F0]
          bg-[#F3F4F6]
          shadow-[0_12px_32px_rgba(10,38,71,0.08)]
          p-4"
        >
          {/* TOP */}
          <div>
            {/* LOGO + TOGGLE */}
            <div
              className={`flex items-center mb-6 ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed && (
                <h1 className="text-lg font-semibold text-[#0A2647]">
                  YORINDO EMS
                </h1>
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-[10px] bg-[#DCE7FF] hover:bg-[#c7d7ff] transition"
              >
                <Menu size={20} className="text-[#0A2647]" />
              </button>
            </div>

            {/* MENU */}
            <div className="flex flex-col gap-2">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path + "/"));

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center w-full ${
                      collapsed ? "justify-center px-0" : "gap-3 px-3"
                    } py-2 rounded-[12px] transition
                    ${
                      isActive
                        ? "bg-[#0A2647] text-white shadow-[0_6px_16px_rgba(10,38,71,0.2)]"
                        : "text-[#5B6B7F] hover:bg-[#DCE7FF] hover:text-[#0A2647]"
                    }`}
                  >
                    <Icon size={18} />

                    {!collapsed && (
                      <span className="text-sm">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex flex-col gap-3">
            <button
              className={`${
                collapsed ? "px-0" : "px-3"
              } bg-[#0A2647] text-white py-2 rounded-[12px] text-sm font-medium 
              hover:bg-[#133A6F] transition shadow-[0_6px_16px_rgba(10,38,71,0.2)]`}
            >
              {collapsed ? "+" : "New Event"}
            </button>

            {!collapsed && (
              <>
                <div className="text-sm text-[#7B8CA3] hover:text-[#0A2647] cursor-pointer transition">
                  Support
                </div>

                <div className="text-sm text-[#FF4D4F] hover:text-[#D9363E] cursor-pointer transition">
                  Logout
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
