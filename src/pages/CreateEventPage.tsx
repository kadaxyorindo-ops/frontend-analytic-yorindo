import { useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import { useAuth } from "@/hooks/useAuth"
import { createEventRemote } from "@/store/eventSlice"
import type { AppDispatch } from "@/store/store"
import type { CreateEventDTO, Event } from "@/types/event"

const CreateEventPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState<CreateEventDTO>({
    title: "",
    description: "",
    event_date: "",
    location: "",
    status: "draft",
    max_capacity: 100,
  })

  const handleChange = <K extends keyof CreateEventDTO>(
    key: K,
    value: CreateEventDTO[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated) return

    const result = await dispatch(
      createEventRemote({
        title: form.title,
        description: form.description || null,
        eventDate: form.event_date,
        location: form.location || null,
        category: "General",
        industry: { refId: null, name: "General" },
        registrationForm: { fields: [] },
      })
    )

    if (createEventRemote.rejected.match(result)) return
    navigate("/events")
  }

  return (
    <MainLayout title="Create Event" subtitle="Buat event baru untuk workflow EMS Anda.">
      <div className="mx-auto max-w-4xl">
        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Judul Event</label>
              <input
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Contoh: Health Innovation Summit 2026"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Deskripsi</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Tanggal Event</label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={(event) => handleChange("event_date", event.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Lokasi</label>
              <input
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">Status</label>
              <select
                value={form.status}
                onChange={(event) =>
                  handleChange("status", event.target.value as Event["status"])
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
                onChange={(event) =>
                  handleChange("max_capacity", Number(event.target.value))
                }
                className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
            <Button type="submit">Simpan Event</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/events")}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default CreateEventPage
