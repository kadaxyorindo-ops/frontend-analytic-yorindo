import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Building2, Check, Edit3, Sparkles, User2 } from "lucide-react";
import type { FormBuilderResponse } from "../../types/formBuilder";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

type ReviewNavState = {
  data: FormBuilderResponse["data"];
  values: Record<string, unknown>;
};

export default function RegistrationReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  const state = (location.state ?? null) as ReviewNavState | null;
  const data = state?.data ?? null;
  const values = state?.values ?? null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const allFields = useMemo(() => {
    if (!data) return [];
    return [...(data.fixedFields || []), ...(data.customQuestions || [])]
      .filter((f) => f.isActive)
      .sort((a, b) => a.order - b.order);
  }, [data]);

  const keyToLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of allFields) map.set(f.key, f.label);
    return map;
  }, [allFields]);

  const reviewItems = useMemo(() => {
    if (!values) return [];
    return Object.entries(values)
      .map(([key, value]) => {
        const label = keyToLabel.get(key) ?? key;
        const display =
          Array.isArray(value) ? value.join(", ") : value === "" ? "-" : String(value);
        return { key, label, display };
      })
      .filter((it) => it.display !== "-");
  }, [values, keyToLabel]);

  const sections = useMemo(() => {
    const personalKeys = new Set([
      "full_name",
      "nama_lengkap",
      "personal_email",
      "email_pribadi",
      "phone",
      "no_hp",
      "job_title",
      "jabatan",
      "position",
    ]);
    const corporateKeys = new Set([
      "company_name",
      "nama_company",
      "company_location",
      "lokasi_perusahaan",
      "industry",
      "jenis_industri",
      "company_email",
      "email_perusahaan",
    ]);

    const personal = allFields.filter((f) => personalKeys.has(f.key));
    const corporate = allFields.filter((f) => corporateKeys.has(f.key));
    const eventInfo = allFields.filter(
      (f) => !personalKeys.has(f.key) && !corporateKeys.has(f.key),
    );

    return [
      { id: "personal", number: "01", title: "Personal Identity", fields: personal },
      { id: "corporate", number: "02", title: "Corporate Profile", fields: corporate },
      { id: "event", number: "03", title: "Event Information", fields: eventInfo },
    ].filter((s) => s.fields.length > 0);
  }, [allFields]);

  const reviewSections = useMemo(() => {
    const byKey = new Map(reviewItems.map((it) => [it.key, it]));
    return sections
      .map((s) => {
        const items = s.fields
          .map((f) => byKey.get(f.key))
          .filter(Boolean) as Array<(typeof reviewItems)[number]>;
        return { ...s, items };
      })
      .filter((s) => s.items.length > 0);
  }, [reviewItems, sections]);

  const handleSubmit = async () => {
    if (!data || !values) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      // Build payload: fixed fields at root + custom questions under survei_result.
      const fixedKeys = new Set(data.fixedFields.map((f) => f.key));
      const survei_result: Record<string, unknown> = {};
      const root: Record<string, unknown> = {};

      const renameFixedKey = (key: string) => {
        const map: Record<string, string> = {
          full_name: "nama_lengkap",
          personal_email: "email_pribadi",
          company_email: "email_perusahaan",
          phone: "no_hp",
          company_name: "nama_company",
          company_location: "lokasi_perusahaan",
          industry: "jenis_industri",
          job_title: "jabatan",
        };
        return map[key] ?? key;
      };

      for (const [k, v] of Object.entries(values)) {
        if (fixedKeys.has(k)) root[renameFixedKey(k)] = v;
        else {
          const label = data.customQuestions.find((q) => q.key === k)?.label || k;
          survei_result[label] = v;
        }
      }

      const payload = {
        event_id: data.eventId,
        ...root,
        survei_result,
      };

      const res = await fetch("/api/v1/visitor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Submit failed (${res.status})`);
      }

      setSubmitSuccess("Registration submitted successfully!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Submit failed";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data || !values) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Card className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
            <CardContent className="p-7 sm:p-10">
              <h1 className="text-2xl leading-tight font-extrabold text-slate-900">
                Review page unavailable
              </h1>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Please go back and complete the registration form again.
              </p>
              <div className="mt-6">
                <Button type="button" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="w-full overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
          <div className="relative bg-[#001128] p-5 text-white sm:p-7">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#855300,transparent)]" />
            <div className="relative z-10 space-y-3 pr-10">
              <div className="flex items-center gap-2 text-[#855300] text-lg leading-relaxed font-semibold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Final step</span>
              </div>
              <h1 className="text-3xl leading-tight font-extrabold">
                Review Your Registration
              </h1>
              <p className="text-lg leading-relaxed font-medium text-[#B7C6E1]">
                Please verify your information below and make sure that the data is
                correct. The entry pass will be sent to your E-Mail.
              </p>
            </div>
          </div>

          <CardContent className="p-5 sm:p-7">
            {submitSuccess ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-lg leading-relaxed text-green-800">
                {submitSuccess}
              </div>
            ) : submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-lg leading-relaxed text-red-800">
                {submitError}
              </div>
            ) : null}

            {reviewSections.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-lg leading-relaxed text-slate-700">
                No answers to review yet.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {reviewSections.map((s) => {
                  const Icon =
                    s.id === "personal" ? User2 : s.id === "corporate" ? Building2 : Check;
                  const span = s.id === "event" ? "lg:col-span-2" : "";
                  return (
                    <div
                      key={s.id}
                      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${span}`}
                    >
                      <div className="flex items-center gap-2 text-lg leading-relaxed font-semibold uppercase tracking-wide text-slate-700">
                        <Icon className="h-4 w-4" />
                        <span>{s.title}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {s.items.map((it) => (
                          <div key={it.key}>
                            <div className="text-lg leading-relaxed font-semibold tracking-wider uppercase text-slate-500">
                              {it.label}
                            </div>
                            <div className="mt-1 text-lg leading-relaxed font-medium text-slate-900 break-words">
                              {it.display}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {!submitSuccess && !isSubmitting ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 justify-start text-slate-700 sm:h-10"
                  onClick={() => {
                    navigate(`/register/${encodeURIComponent(slug ?? "")}`, {
                      state: { values },
                    });
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Details
                </Button>
              ) : (
                <div />
              )}

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <p className="text-lg leading-relaxed font-medium text-center text-slate-500 sm:max-w-[14rem] sm:text-left md:max-w-none">
                  By confirming, you agree to our Terms of Service.
                </p>
                <Button
                  type="button"
                  disabled={isSubmitting || !!submitSuccess}
                  className="h-11 w-full shrink-0 bg-[#F4A11A] px-6 font-semibold text-slate-900 hover:bg-[#e49310] sm:h-10 sm:w-auto rounded-xl"
                  onClick={() => void handleSubmit()}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit →"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

