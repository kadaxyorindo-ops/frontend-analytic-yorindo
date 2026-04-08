import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { formatDate, formatNumber } from "@/utils/formatters";
import { fetchEvents } from "@/store/eventSlice";
import { api } from "@/services/api";

type EventIndustry = {
  refId?: string;
  name?: string;
} | null;

type EventDetailItem = {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: unknown;
  industry?: EventIndustry;
  eventDate?: string;
  event_date?: string;
  location?: string;
  status?: string;
  registrationForm?: Record<string, unknown>;
};

const getWebsiteOrigin = () => {
  if (typeof window === "undefined") return null;
  return window.location.origin;
};

const getEventDate = (item?: EventDetailItem | null) =>
  item?.eventDate ?? item?.event_date ?? null;

const getStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "published") {
    return { label: "Published", className: "bg-[#E6F9F0] text-[#22C55E]" };
  }
  if (normalized === "closed") {
    return { label: "Closed", className: "bg-[#F3F4F6] text-[#9CA3AF]" };
  }
  if (normalized === "ongoing") {
    return { label: "Ongoing", className: "bg-[#EAF1FF] text-[#3B82F6]" };
  }
  if (normalized === "draft") {
    return { label: "Draft", className: "bg-[#F3F4F6] text-[#6B7280]" };
  }

  return { label: status ?? "-", className: "bg-[#F3F4F6] text-[#6B7280]" };
};

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const { events, isLoading } = useSelector((state: RootState) => state.events);
  const event = events.find((item) => item.event_id === eventId);

  const [detail, setDetail] = useState<EventDetailItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!event && !isLoading) {
      void dispatch(fetchEvents());
    }
  }, [dispatch, event, isLoading]);

  useEffect(() => {
    if (!eventId) return;

    const loadDetail = async () => {
      setIsLoadingDetail(true);
      setDetailError("");

      const cacheBuster = `ts=${Date.now()}`;
      const result = await api.get<EventDetailItem>(`/api/v1/events/${eventId}?${cacheBuster}`);

      setIsLoadingDetail(false);

      if (result.error) {
        setDetailError(result.message);
        setDetail(null);
        return;
      }

      setDetail(result.data ?? null);
    };

    void loadDetail();
  }, [eventId]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  const eventTitle = detail?.title ?? event?.title ?? "Event Detail";
  const eventDate = getEventDate(detail) ?? event?.event_date ?? null;
  const eventLocation = detail?.location ?? event?.location ?? "-";
  const eventStatus = detail?.status ?? event?.status ?? "-";
  const industryName = detail?.industry?.name ?? "-";
  const eventSlug = detail?.slug ?? "-";

  const { label: statusLabel, className: statusClassName } = getStatusBadge(eventStatus);

  const registerPath = eventSlug && eventSlug !== "-" ? `/register/${eventSlug}` : null;
  const websiteOrigin = getWebsiteOrigin();
  const registerUrl =
    registerPath && websiteOrigin ? new URL(registerPath, websiteOrigin).toString() : null;

  if (!eventId) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#D7E1F0] bg-white px-6 py-10 text-center text-sm text-[#6B7280]">
        Event ID tidak ditemukan di URL.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
              Event Detail
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="min-w-0 text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
                {eventTitle}
              </h1>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClassName}`}>
                {statusLabel}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
              {detail?.description ?? event?.description ?? "Belum ada deskripsi event."}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[20px] border border-[#E3EAF5] bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
              Tanggal Event
            </p>
            <div className="rounded-[16px] bg-[#EEF4FF] px-4 py-3 text-sm font-semibold text-[#0A2647]">
              {eventDate ? formatDate(eventDate) : "-"}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to={`/events/${eventId}/participants`}
                className="inline-flex items-center justify-center rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF]"
              >
                Participants
              </Link>
              <Link
                to={`/events/${eventId}/analytics`}
                className="inline-flex items-center justify-center rounded-[14px] bg-[#0A2647] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(10,38,71,0.16)] transition hover:bg-[#133A6F]"
              >
                Event Analytics
              </Link>
              <Link
                to={`/events/${eventId}/registration-form`}
                className="inline-flex items-center justify-center rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF] sm:col-span-2"
              >
                Form Builder Registration
              </Link>
            </div>
          </div>
        </div>

        {detailError ? (
          <div className="mt-6 rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4 text-sm text-[#991B1B]">
            {detailError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[16px] border border-[#E6ECF7] bg-white p-4 text-sm text-[#5B6B7F] shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
            <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">Lokasi</div>
            <div className="mt-2 font-semibold text-[#0A2647]">{eventLocation}</div>
          </div>

          <div className="rounded-[16px] border border-[#E6ECF7] bg-white p-4 text-sm text-[#5B6B7F] shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
            <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">Industry</div>
            <div className="mt-2 font-semibold text-[#0A2647]">{industryName}</div>
          </div>

          <div className="rounded-[16px] border border-[#E6ECF7] bg-white p-4 text-sm text-[#5B6B7F] shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
            <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">Kapasitas</div>
            <div className="mt-2 font-semibold text-[#0A2647]">
              {event ? formatNumber(event.max_capacity) : "-"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#E3EAF5] bg-white p-6 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                Link Register (slug)
              </p>
              <p className="mt-2 break-all font-mono text-sm text-[#0A2647]">{registerUrl ?? "-"}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!registerUrl) return;
                  try {
                    await navigator.clipboard.writeText(registerUrl);
                    setIsCopied(true);
                  } catch {
                    setIsCopied(false);
                  }
                }}
                disabled={!registerUrl}
                className="inline-flex items-center justify-center rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCopied ? "Copied" : "Copy Link"}
              </button>

              {registerUrl ? (
                <a
                  href={registerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-[14px] bg-[#0A2647] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(10,38,71,0.16)] transition hover:bg-[#133A6F]"
                >
                  Open Register
                </a>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center justify-center rounded-[14px] bg-[#0A2647]/60 px-4 py-3 text-sm font-semibold text-white">
                  Open Register
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-[#5B6B7F] sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7B8CA3]">
                Event ID
              </span>
              <p className="mt-1 break-all font-semibold text-[#0A2647]">{eventId}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7B8CA3]">
                Slug
              </span>
              <p className="mt-1 break-all font-semibold text-[#0A2647]">{eventSlug}</p>
            </div>
          </div>
        </div>

        {isLoadingDetail ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`detail-skeleton-${index}`}
                className="rounded-[16px] border border-[#E6ECF7] bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] animate-pulse"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default EventDetail;

