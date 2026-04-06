import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarRange, Filter, Search } from "lucide-react"
import MainLayout from "@/components/Layout/MainLayout"
import EventCard from "@/components/EventCard"
import Button from "@/components/Button"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import type { Event } from "@/types/event"

const EventListPage = () => {
  const { user } = useAuth()
  const { events } = useEvents()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Event["status"]>("all")

  const filteredEvents = useMemo(() => {
    const visibleEvents =
      user?.role === "super_admin"
        ? events
        : events.filter((event) => event.exhibitor_id === user?.exhibitor_id)

    return visibleEvents.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || event.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [events, search, statusFilter, user])

  return (
    <MainLayout
      title="Event Management"
      subtitle={
        user?.role === "super_admin"
          ? "Lihat dan kelola seluruh event Yorindo."
          : "Kelola event milik exhibitor Anda."
      }
      actions={
        <Link to="/events/create">
          <Button>Buat Event</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="card flex items-center gap-3">
            <Search size={18} className="text-neutral-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari berdasarkan judul atau lokasi event"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="card flex items-center gap-3">
            <Filter size={18} className="text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | Event["status"])
              }
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="card bg-primary text-white">
            <div className="flex items-center gap-3">
              <CalendarRange size={20} className="text-secondary" />
              <div>
                <p className="text-sm text-white/70">Visible Events</p>
                <p className="metrics-number text-white">{filteredEvents.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Published Events</p>
            <p className="metrics-number">
              {filteredEvents.filter((event) => event.status === "published").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Draft Events</p>
            <p className="metrics-number">
              {filteredEvents.filter((event) => event.status === "draft").length}
            </p>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-lg font-semibold text-neutral-900">Belum ada event ditemukan</p>
            <p className="mt-2 text-sm text-neutral-500">
              Coba ubah filter atau buat event baru untuk mulai.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default EventListPage
