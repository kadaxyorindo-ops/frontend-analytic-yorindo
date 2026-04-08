import { api } from "@/services/api";

export interface EventDetailResponse {
  _id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  eventDate?: string;
  event_date?: string;
  location?: string | null;
  status?: string;
  industry?: {
    refId?: string | null;
    name?: string | null;
  } | null;
  registrationForm?: {
    version?: number;
    publishedAt?: string | null;
    fields?: unknown[];
  };
}

export interface EventAnalyticsSummary {
  eventId: string;
  totalInvitations: number;
  totalRegistrations: number;
  totalApproved: number;
  totalAttendance: number;
  attendanceRate: number;
}

export interface EventAnalyticsOverview {
  eventId: string;
  month: string;
  summary: EventAnalyticsSummary;
  statusBreakdown: Record<string, number>;
  registrationsOverTime: Array<{ date: string; count: number }>;
  topIndustries: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
}

export interface EventAnalyticsInsight {
  summary: string;
  highlights: string[];
  recommendations: string[];
}

export interface SurveyAnalyticsPayload {
  eventId: string;
  totalDataAnalyzed: number;
  analytics: Record<
    string,
    | { type: "chart"; data: Record<string, number> }
    | { type: "text_list"; data: string[] }
  >;
}

export interface SurveyAiSummaryPayload {
  eventId: string;
  insight: string;
}

export interface EventParticipantItem {
  registrationId: string;
  participantId: string;
  fullName: string;
  companyName: string;
  industryName: string;
  jobTitleName: string;
  cityName: string;
  personalEmail: string | null;
  companyEmail: string | null;
  phone: string | null;
  status: string;
  checkedInAt: string | null;
  createdAt: string | null;
}

export interface EventParticipantListResponse {
  items: EventParticipantItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    checkedInCount: number;
    totalCount: number;
  };
}

type RegistrationApiItem = {
  _id: string;
  status: string;
  createdAt?: string;
  companySnapshot?: { name?: string | null };
  industrySnapshot?: { name?: string | null };
  jobTitleSnapshot?: { name?: string | null };
  citySnapshot?: { name?: string | null };
  checkIn?: { checkedInAt?: string | null };
  participant?: {
    _id: string;
    fullName?: string;
    personalEmail?: string | null;
    companyEmail?: string | null;
    phone?: string | null;
  };
};

export function getEventDetail(eventId: string) {
  const cacheBuster = `ts=${Date.now()}`;
  return api.get<EventDetailResponse>(`/api/v1/events/${eventId}?${cacheBuster}`);
}

export function getEventAnalyticsOverview(eventId: string, month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return api.get<EventAnalyticsOverview>(
    `/api/v1/analytics/events/${eventId}/overview${query}`,
  );
}

export function getEventAnalyticsInsight(eventId: string, month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return api.get<EventAnalyticsInsight>(
    `/api/v1/analytics/events/${eventId}/insights${query}`,
  );
}

export function getSurveyAnalytics(eventId: string) {
  return api.get<SurveyAnalyticsPayload>(`/api/v1/events/${eventId}/analytics`);
}

export function getSurveyAiSummary(eventId: string) {
  return api.get<SurveyAiSummaryPayload>(
    `/api/v1/events/${eventId}/analytics/ai-insight`,
  );
}

export async function getEventParticipants(params: {
  eventId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  const result = await api.get<{
    items: RegistrationApiItem[];
    pagination: EventParticipantListResponse["pagination"];
    meta: EventParticipantListResponse["meta"];
  }>(`/api/v1/events/${params.eventId}/registrations?${query.toString()}`);

  if (!result.data) {
    return {
      ...result,
      data: null,
    };
  }

  return {
    ...result,
    data: {
      items: result.data.items.map((item) => ({
        registrationId: item._id,
        participantId: item.participant?._id ?? "",
        fullName: item.participant?.fullName ?? "Unknown participant",
        companyName: item.companySnapshot?.name ?? "-",
        industryName: item.industrySnapshot?.name ?? "-",
        jobTitleName: item.jobTitleSnapshot?.name ?? "-",
        cityName: item.citySnapshot?.name ?? "-",
        personalEmail: item.participant?.personalEmail ?? null,
        companyEmail: item.participant?.companyEmail ?? null,
        phone: item.participant?.phone ?? null,
        status: item.status,
        checkedInAt: item.checkIn?.checkedInAt ?? null,
        createdAt: item.createdAt ?? null,
      })),
      pagination: result.data.pagination,
      meta: result.data.meta,
    } satisfies EventParticipantListResponse,
  };
}
