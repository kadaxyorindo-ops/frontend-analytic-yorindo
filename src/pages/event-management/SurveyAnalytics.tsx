import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Database,
  ListChecks,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { api } from "@/services/api";
import { formatNumber } from "@/utils/formatters";

type SurveyAnalyticsItem = {
  type: "chart" | "text_list";
  data: Record<string, number> | string[];
};

type EventSurveyAnalyticsResult = {
  eventId: string;
  totalResponses: number;
  totalDataAnalyzed: number;
  analytics: Record<string, SurveyAnalyticsItem>;
  diagnostics?: {
    registrationCount: number;
    surveyResponseCount: number;
    registrationsWithStoredAnswers: number;
    surveyResponsesWithAnswers: number;
    customFieldCount: number;
    sourceBreakdown: {
      surveyResponses: number;
      registrations: number;
    };
  };
};

type SurveyInsightContent = {
  summary: string;
  keyFindings: string[];
  exhibitorActions: string[];
  opportunityWatchout: string;
};

type EventSurveyInsightResult = {
  eventId?: string;
  insight: SurveyInsightContent | string;
  totalResponses?: number;
};

const TEXT_PREVIEW_LIMIT = 8;
const BAR_COLORS = ["#2F5BFF", "#5D7FFF", "#8EA8FF", "#B9C9FF", "#D7E3FF"];

const normalizeInsightText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const extractBulletItems = (lines: string[]) => {
  const items: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^(\*|-|•|\d+\.)\s+(.*)$/);
    items.push(match?.[2]?.trim() || line);
  }

  return items;
};

const parseInsightStringToContent = (value: string): SurveyInsightContent => {
  const cleaned = normalizeInsightText(value)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/[ \t]*#+[ \t]*/g, "")
    .trim();

  const lines = cleaned.split("\n");

  const buckets: Record<keyof SurveyInsightContent, string[]> = {
    summary: [],
    keyFindings: [],
    exhibitorActions: [],
    opportunityWatchout: [],
  };

  const headingMatchers: Array<{
    key: keyof SurveyInsightContent;
    match: (line: string) => boolean;
  }> = [
    { key: "summary", match: (line) => /^(ringkasan|summary)\b/i.test(line) },
    {
      key: "keyFindings",
      match: (line) => /^(temuan utama|key findings|highlights)\b/i.test(line),
    },
    {
      key: "exhibitorActions",
      match: (line) =>
        /^(aksi( untuk)? exhibitor|recommended actions|rekomendasi)\b/i.test(line),
    },
    {
      key: "opportunityWatchout",
      match: (line) =>
        /^(peluang|waspada|opportunity\s*\/?\s*watchout)\b/i.test(line),
    },
  ];

  let currentKey: keyof SurveyInsightContent | null = null;
  const preamble: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = headingMatchers.find((matcher) =>
      matcher.match(line.replace(/:$/, "")),
    );

    if (heading) {
      currentKey = heading.key;
      continue;
    }

    if (!currentKey) {
      preamble.push(rawLine);
      continue;
    }

    buckets[currentKey].push(rawLine);
  }

  const fallbackParagraphs = normalizeInsightText(preamble.join("\n")).split("\n\n");

  return {
    summary:
      normalizeInsightText(buckets.summary.join("\n")) ||
      fallbackParagraphs[0] ||
      "AI insight belum tersedia.",
    keyFindings: extractBulletItems(buckets.keyFindings).slice(0, 5),
    exhibitorActions: extractBulletItems(buckets.exhibitorActions).slice(0, 5),
    opportunityWatchout:
      normalizeInsightText(buckets.opportunityWatchout.join("\n")) || "",
  };
};

const formatChartData = (data: Record<string, number>) =>
  Object.entries(data).map(([label, total]) => ({ label, total }));

const SummaryCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B8CA3]">
          {title}
        </p>
        <p className="mt-3 text-3xl font-bold text-[#0A2647]">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#2F5BFF]">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const EmptyPanel = ({
  title,
  description,
  helperText,
}: {
  title: string;
  description: string;
  helperText?: string;
}) => (
  <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center">
    <h3 className="text-lg font-semibold text-[#0A2647]">{title}</h3>
    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5B6B7F]">
      {description}
    </p>
    {helperText ? (
      <p className="mx-auto mt-4 max-w-3xl rounded-[18px] bg-[#F8FAFF] px-5 py-4 text-left text-sm leading-7 text-[#43556E]">
        {helperText}
      </p>
    ) : null}
  </div>
);

const SurveyAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [analyticsData, setAnalyticsData] = useState<EventSurveyAnalyticsResult | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [insightData, setInsightData] = useState<EventSurveyInsightResult | null>(null);
  const [insightError, setInsightError] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});

  const analyticsEntries = useMemo(
    () => Object.entries(analyticsData?.analytics ?? {}),
    [analyticsData],
  );

  const chartQuestions = useMemo(
    () => analyticsEntries.filter(([, item]) => item.type === "chart"),
    [analyticsEntries],
  );

  const textQuestions = useMemo(
    () => analyticsEntries.filter(([, item]) => item.type === "text_list"),
    [analyticsEntries],
  );

  const insightContent: SurveyInsightContent | null = insightData?.insight
    ? typeof insightData.insight === "string"
      ? parseInsightStringToContent(insightData.insight)
      : {
          summary: insightData.insight.summary || "",
          keyFindings: insightData.insight.keyFindings || [],
          exhibitorActions: insightData.insight.exhibitorActions || [],
          opportunityWatchout: insightData.insight.opportunityWatchout || "",
        }
    : null;

  const loadAnalytics = async () => {
    if (!eventId) return;

    setIsLoadingAnalytics(true);
    setAnalyticsError("");

    const result = await api.get<EventSurveyAnalyticsResult>(
      `/api/v1/survey-analytics/events/${eventId}?ts=${Date.now()}`,
    );

    setIsLoadingAnalytics(false);

    if (result.error || !result.data) {
      setAnalyticsData(null);
      setAnalyticsError(result.message || "Survey analytics tidak tersedia.");
      return;
    }

    setAnalyticsData(result.data);
  };

  useEffect(() => {
    if (!eventId) return;
    void loadAnalytics();
  }, [eventId]);

  const loadInsights = async () => {
    if (!eventId) return;

    setIsLoadingInsight(true);
    setInsightError("");

    const result = await api.get<EventSurveyInsightResult>(
      `/api/v1/survey-analytics/events/${eventId}/insights?ts=${Date.now()}`,
    );

    setIsLoadingInsight(false);

    if (result.error || !result.data) {
      setInsightData(null);
      setInsightError(result.message || "AI insight belum tersedia.");
      return;
    }

    setInsightData(result.data);
  };

  if (!eventId) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#D7E1F0] bg-white px-6 py-10 text-center text-sm text-[#6B7280]">
        Event ID tidak ditemukan di URL.
      </div>
    );
  }

  const diagnostics = analyticsData?.diagnostics;
  const emptyStateHelper = diagnostics
    ? diagnostics.customFieldCount === 0
      ? "Event ini belum memiliki custom registration question aktif, jadi survey analytics memang tidak punya bahan untuk ditampilkan."
      : diagnostics.registrationsWithStoredAnswers === 0 &&
          diagnostics.surveyResponsesWithAnswers === 0
        ? `Event ini punya ${diagnostics.registrationCount} registration, tetapi belum ada jawaban custom question yang tersimpan di registration maupun survey_responses. Ini biasanya berarti registrasi lama dibuat lewat alur yang belum menyimpan custom answers.`
        : `Sumber data terdeteksi, tetapi tidak ada jawaban yang berhasil dipetakan ke analytics. Survey responses terpakai: ${diagnostics.sourceBreakdown.surveyResponses}, registration fallback terpakai: ${diagnostics.sourceBreakdown.registrations}.`
    : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
            Survey Analytics
          </p>
          <h1 className="text-[2.15rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            Overview
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
            Ringkasan jawaban dari custom registration questions untuk event ini.
            Analytics dimuat otomatis saat tab dibuka.
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2647] text-white shadow-[0_10px_22px_rgba(10,38,71,0.18)]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0A2647]">
                AI Survey Insights
              </h2>
              <p className="text-xs text-[#7B8CA3]">
                Ringkasan cepat dari jawaban peserta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadInsights()}
            disabled={isLoadingInsight}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[#DCE5F2] bg-white px-4 py-3 text-sm font-semibold text-[#0A2647] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-[#C9D7F3] hover:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoadingInsight ? "animate-spin" : ""} />
            {insightData ? "Refresh" : "Load"}
          </button>
        </div>

        {insightError ? (
          <div className="mt-5 rounded-[18px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4 text-sm text-[#991B1B]">
            {insightError}
          </div>
        ) : null}

        {isLoadingInsight ? (
          <div className="mt-5 space-y-4 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-4/6 rounded bg-slate-200" />
                </div>
              </div>
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <div className="h-3 w-40 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-4/6 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        ) : insightContent ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-7 text-[#5B6B7F]">{insightContent.summary}</p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <h3 className="text-sm font-semibold text-[#0A2647]">Key Findings</h3>
                {insightContent.keyFindings.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#5B6B7F]">
                    {insightContent.keyFindings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[#6B7280]">Belum ada temuan utama.</p>
                )}
              </div>

              <div className="rounded-[18px] bg-[#F8FAFF] p-4">
                <h3 className="text-sm font-semibold text-[#0A2647]">
                  Recommended Actions
                </h3>
                {insightContent.exhibitorActions.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#5B6B7F]">
                    {insightContent.exhibitorActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[#6B7280]">Belum ada aksi yang disarankan.</p>
                )}
              </div>
            </div>

            <div className="rounded-[18px] bg-[#F8FAFF] p-4">
              <h3 className="text-sm font-semibold text-[#0A2647]">
                Opportunity / Watchout
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5B6B7F]">
                {insightContent.opportunityWatchout || "Belum ada catatan khusus."}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-[#6B7280]">
            Klik <span className="font-semibold text-[#0A2647]">Load</span> untuk mengambil AI insights.
          </p>
        )}
      </div>

      {analyticsError ? (
        <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-5 text-sm text-[#991B1B]">
          {analyticsError}
        </div>
      ) : null}

      {isLoadingAnalytics && !analyticsData ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="rounded-[18px] border border-[#D7E1F0] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)] animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : analyticsData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total Responses"
              value={formatNumber(analyticsData.totalResponses ?? 0)}
              icon={Database}
            />
            <SummaryCard
              title="Questions Analyzed"
              value={formatNumber(analyticsData.totalDataAnalyzed ?? 0)}
              icon={ListChecks}
            />
            <SummaryCard
              title="Choice Questions"
              value={formatNumber(chartQuestions.length)}
              icon={BarChart3}
            />
            <SummaryCard
              title="Open Questions"
              value={formatNumber(textQuestions.length)}
              icon={MessageSquare}
            />
          </div>

          {analyticsEntries.length === 0 ? (
            <EmptyPanel
              title="Belum ada jawaban custom question yang bisa dianalisis"
              description="Survey analytics untuk event ini masih kosong."
              helperText={emptyStateHelper}
            />
          ) : null}

          {chartQuestions.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {chartQuestions.map(([question, content]) => {
                const chartData = formatChartData(content.data as Record<string, number>);

                return (
                  <article
                    key={question}
                    className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 size={18} className="text-[#2F5BFF]" />
                      <h2 className="text-lg font-semibold text-[#0A2647]">{question}</h2>
                    </div>

                    <div className="mt-5 h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E7EEF8" />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                            {chartData.map((_, index) => (
                              <Cell
                                key={`${question}-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {textQuestions.length > 0 ? (
            <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.08)]">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-[#2F5BFF]" />
                <h2 className="text-lg font-semibold text-[#0A2647]">Open-ended Responses</h2>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {textQuestions.map(([question, content]) => {
                  const responses = content.data as string[];
                  const isExpanded = Boolean(expandedResponses[question]);
                  const visibleResponses = isExpanded
                    ? responses
                    : responses.slice(0, TEXT_PREVIEW_LIMIT);

                  return (
                    <div
                      key={question}
                      className="rounded-[20px] border border-[#E6ECF7] bg-[#F8FAFF] p-5"
                    >
                      <p className="text-sm font-semibold text-[#0A2647]">{question}</p>
                      <div className="mt-4 space-y-3 text-sm leading-6 text-[#43556E]">
                        {visibleResponses.length > 0 ? (
                          visibleResponses.map((response, index) => (
                            <div
                              key={`${question}-${index}`}
                              className="rounded-[14px] border border-[#E5ECF6] bg-white p-3"
                            >
                              {response}
                            </div>
                          ))
                        ) : (
                          <p className="text-[#6B7280]">Belum ada jawaban teks.</p>
                        )}
                      </div>

                      {responses.length > TEXT_PREVIEW_LIMIT ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedResponses((prev) => ({
                              ...prev,
                              [question]: !prev[question],
                            }))
                          }
                          className="mt-4 text-sm font-semibold text-[#2F5BFF] hover:underline"
                        >
                          {isExpanded
                            ? "Sembunyikan jawaban"
                            : `Tampilkan semua jawaban (${responses.length})`}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default SurveyAnalytics;
