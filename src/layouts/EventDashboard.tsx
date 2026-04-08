import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import EventSidebar from "@/components/ui/EventSidebar";

type EventDashboardProps = {
  children?: ReactNode;
};

const EventDashboard = ({ children }: EventDashboardProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <EventSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-24" : "ml-[288px]"
        }`}
      >
        <Navbar />
        <main className="px-6 py-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default EventDashboard;

