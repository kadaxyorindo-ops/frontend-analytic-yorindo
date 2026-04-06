import { Mail, Phone, Building2, MapPin, Briefcase } from "lucide-react"
import type { Participant } from "@/types/participant"
import { formatDate } from "@/utils/formatters"
import Button from "@/components/Button"

interface ParticipantDetailModalProps {
  participant: Participant | null
  onClose: () => void
}

const ParticipantDetailModal = ({
  participant,
  onClose,
}: ParticipantDetailModalProps) => {
  if (!participant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-card p-6 text-neutral-900 shadow-card">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2>{participant.nama_lengkap}</h2>
            <p className="mt-1 text-sm text-neutral-500">{participant.nama_company}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-card bg-neutral-50 p-4">
            <div className="flex items-center gap-3 text-sm"><Building2 size={16} /> {participant.nama_company}</div>
            <div className="flex items-center gap-3 text-sm"><MapPin size={16} /> {participant.lokasi_perusahaan}</div>
            <div className="flex items-center gap-3 text-sm"><Briefcase size={16} /> {participant.jabatan}</div>
            <div className="flex items-center gap-3 text-sm"><Mail size={16} /> {participant.email_perusahaan}</div>
            <div className="flex items-center gap-3 text-sm"><Phone size={16} /> {participant.no_hp}</div>
          </div>
          <div className="space-y-3 rounded-card bg-neutral-50 p-4 text-sm">
            <p><span className="font-semibold">Industri:</span> {participant.jenis_industri}</p>
            <p><span className="font-semibold">Registered:</span> {formatDate(participant.registered_at)}</p>
            <p><span className="font-semibold">Attendance:</span> {participant.is_attended ? "Attended" : "Registered"}</p>
            <p><span className="font-semibold">Survey:</span> {participant.has_filled_survey ? "Submitted" : "Pending"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParticipantDetailModal
