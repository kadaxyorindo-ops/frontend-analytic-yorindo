import type { Dispatch, SetStateAction } from "react";
import {
  BarChart3,
  ClipboardList,
  Info,
  MessageSquareText,
  Users,
} from "lucide-react";
import WorkspaceSidebar from "@/components/ui/WorkspaceSidebar";

type SidebarProps = {
  eventId: string;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

export default function EventSidebar({
  eventId,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const resolvedEventId = eventId || "unknown";

  return (
    <WorkspaceSidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      title="Event Workspace"
      eyebrow="Detail & Analytics"
      items={[
        {
          label: "Event Detail",
          to: `/events/${resolvedEventId}`,
          icon: Info,
          end: true,
        },
        {
          label: "Participants",
          to: `/events/${resolvedEventId}/participants`,
          icon: Users,
        },
        {
          label: "Event Analytics",
          to: `/events/${resolvedEventId}/analytics`,
          icon: BarChart3,
        },
        {
          label: "Survey Analytics",
          to: `/events/${resolvedEventId}/survey-analytics`,
          icon: ClipboardList,
        },
        {
          label: "Feedback Analytics",
          to: `/events/${resolvedEventId}/feedback-analytics`,
          icon: MessageSquareText,
        },
      ]}
    />
  );
}
