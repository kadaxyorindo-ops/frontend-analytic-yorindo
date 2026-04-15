import { Link } from "react-router-dom"
import { CalendarDays, FileText, MapPin, PencilLine, SquarePen } from "lucide-react"
import type { Event } from "@/types/event"
import { formatDate, formatNumber, truncateText } from "@/utils/formatters"

type Props = {
  event: Event
}

const statusClasses: Record<Event["status"], string> = {
  draft: "bg-warning/10 text-warning",
  published: "bg-success/10 text-success",
  closed: "bg-danger/10 text-danger",
  ongoing: "bg-secondary/10 text-secondary",
}

const EventCard = ({ event }: Props) => {
  return (
    <div className="card flex h-full flex-col justify-between hover:scale-[1.02]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{event.title}</h2>
            <p className="mt-2 text-sm text-neutral-500">
              {truncateText(event.description, 110)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[event.status]}`}>
            {event.status}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-secondary" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-secondary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-secondary" />
            <span>
              {formatNumber(event.registered_count)} / {formatNumber(event.max_capacity)} registrants
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Link to={`/events/edit/${event.event_id}`} className="inline-flex">
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-button border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white">
            <PencilLine size={16} />
            Edit
          </span>
        </Link>
        <Link to={`/events/${event.event_id}/registration-form`} className="inline-flex">
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-light">
            <SquarePen size={16} />
            Manage
          </span>
        </Link>
      </div>
    </div>
  )
}

export default EventCard
