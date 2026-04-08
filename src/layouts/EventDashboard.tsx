import { useState, type ReactNode } from "react";
import { Outlet, useParams } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import EventSidebar from "@/components/ui/EventSidebar";

type EventDashboardProps = {
  children?: ReactNode;
};

const EventDashboard = ({ children }: EventDashboardProps) => {
  const { eventId = "" } = useParams<{ eventId: string }>();
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
      <EventSidebar
        eventId={eventId}
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
        <Navbar
          backTo={{ to: "/events", label: "Kembali ke daftar event" }}
          onToggleSidebar={handleSidebarToggle}
        />
        <main className="px-6 py-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default EventDashboard;

