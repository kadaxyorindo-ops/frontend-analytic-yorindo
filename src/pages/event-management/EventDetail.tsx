import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, FilePlus2, QrCode } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getEventDetail, type EventDetailResponse } from "@/services/eventWorkspaceService";
import { formatDate } from "@/utils/formatters";

function getStatusMeta(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "registration" || normalized === "published") {
    return { label: "Published", className: "bg-[#E6F9F0] text-[#22C55E]" };
  }

  if (normalized === "ongoing") {
    return { label: "Ongoing", className: "bg-[#EAF1FF] text-[#3B82F6]" };
  }

  if (normalized === "closed" || normalized === "done" || normalized === "cancelled") {
    return { label: "Closed", className: "bg-[#F3F4F6] text-[#9CA3AF]" };
  }

  return { label: "Draft", className: "bg-[#F3F4F6] text-[#6B7280]" };
}

export default function EventDetail() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setError("");

      const result = await getEventDetail(eventId);

      if (result.error || !result.data) {
        setError(result.message || "Gagal memuat detail event.");
        setDetail(null);
        setIsLoading(false);
        return;
      }

      setDetail(result.data);
      setIsLoading(false);
    };

    void loadDetail();
  }, [eventId]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const publicRegistrationUrl = useMemo(() => {
    if (!detail?.slug || typeof window === "undefined") return null;
    return `${window.location.origin}/register/${detail.slug}`;
  }, [detail?.slug]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded-full bg-slate-200" />
            <div className="h-10 w-2/3 rounded-2xl bg-slate-200" />
            <div className="h-5 w-full rounded-xl bg-slate-200" />
            <div className="h-5 w-5/6 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
        {error || "Detail event tidak tersedia."}
      </div>
    );
  }

  const status = getStatusMeta(detail.status);
  const eventDate = detail.eventDate ?? detail.event_date;
  const registrationFields = detail.registrationForm?.fields?.length ?? 0;
  const formVersion = detail.registrationForm?.version ?? 1;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
                Event Detail
              </p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
            </div>
            <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
              {detail.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
              {detail.description?.trim() ||
                "Detail event ini menjadi pusat kontrol untuk form registrasi, analytics, feedback, dan daftar participants."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to={`/events/${eventId}/registration-form`}
              className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#0A2647] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(10,38,71,0.16)] transition hover:bg-[#133A6F]"
            >
              <FilePlus2 size={16} />
              Form Builder
            </Link>
            {publicRegistrationUrl ? (
              <a
                href={publicRegistrationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#DCE5F2] bg-white px-5 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF]"
              >
                <ExternalLink size={16} />
                Open Public Page
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[28px] border border-[#D7E1F0] bg-white p-7 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
            Event Identity
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Event Date
              </p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">
                {eventDate ? formatDate(eventDate) : "-"}
              </p>
            </div>
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Location
              </p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">
                {detail.location || "-"}
              </p>
            </div>
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Industry
              </p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">
                {detail.industry?.name || "-"}
              </p>
            </div>
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Slug
              </p>
              <p className="mt-2 break-all text-base font-semibold text-[#0A2647]">
                {detail.slug}
              </p>
            </div>
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Form Version
              </p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">
                v{formVersion}
              </p>
            </div>
            <div className="rounded-[22px] border border-[#E5ECF6] bg-[#F8FAFD] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Published At
              </p>
              <p className="mt-2 text-base font-semibold text-[#0A2647]">
                {detail.registrationForm?.publishedAt
                  ? formatDate(detail.registrationForm.publishedAt)
                  : "Belum dipublish"}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-[#D7E1F0] bg-[#EAF1FF] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                <QrCode size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                  Registration Access
                </p>
                <p className="text-base font-bold text-[#0A2647]">
                  Public registration link
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              <p className="break-all text-sm leading-6 text-[#43556E]">
                {publicRegistrationUrl || "URL public akan tersedia setelah event punya slug."}
              </p>
              {publicRegistrationUrl ? (
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(publicRegistrationUrl);
                    setCopied(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-[14px] border border-[#DCE5F2] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#0A2647] transition hover:border-[#C9D7F3] hover:bg-[#EDF3FF]"
                >
                  <Copy size={14} />
                  {copied ? "Link copied" : "Copy link"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
              Form Snapshot
            </p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-[18px] border border-[#E5ECF6] bg-[#F8FAFD] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Total Active Fields
                </p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#0A2647]">
                  {registrationFields}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E5ECF6] bg-[#F8FAFD] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Event ID
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-[#0A2647]">
                  {detail._id}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
