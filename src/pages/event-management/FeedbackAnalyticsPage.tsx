import { useEffect, useMemo, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { getSurveyAnalytics, type SurveyAnalyticsPayload } from "@/services/eventWorkspaceService";
import { useParams } from "react-router-dom";

export default function FeedbackAnalyticsPage() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [analytics, setAnalytics] = useState<SurveyAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadFeedback = async () => {
      setIsLoading(true);
      setError("");

      const result = await getSurveyAnalytics(eventId);

      if (result.error || !result.data) {
        setError(result.message || "Gagal memuat feedback analytics.");
        setAnalytics(null);
        setIsLoading(false);
        return;
      }

      setAnalytics(result.data);
      setIsLoading(false);
    };

    void loadFeedback();
  }, [eventId]);

  const feedbackGroups = useMemo(() => {
    if (!analytics) return [];

    return Object.entries(analytics.analytics)
      .filter(([, value]) => value.type === "text_list")
      .map(([question, value]) => ({
        question,
        responses: value.data as string[],
      }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-[260px] animate-pulse rounded-[24px] border border-[#D7E1F0] bg-white shadow-[0_12px_28px_rgba(10,38,71,0.05)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
        {error}
      </div>
    );
  }

  if (feedbackGroups.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D7E1F0] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
        Belum ada feedback berbentuk jawaban terbuka untuk event ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#D7E1F0] bg-[#F8FAFD] p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF3FF] text-[#0A2647]">
            <MessageSquareText size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7B8CA3]">
              Feedback Analytics
            </p>
            <p className="text-lg font-bold text-[#0A2647]">
              Kumpulan jawaban terbuka dari survey peserta
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {feedbackGroups.map((group) => (
          <article
            key={group.question}
            className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_28px_rgba(10,38,71,0.06)]"
          >
            <p className="text-lg font-bold text-[#0A2647]">{group.question}</p>
            <div className="mt-5 space-y-3">
              {group.responses.map((response, index) => (
                <div
                  key={`${group.question}-${index}`}
                  className="rounded-[18px] border border-[#E5ECF6] bg-[#F8FAFD] p-4 text-sm leading-7 text-[#43556E]"
                >
                  {response}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
