import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { formatDate, formatNumber } from "@/utils/formatters";
import { fetchEvents } from "@/store/eventSlice";
import { api } from "@/services/api";

type FormBuilderEvent = {
  event?: {
    id?: string;
    title?: string;
    eventDate?: string;
    location?: string;
    status?: string;
    slug?: string;
  };
  eventId?: string;
  formName?: string;
  version?: number;
  publishedAt?: string;
};

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const { events, isLoading } = useSelector((state: RootState) => state.events);
  const { participants } = useSelector((state: RootState) => state.participants);
  const { responses } = useSelector((state: RootState) => state.surveyResponses);

  const event = events.find((item) => item.event_id === eventId);
  const [detail, setDetail] = useState<FormBuilderEvent | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

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
      const result = await api.get<FormBuilderEvent>(
        `/api/v1/form-builder/events/${eventId}`
      );
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

  const metrics = useMemo(() => {
    if (!eventId) {
      return {
        registrations: 0,
        capacity: 0,
        attendance: 0,
        attendanceRate: 0,
        responses: 0,
        averageRating: 0,
        feedbacks: [] as string[],
      };
    }

    const eventParticipants = participants.filter(
      (participant) => participant.event_id === eventId
    );
    const eventResponses = responses.filter(
      (response) => response.event_id === eventId
    );

    const attendance = eventParticipants.filter(
      (participant) => participant.is_attended
    ).length;

    const attendanceRate =
      event?.registered_count && event.registered_count > 0
        ? Math.round((attendance / event.registered_count) * 100)
        : 0;

    const averageRating =
      eventResponses.length > 0
        ? Math.round(
            (eventResponses.reduce((acc, item) => acc + item.overall_rating, 0) /
              eventResponses.length) *
              10
          ) / 10
        : 0;

    const feedbacks = eventResponses
      .map((response) => response.comment)
      .filter(Boolean)
      .slice(0, 4) as string[];

    return {
      registrations: event?.registered_count ?? 0,
      capacity: event?.max_capacity ?? 0,
      attendance,
      attendanceRate,
      responses: eventResponses.length,
      averageRating,
      feedbacks,
    };
  }, [event, eventId, participants, responses]);

  const sidebarEvent = detail?.event;
  const eventTitle = sidebarEvent?.title ?? event?.title ?? "Event Detail";
  const eventDate = sidebarEvent?.eventDate ?? event?.event_date;
  const eventLocation = sidebarEvent?.location ?? event?.location ?? "-";
  const eventStatus = sidebarEvent?.status ?? event?.status ?? "-";
  const eventSlug = sidebarEvent?.slug ?? "-";

  if (!eventId) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#D7E1F0] bg-white px-6 py-10 text-center text-sm text-[#6B7280]">
        Event ID tidak ditemukan di URL.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[#D7E1F0] bg-white p-4 shadow-[0_10px_24px_rgba(10,38,71,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
            Event Management
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[#0A2647]">
            {eventTitle}
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[#5B6B7F]">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Tanggal
              </p>
              <p className="mt-1 font-semibold text-[#0A2647]">
                {eventDate ? formatDate(eventDate) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Lokasi
              </p>
              <p className="mt-1 font-semibold text-[#0A2647]">{eventLocation}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Status
              </p>
              <p className="mt-1 font-semibold text-[#0A2647]">{eventStatus}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Slug
              </p>
              <p className="mt-1 break-words text-[#0A2647]">{eventSlug}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[14px] border border-[#E6ECF7] bg-[#F8FAFF] p-3 text-xs text-[#6B7280]">
            <p className="font-semibold text-[#0A2647]">Form Builder</p>
            <p className="mt-1">
              {detail?.formName ?? "Form belum tersedia"}
            </p>
            {detail?.publishedAt ? (
              <p className="mt-1 text-[11px]">
                Published: {formatDate(detail.publishedAt)}
              </p>
            ) : null}
            <Link
              to={`/events/${eventId}/registration-form`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-[10px] bg-[#0A2647] px-3 py-2 text-xs font-semibold text-white hover:bg-[#133A6F] transition"
            >
              Buka Form Builder
            </Link>
          </div>

          {detailError ? (
            <p className="mt-4 text-xs font-semibold text-red-600">{detailError}</p>
          ) : null}
          {isLoadingDetail ? (
            <p className="mt-2 text-xs text-[#7B8CA3]">Memuat detail event...</p>
          ) : null}
        </div>

        <div className="rounded-[20px] border border-[#D7E1F0] bg-white p-4 shadow-[0_10px_24px_rgba(10,38,71,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
            Analytics
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <a
              href="#event-analytics"
              className="block rounded-[10px] px-3 py-2 text-[#0A2647] hover:bg-[#EEF4FF] transition"
            >
              Event Analytics
            </a>
            <a
              href="#survey-analytics"
              className="block rounded-[10px] px-3 py-2 text-[#0A2647] hover:bg-[#EEF4FF] transition"
            >
              Survey Analytics
            </a>
            <a
              href="#feedback-analytics"
              className="block rounded-[10px] px-3 py-2 text-[#0A2647] hover:bg-[#EEF4FF] transition"
            >
              Feedback Analytics
            </a>
          </div>
        </div>
      </aside>

      <div className="space-y-8">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                Ringkasan Event
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#0A2647]">
                {eventTitle}
              </h1>
              <p className="mt-2 text-sm text-[#6B7280]">
                {event?.description ?? "Belum ada deskripsi event."}
              </p>
            </div>
            <div className="rounded-[16px] bg-[#EEF4FF] px-4 py-3 text-sm text-[#0A2647]">
              {eventDate ? formatDate(eventDate) : "-"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4 text-sm text-[#5B6B7F]">
              <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Lokasi
              </div>
              <div className="mt-2 font-semibold text-[#0A2647]">
                {eventLocation}
              </div>
            </div>
            <div className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4 text-sm text-[#5B6B7F]">
              <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Status
              </div>
              <div className="mt-2 font-semibold text-[#0A2647]">
                {eventStatus}
              </div>
            </div>
            <div className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4 text-sm text-[#5B6B7F]">
              <div className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Kapasitas
              </div>
              <div className="mt-2 font-semibold text-[#0A2647]">
                {event ? formatNumber(event.max_capacity) : "-"}
              </div>
            </div>
          </div>
        </div>

        <div
          id="event-analytics"
          className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]"
        >
          <h2 className="text-lg font-semibold text-[#0A2647]">Event Analytics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] bg-[#F8FAFF] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Registrations
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0A2647]">
                {formatNumber(metrics.registrations)}
              </p>
            </div>
            <div className="rounded-[16px] bg-[#F8FAFF] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Attendance
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0A2647]">
                {formatNumber(metrics.attendance)} ({metrics.attendanceRate}%)
              </p>
            </div>
          </div>
        </div>

        <div
          id="survey-analytics"
          className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]"
        >
          <h2 className="text-lg font-semibold text-[#0A2647]">Survey Analytics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] bg-[#F8FAFF] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Total Responses
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0A2647]">
                {formatNumber(metrics.responses)}
              </p>
            </div>
            <div className="rounded-[16px] bg-[#F8FAFF] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7B8CA3]">
                Avg Rating
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#0A2647]">
                {metrics.averageRating}
              </p>
            </div>
          </div>
        </div>

        <div
          id="feedback-analytics"
          className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]"
        >
          <h2 className="text-lg font-semibold text-[#0A2647]">Feedback Analytics</h2>
          {metrics.feedbacks.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B7280]">
              Belum ada feedback yang masuk.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {metrics.feedbacks.map((feedback, index) => (
                <div
                  key={`${feedback}-${index}`}
                  className="rounded-[16px] border border-[#E6ECF7] bg-[#F8FAFF] p-4 text-sm text-[#4B5563]"
                >
                  “{feedback}”
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
