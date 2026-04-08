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
  ...props
}: SidebarProps) {
  return (
    <WorkspaceSidebar
      {...props}
      title="Event Workspace"
      eyebrow="Detail & Analytics"
      items={[
        {
          label: "Event Detail",
          to: `/events/${eventId}`,
          icon: Info,
          end: true,
        },
        {
          label: "Event Analytics",
          to: `/events/${eventId}/event-analytics`,
          icon: BarChart3,
        },
        {
          label: "Survey Analytics",
          to: `/events/${eventId}/survey-analytics`,
          icon: ClipboardList,
        },
        {
          label: "Feedback Analytics",
          to: `/events/${eventId}/feedback-analytics`,
          icon: MessageSquareText,
        },
        {
          label: "Participants",
          to: `/events/${eventId}/participants`,
          icon: Users,
        },
      ]}
    />
  );
}
