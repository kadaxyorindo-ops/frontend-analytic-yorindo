import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";

type MainDashboardProps = {
  children?: ReactNode;
};

const MainDashboard = ({ children }: MainDashboardProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((value) => !value);
      return;
    }

    setCollapsed((value) => !value);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-24" : "lg:ml-[288px]"
        }`}
      >
        <Navbar onToggleSidebar={handleSidebarToggle} />
        <main className="px-6 py-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default MainDashboard;
