import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BarChart3,
  Download,
  FileText,
  PieChart,
  Search,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import MainLayout from "@/components/Layout/MainLayout"
import Button from "@/components/Button"
import ParticipantDetailModal from "@/pages/ParticipantDetailModal"
import type { Participant } from "@/types/participant"
import type { RootState } from "@/store/store"
import { formatDate, formatNumber, formatShortDate } from "@/utils/formatters"

const registrationTrend = [
  { date: "2024-12-01", registrations: 45 },
  { date: "2024-12-02", registrations: 52 },
  { date: "2024-12-03", registrations: 38 },
  { date: "2024-12-04", registrations: 67 },
  { date: "2024-12-05", registrations: 89 },
  { date: "2024-12-06", registrations: 72 },
  { date: "2024-12-07", registrations: 54 },
]

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#0A2647", "#6B7280"]

const AnalyticsDashboardPage = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { events } = useSelector((state: RootState) => state.events)
  const { participants } = useSelector((state: RootState) => state.participants)
  const { responses } = useSelector((state: RootState) => state.surveyResponses)

  const [activeSection, setActiveSection] = useState<
    "overview" | "distribution" | "search" | "survey" | "export"
  >("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  const event = events.find((item) => item.event_id === eventId)
  const eventParticipants = participants.filter((participant) => participant.event_id === eventId)
  const eventResponses = responses.filter((response) => response.event_id === eventId)

  const metrics = useMemo(() => {
    const attendees = eventParticipants.filter((participant) => participant.is_attended).length
    const responseRate = eventParticipants.length
      ? Math.round((eventResponses.length / eventParticipants.length) * 100)
      : 0
    const attendanceRate = event?.registered_count
      ? ((attendees / event.registered_count) * 100).toFixed(1)
      : "0"

    return {
      invitations: event?.max_capacity ?? 0,
      registrations: event?.registered_count ?? 0,
      approved: event?.registered_count ?? 0,
      attendees,
      attendanceRate,
      responseRate,
    }
  }, [event, eventParticipants, eventResponses.length])

  const industryData = useMemo(() => {
    const counts = eventParticipants.reduce<Record<string, number>>((acc, participant) => {
      acc[participant.jenis_industri] = (acc[participant.jenis_industri] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [eventParticipants])

  const positionData = useMemo(() => {
    const counts = eventParticipants.reduce<Record<string, number>>((acc, participant) => {
      acc[participant.jabatan] = (acc[participant.jabatan] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [eventParticipants])

  const locationData = useMemo(() => {
    const counts = eventParticipants.reduce<Record<string, number>>((acc, participant) => {
      acc[participant.lokasi_perusahaan] =
        (acc[participant.lokasi_perusahaan] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [eventParticipants])

  const ratingData = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => ({
      name: `${star} Stars`,
      value: eventResponses.filter((response) => response.overall_rating === star).length,
    }))
  }, [eventResponses])

  const averageRating = eventResponses.length
    ? (
        eventResponses.reduce((total, response) => total + response.overall_rating, 0) /
        eventResponses.length
      ).toFixed(1)
    : "0.0"

  const filteredParticipants = eventParticipants.filter((participant) => {
    const haystack = [
      participant.nama_lengkap,
      participant.nama_company,
      participant.email_perusahaan,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const sections = [
    { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
    { id: "distribution", label: "Distribusi Peserta", icon: PieChart },
    { id: "search", label: "Advanced Search", icon: Search },
    { id: "survey", label: "Survey Analytics", icon: TrendingUp },
    { id: "export", label: "Export & Report", icon: Download },
  ] as const

  if (!event) {
    return (
      <MainLayout title="Analytics Dashboard">
        <div className="card py-16 text-center">
          <p className="text-neutral-500">Event tidak ditemukan</p>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Kembali ke Events
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      title={event.title}
      subtitle="Analytics Dashboard"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/events/${event.event_id}/registration-form`)}>
            Form Registrasi
          </Button>
          <Button variant="outline" onClick={() => navigate(`/events/${event.event_id}/survey-form`)}>
            Survey Form
          </Button>
          <Button variant="outline" onClick={() => navigate("/events")}>
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSection === section.id
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon size={16} />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>

        {activeSection === "overview" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="card"><p className="text-sm text-neutral-500">Invitations</p><p className="metrics-number">{formatNumber(metrics.invitations)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Registrations</p><p className="metrics-number">{formatNumber(metrics.registrations)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Approved</p><p className="metrics-number">{formatNumber(metrics.approved)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Attendees</p><p className="metrics-number">{formatNumber(metrics.attendees)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Attendance Rate</p><p className="metrics-number">{metrics.attendanceRate}%</p></div>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Registration Trend</h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="registrations" stroke="#0A2647" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Recent Registrations</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                    <tr>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Company</th>
                      <th className="pb-3">Industry</th>
                      <th className="pb-3">Registered At</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventParticipants.slice(0, 5).map((participant) => (
                      <tr key={participant.participant_id} className="border-b border-neutral-100 text-sm">
                        <td className="py-3">{participant.nama_lengkap}</td>
                        <td className="py-3">{participant.nama_company}</td>
                        <td className="py-3">{participant.jenis_industri}</td>
                        <td className="py-3">{formatDate(participant.registered_at)}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            participant.is_attended
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}>
                            {participant.is_attended ? "Attended" : "Registered"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "distribution" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Distribusi Berdasarkan Industri</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={industryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {industryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Distribusi Berdasarkan Jabatan</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={positionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A2647" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Distribusi Berdasarkan Lokasi</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {activeSection === "search" ? (
          <div className="card space-y-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, company, or email..."
                className="w-full rounded-button border border-neutral-300 py-3 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Industry</th>
                    <th className="pb-3">Position</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Attended At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.participant_id}
                      className="cursor-pointer border-b border-neutral-100 text-sm hover:bg-neutral-50"
                      onClick={() => setSelectedParticipant(participant)}
                    >
                      <td className="py-3">{participant.nama_lengkap}</td>
                      <td className="py-3">{participant.nama_company}</td>
                      <td className="py-3">{participant.jenis_industri}</td>
                      <td className="py-3">{participant.jabatan}</td>
                      <td className="py-3">{participant.email_perusahaan}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          participant.is_attended
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}>
                          {participant.is_attended ? "Attended" : "Registered"}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-500">
                        {participant.attended_at ? formatDate(participant.attended_at) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              <p>Showing {filteredParticipants.length} participants</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "survey" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="card"><p className="text-sm text-neutral-500">Total Responses</p><p className="metrics-number">{eventResponses.length}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Response Rate</p><p className="metrics-number">{metrics.responseRate}%</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Avg. Overall Rating</p><p className="metrics-number">{averageRating}</p><div className="mt-1 text-secondary">★★★★☆</div></div>
              <div className="card"><p className="text-sm text-neutral-500">Would Recommend</p><p className="metrics-number">{Math.round((eventResponses.filter((response) => response.recommend_to_others).length / Math.max(eventResponses.length, 1)) * 100)}%</p></div>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Rating Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Participant Comments</h2>
              <div className="space-y-3">
                {eventResponses.map((response) => {
                  const participant = eventParticipants.find(
                    (item) => item.participant_id === response.participant_id
                  )
                  return (
                    <div key={response.response_id} className="rounded-card bg-neutral-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-secondary">{"★".repeat(response.overall_rating)}</span>
                        <span className="text-sm text-neutral-500">{participant?.nama_lengkap}</span>
                      </div>
                      <p className="text-sm text-neutral-700">{response.comment}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "export" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Export Data</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Button variant="outline"><FileText size={16} /> Excel</Button>
                  <Button variant="outline"><FileText size={16} /> PDF</Button>
                  <Button variant="outline"><FileText size={16} /> CSV</Button>
                </div>
                <div className="space-y-2 text-sm text-neutral-700">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Participants Data</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Survey Responses</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Attendance Records</label>
                </div>
                <Button fullWidth>
                  <Download size={16} />
                  Export Now
                </Button>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Schedule Reports</h2>
              <div className="space-y-4">
                <select className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <input
                  type="email"
                  placeholder="email@company.com"
                  className="w-full rounded-button border border-neutral-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button variant="secondary" fullWidth>
                  Schedule Report
                </Button>
              </div>
            </div>

            <div className="card lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Recent Exports</h2>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-neutral-50 p-4">
                  <div>
                    <p className="font-medium">participants_export_2024-12-10.xlsx</p>
                    <p className="text-xs text-neutral-500">Exported on Dec 10, 2024 • 2.3 MB</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-neutral-50 p-4">
                  <div>
                    <p className="font-medium">survey_responses_2024-12-09.pdf</p>
                    <p className="text-xs text-neutral-500">Exported on Dec 9, 2024 • 1.1 MB</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ParticipantDetailModal
        participant={selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
      />
    </MainLayout>
  )
}

export default AnalyticsDashboardPage
