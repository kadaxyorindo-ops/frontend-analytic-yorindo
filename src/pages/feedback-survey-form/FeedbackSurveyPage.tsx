import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useForm,
  type DefaultValues,
  type FieldPath,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SURVEY_PAGE = {
  eyebrow: "Post-event feedback",
  title: "Thank you for joining us",
  description:
    "Your answers help us improve content, speakers, and the overall experience. This form takes about two minutes.",
  fallbackEventName: "Yorindo Event",
} as const;

const RATING_OPTIONS = ["1", "2", "3", "4", "5"] as const;

function humanizeSlug(raw: string) {
  const decoded = decodeURIComponent(raw);
  return decoded
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

const ratingSchema = z.enum(RATING_OPTIONS, {
  message: "Please choose a score from 1 to 5",
});

const surveySchema = z.object({
  satisfaction: ratingSchema,
  expectationMatch: ratingSchema,
  aspects: z.object({
    content: ratingSchema,
    speaker: ratingSchema,
    flow: ratingSchema,
    platform: ratingSchema,
  }),
  joinFuture: z.enum(["yes", "no"], {
    message: "Please select Yes or No",
  }),
  openFeedback: z
    .string()
    .trim()
    .max(2000, "Please keep feedback under 2000 characters")
    .optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

const defaultValues: DefaultValues<SurveyFormValues> = {
  satisfaction: undefined,
  expectationMatch: undefined,
  aspects: {
    content: undefined,
    speaker: undefined,
    flow: undefined,
    platform: undefined,
  },
  joinFuture: undefined,
  openFeedback: "",
};

const ASPECT_ROWS: Array<{ key: keyof SurveyFormValues["aspects"]; label: string }> = [
  { key: "content", label: "Content quality" },
  { key: "speaker", label: "Speaker / presenter" },
  { key: "flow", label: "Event flow & pacing" },
  { key: "platform", label: "Platform / venue / logistics" },
];

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
        {number}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function ScaleField({
  label,
  required,
  name,
  register,
  error,
}: {
  label: string;
  required?: boolean;
  name: FieldPath<SurveyFormValues>;
  register: UseFormRegister<SurveyFormValues>;
  error?: string;
}) {
  return (
    <fieldset className="space-y-2 md:col-span-2">
      <Label className="text-base font-semibold tracking-wider uppercase text-slate-500">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </Label>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {RATING_OPTIONS.map((value) => (
          <label key={value} className="group cursor-pointer">
            <input
              type="radio"
              value={value}
              className="peer sr-only"
              {...register(name)}
            />
            <span className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-100/80 text-base font-semibold text-slate-900 ring-1 ring-transparent transition group-hover:bg-slate-100 peer-checked:bg-[#F4A11A] peer-checked:text-slate-900 peer-checked:ring-[#F4A11A]/40 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500">
              {value}
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <span>Low</span>
        <span>High</span>
      </div>
      {error ? (
        <p className="mt-1 text-base leading-relaxed text-red-600">{error}</p>
      ) : null}
    </fieldset>
  );
}

export default function FeedbackSurveyPage() {
  const [thanksOpen, setThanksOpen] = useState(false);
  const { slug } = useParams<{ slug?: string }>();
  const eventTitle = slug ? humanizeSlug(slug) : SURVEY_PAGE.fallbackEventName;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    mode: "onBlur",
    defaultValues,
  });

  const onSubmit = (values: SurveyFormValues) => {
    console.log("[FeedbackSurvey] submit", values);
    setThanksOpen(true);
    reset(defaultValues);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <header className="overflow-hidden rounded-3xl bg-[#001128] text-white">
          <div className="p-10">
            <div className="text-base font-semibold uppercase tracking-wide text-[#855300]">
              {SURVEY_PAGE.eyebrow}
            </div>
            <h1 className="mt-3 text-4xl font-extrabold">
              {SURVEY_PAGE.title} on {eventTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-[#B7C6E1]">
              {SURVEY_PAGE.description}
            </p>
          </div>
        </header>

        <Dialog open={thanksOpen} onOpenChange={setThanksOpen}>
          <DialogContent className="w-[min(92vw,520px)] max-w-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-sans text-xl leading-tight">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Thank you</span>
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 font-sans text-lg leading-relaxed text-green-800">
              Your feedback has been recorded on this device. (No data was sent to a server.)
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => setThanksOpen(false)}>
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="w-full rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-7 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              <section className="space-y-5">
                <SectionHeader number="01" title="Overall experience" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ScaleField
                    label="How satisfied were you with the event?"
                    required
                    name="satisfaction"
                    register={register}
                    error={errors.satisfaction?.message}
                  />
                  <ScaleField
                    label="How well did the event match your expectations?"
                    required
                    name="expectationMatch"
                    register={register}
                    error={errors.expectationMatch?.message}
                  />
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeader number="02" title="Event aspects (1 = poor, 5 = excellent)" />
                <div className="grid grid-cols-1 gap-6">
                  {ASPECT_ROWS.map((row) => (
                    <ScaleField
                      key={row.key}
                      label={row.label}
                      required
                      name={`aspects.${row.key}`}
                      register={register}
                      error={errors.aspects?.[row.key]?.message}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <SectionHeader number="03" title="Future participation" />
                <fieldset className="space-y-2 md:col-span-2">
                  <Label className="text-base font-semibold tracking-wider uppercase text-slate-500">
                    Would you join our future events?
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-lg">
                      <input type="radio" value="yes" {...register("joinFuture")} />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-lg">
                      <input type="radio" value="no" {...register("joinFuture")} />
                      No
                    </label>
                  </div>
                  {errors.joinFuture?.message ? (
                    <p className="mt-1 text-base leading-relaxed text-red-600">
                      {errors.joinFuture.message}
                    </p>
                  ) : null}
                </fieldset>
              </section>

              <section className="space-y-5">
                <SectionHeader number="04" title="Additional comments" />
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-base font-semibold tracking-wider uppercase text-slate-500">
                    Open-ended feedback
                    <span className="ml-1 text-slate-400">(optional)</span>
                  </Label>
                  <textarea
                    rows={4}
                    placeholder="What went well? What could we improve?"
                    {...register("openFeedback")}
                    className={`w-full min-h-[140px] rounded-lg border px-3 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100/80 ${
                      errors.openFeedback
                        ? "border border-red-500"
                        : "border border-transparent"
                    }`}
                  />
                  {errors.openFeedback?.message ? (
                    <p className="mt-1 text-base leading-relaxed text-red-600">
                      {errors.openFeedback.message}
                    </p>
                  ) : null}
                </div>
              </section>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#F4A11A] px-6 py-2 font-semibold text-slate-900 hover:bg-[#e49310]"
                >
                  Submit feedback →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
