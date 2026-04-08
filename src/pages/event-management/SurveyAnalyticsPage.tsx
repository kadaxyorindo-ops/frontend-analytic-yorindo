import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import {
  getSurveyAiSummary,
  getSurveyAnalytics,
  type SurveyAiSummaryPayload,
  type SurveyAnalyticsPayload,
} from "@/services/eventWorkspaceService";
import { useParams } from "react-router-dom";

function SummarySkeleton() {
  return (
    <div className="rounded-[24px] border border-[#D7E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F2F7FF_100%)] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded-full bg-slate-200" />
        <div className="h-8 w-1/2 rounded-2xl bg-slate-200" />
        <div className="h-4 w-full rounded-xl bg-slate-200" />
        <div className="h-4 w-5/6 rounded-xl bg-slate-200" />
        <div className="h-4 w-4/6 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function SurveyAnalyticsPage() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [surveyAnalytics, setSurveyAnalytics] = useState<SurveyAnalyticsPayload | null>(null);
  const [surveySummary, setSurveySummary] = useState<SurveyAiSummaryPayload | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setError("");

      const result = await getSurveyAnalytics(eventId);

      if (result.error || !result.data) {
        setError(result.message || "Gagal memuat survey analytics.");
        setSurveyAnalytics(null);
        setIsLoadingAnalytics(false);
        return;
      }

      setSurveyAnalytics(result.data);
      setIsLoadingAnalytics(false);
    };

    void loadAnalytics();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const loadSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError("");

      const result = await getSurveyAiSummary(eventId);

      if (result.error || !result.data) {
        setSurveySummary(null);
        setSummaryError(result.message || "AI summary belum tersedia.");
        setIsLoadingSummary(false);
        return;
      }

      setSurveySummary(result.data);
      setIsLoadingSummary(false);
    };

    void loadSummary();
  }, [eventId]);

  const chartQuestions = useMemo(() => {
    if (!surveyAnalytics) return [];

    return Object.entries(surveyAnalytics.analytics)
      .filter(([, value]) => value.type === "chart")
      .map(([question, value]) => ({
        question,
        rows: Object.entries(value.data as Record<string, number>).map(([label, total]) => ({
          label,
          total,
        })),
      }));
  }, [surveyAnalytics]);

  const textQuestions = useMemo(() => {
    if (!surveyAnalytics) return [];

    return Object.entries(surveyAnalytics.analytics)
      .filter(([, value]) => value.type === "text_list")
      .map(([question, value]) => ({
        question,
        responses: value.data as string[],
      }));
  }, [surveyAnalytics]);

  if (isLoadingAnalytics) {
    return (
      <div className="space-y-6">
        <SummarySkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-[360px] animate-pulse rounded-[24px] border border-[#D7E1F0] bg-white shadow-[0_12px_28px_rgba(10,38,71,0.05)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !surveyAnalytics) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
        {error || "Survey analytics tidak tersedia."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoadingSummary ? (
        <SummarySkeleton />
      ) : (
        <section className="rounded-[24px] border border-[#D7E1F0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F2F7FF_100%)] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#0A2647]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
                AI Summary
              </p>
              <p className="text-lg font-bold text-[#0A2647]">Survey insight recap</p>
            </div>
          </div>
          <div className="mt-5 rounded-[20px] border border-[#DCE5F2] bg-white p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#43556E]">
              {surveySummary?.insight || summaryError || "AI summary belum tersedia."}
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
            Questions Analyzed
          </p>
          <p className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            {Object.keys(surveyAnalytics.analytics).length}
          </p>
        </div>
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
            Total Aggregated
          </p>
          <p className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            {surveyAnalytics.totalDataAnalyzed}
          </p>
        </div>
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
            Chart Questions
          </p>
          <p className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            {chartQuestions.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
            Text Questions
          </p>
          <p className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            {textQuestions.length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {chartQuestions.length > 0 ? (
          chartQuestions.map((item) => (
            <article
              key={item.question}
              className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]"
            >
              <p className="text-lg font-bold text-[#0A2647]">{item.question}</p>
              <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.rows}>
                    <CartesianGrid stroke="#E7EEF8" strokeDasharray="4 4" />
                    <XAxis dataKey="label" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2F5BFF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.rows.map((row) => (
                  <div
                    key={`${item.question}-${row.label}`}
                    className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#0A2647]"
                  >
                    {row.label}: {row.total}
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280] xl:col-span-2">
            Belum ada pertanyaan pilihan yang cukup untuk divisualisasikan.
          </div>
        )}
      </section>

      {textQuestions.length > 0 ? (
        <section className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
          <p className="text-lg font-bold text-[#0A2647]">Open-ended highlights</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {textQuestions.map((item) => (
              <div
                key={item.question}
                className="rounded-[20px] border border-[#E5ECF6] bg-[#F8FAFD] p-5"
              >
                <p className="text-sm font-semibold text-[#0A2647]">{item.question}</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[#43556E]">
                  {item.responses.slice(0, 4).map((response, index) => (
                    <p key={`${item.question}-${index}`}>{response}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
