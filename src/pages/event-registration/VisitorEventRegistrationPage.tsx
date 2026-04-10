import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormBuilder from "../../components/FormBuilder";
import type { FormBuilderResponse } from "../../types/formBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  DUPLICATE_REGISTRATION_DESCRIPTION,
  DUPLICATE_REGISTRATION_TITLE,
  isDuplicateRegistrationError,
  parseSubmitErrorMessage,
} from "../../utils/registrationSubmitErrors";

export default function VisitorEventRegistrationPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitStatusOpen, setIsSubmitStatusOpen] = useState(false);

  const [data, setData] = useState<FormBuilderResponse["data"] | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const navState = location.state as { values?: Record<string, unknown> } | null;
    if (navState?.values) setDraftValues(navState.values);
  }, [location.state]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);

        const base =
          (import.meta.env.VITE_API_URL as string | undefined) ||
          "/api/v1/form-builder/slug";

        const url = `${base.replace(/\/$/, "")}/${encodeURIComponent(slug ?? "")}`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Request failed (${res.status})`);
        }

        const json = (await res.json()) as FormBuilderResponse;

        if (!json.success) {
          setError(json.message || "Event not found");
          return;
        }

        // Unpublished/inactive event state
        if (!json.data.publishedAt) {
          setError("This event is not published yet.");
          return;
        }

        // Form missing state
        const totalFields =
          (json.data.fixedFields?.length ?? 0) + (json.data.customQuestions?.length ?? 0);
        if (totalFields === 0) {
          setError("Registration form is not available for this event.");
          return;
        }

        if (!cancelled) setData(json.data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Network error";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const dateTime = useMemo(() => {
    if (!data?.event?.eventDate) return null;
    const d = new Date(data.event.eventDate);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: d.toLocaleString(),
    };
  }, [data?.event?.eventDate]);

  const friendlySubmitError = useMemo(
    () => parseSubmitErrorMessage(submitError),
    [submitError],
  );

  const showDuplicateContactHelp = useMemo(
    () => isDuplicateRegistrationError(friendlySubmitError),
    [friendlySubmitError],
  );

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!data) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      // Build payload: fixed fields at root + custom questions under survei_result.
      const fixedKeys = new Set(data.fixedFields.map((f) => f.key));
      const survei_result: Record<string, unknown> = {};
      const root: Record<string, unknown> = {};

      const renameFixedKey = (key: string) => {
        // Keep backend-driven keys by default, but normalize common variants
        // to the visitor/register payload naming convention.
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
          const label =
            data.customQuestions.find((q) => q.key === k)?.label || k;
          survei_result[label] = v;
        }
      }

      const payload = {
        event_id: data.eventId,
        ...root,
        survei_result,
      };

      // Use relative URL so Vite proxy forwards to http://localhost:5000
      const res = await fetch("/api/v1/visitor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Submit failed (${res.status})`);
      }

      setSubmitSuccess("Registration submitted successfully!");
      setIsSubmitStatusOpen(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Submit failed";
      setSubmitError(message);
      setIsSubmitStatusOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">Loading event…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header className="overflow-hidden rounded-3xl bg-[#001128] text-white">
          {data.event.bannerUrl ? (
            <div className="h-48 w-full overflow-hidden bg-black/20">
              <img
                src={data.event.bannerUrl}
                alt={data.event.title}
                className="h-full w-full object-cover opacity-70"
              />
            </div>
          ) : null}
          <div className="p-10">
            <div className="text-[#855300] text-base font-semibold uppercase tracking-wide">
              Participant Registration
            </div>
            <h1 className="mt-3 text-4xl font-extrabold">{data.event.title}</h1>
            {data.event.description ? (
              <p className="mt-4 max-w-3xl text-lg text-[#B7C6E1]">
                {data.event.description}
              </p>
            ) : null}
            <div className="mt-6 grid grid-cols-1 gap-3 text-lg text-[#B7C6E1] sm:grid-cols-3">
              <div>
                <p className="text-base uppercase tracking-wider text-[#768EB4]">
                  Date
                </p>
                <p className="text-white">{dateTime?.date ?? "-"}</p>
              </div>
              <div>
                <p className="text-base uppercase tracking-wider text-[#768EB4]">
                  Time
                </p>
                <p className="text-white">{dateTime?.time ?? "-"}</p>
              </div>
              <div>
                <p className="text-base uppercase tracking-wider text-[#768EB4]">
                  Location
                </p>
                <p className="text-white">{data.event.location || "-"}</p>
              </div>
            </div>
          </div>
        </header>

        <Dialog open={isSubmitStatusOpen} onOpenChange={setIsSubmitStatusOpen}>
          <DialogContent className="w-[min(92vw,520px)] max-w-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-sans text-xl leading-tight">
                {submitSuccess ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Success</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Submission failed</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {submitSuccess ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 font-sans text-lg leading-relaxed text-green-800">
                {submitSuccess}
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-sans text-lg leading-relaxed text-red-800">
                {showDuplicateContactHelp ? (
                  <>
                    <p className="font-semibold">{DUPLICATE_REGISTRATION_TITLE}</p>
                    <p className="mt-2 text-base leading-relaxed text-red-700">
                      {DUPLICATE_REGISTRATION_DESCRIPTION}
                    </p>
                  </>
                ) : (
                  <p>{friendlySubmitError || "Failed to submit registration."}</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => setIsSubmitStatusOpen(false)}>
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <FormBuilder
          formBuilderData={data}
          onSubmit={handleSubmit}
          defaultValues={draftValues}
          onReview={(values) => {
            setDraftValues(values);
            navigate(`/register/${encodeURIComponent(slug ?? "")}/review`, {
              state: { data, values },
            });
          }}
          isLoading={false}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

