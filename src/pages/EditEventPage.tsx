import { useEffect, useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import { useEvents } from "@/hooks/useEvents"
import { updateEvent } from "@/store/eventSlice"
import type { Event, UpdateEventDTO } from "@/types/event"

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { events } = useEvents()
  const event = events.find((item) => item.event_id === id)
  const [form, setForm] = useState<UpdateEventDTO>({
    title: "",
    description: "",
    event_date: "",
    location: "",
    status: "draft",
    max_capacity: 0,
  })

  useEffect(() => {
    if (!event) return
    setForm({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      location: event.location,
      status: event.status,
      max_capacity: event.max_capacity,
    })
  }, [event])

  const handleChange = <K extends keyof UpdateEventDTO>(
    key: K,
    value: UpdateEventDTO[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (eventForm: FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault()
    if (!id) return
    dispatch(updateEvent({ event_id: id, updates: form }))
    navigate("/events")
  }

  if (!event) {
    return (
      <MainLayout title="Edit Event">
        <div className="card py-16 text-center">
          <p className="text-lg font-semibold text-neutral-900">Event tidak ditemukan</p>
          <Button className="mt-4" onClick={() => navigate("/events")}>
            Kembali ke Events
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Edit Event" subtitle={`Perbarui detail untuk ${event.title}.`}>
      <div className="mx-auto max-w-4xl">
        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Judul Event</label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Deskripsi</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Tanggal Event</label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => handleChange("event_date", e.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Lokasi</label>
              <input
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as Event["status"])
                }
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Max Capacity</label>
              <input
                type="number"
                min={1}
                value={form.max_capacity}
                onChange={(e) => handleChange("max_capacity", Number(e.target.value))}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
            <Button type="submit">Update Event</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/events")}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default EditEventPage
