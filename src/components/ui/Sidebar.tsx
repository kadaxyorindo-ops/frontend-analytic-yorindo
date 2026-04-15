import type { Dispatch, SetStateAction } from "react";
import { CalendarDays, LayoutDashboard } from "lucide-react";
import WorkspaceSidebar from "@/components/ui/WorkspaceSidebar";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Sidebar(props: SidebarProps) {
  return (
    <WorkspaceSidebar
      {...props}
      title="Yorindo EMS"
      eyebrow="Exhibition Management"
      items={[
        {
          label: "Dashboard",
          to: "/dashboard",
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: "Event",
          to: "/events",
          icon: CalendarDays,
          end: true,
        },
      ]}
    />
  );
}
