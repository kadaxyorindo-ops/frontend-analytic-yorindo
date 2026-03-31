import { startTransition, useEffect, useState, type FormEvent } from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { OtpInput } from "@/components/auth/OtpInput";

const EMPTY_OTP = ["", "", "", "", "", ""];

export function Login() {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresInSeconds, setOtpExpiresInSeconds] = useState(300);

  const otpValue = otpDigits.join("");

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((currentValue) => currentValue - 1);
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    const normalizedEmail = emailInput.trim().toLowerCase();

    setEmailError("");
    setOtpError("");
    setFeedbackMessage("");

    if (!normalizedEmail) {
      setEmailError("Masukkan email kantor Anda terlebih dahulu.");
      return;
    }

    setIsSendingCode(true);

    const result = await requestOtp(normalizedEmail);
    setIsSendingCode(false);

    if (!result.ok) {
      setEmailError(result.message);
      return;
    }

    setSubmittedEmail(normalizedEmail);
    setStep("otp");
    setOtpDigits([...EMPTY_OTP]);
    setFeedbackMessage(result.message);
    setOtpExpiresInSeconds(result.data?.expiresInSeconds ?? 300);
    setResendCooldown(result.data?.resendAvailableInSeconds ?? 60);
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setOtpError("");
    setFeedbackMessage("");

    if (otpValue.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP yang Anda terima.");
      return;
    }

    setIsVerifying(true);
    const result = await verifyOtp(submittedEmail, otpValue);
    setIsVerifying(false);

    if (!result.ok) {
      setOtpError(result.message);
      return;
    }

    startTransition(() => {
      navigate("/events", { replace: true });
    });
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingCode) {
      return;
    }

    setIsSendingCode(true);
    setOtpError("");
    setFeedbackMessage("");

    const result = await requestOtp(submittedEmail);
    setIsSendingCode(false);

    if (!result.ok) {
      setOtpError(result.message);
      return;
    }

    setOtpDigits([...EMPTY_OTP]);
    setFeedbackMessage("Kode OTP baru sudah dikirim. Silakan cek inbox Anda.");
    setOtpExpiresInSeconds(result.data?.expiresInSeconds ?? 300);
    setResendCooldown(result.data?.resendAvailableInSeconds ?? 60);
  };

  return (
    <AuthLayout>
      <div className="space-y-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 shadow-sm md:p-10">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            Yorindo EMS
          </p>
          <h2 className="text-3xl font-bold text-slate-800">
            Login dengan OTP Email
          </h2>
          <p className="font-mono text-sm text-slate-500">
            Masukkan email kantor Anda untuk menerima kode verifikasi 6 digit.
          </p>
        </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 font-bold tracking-widest text-slate-400">
                {step === "email" ? "Request OTP" : "Verify OTP"}
              </span>
            </div>
          </div>

          {feedbackMessage ? (
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedbackMessage}
            </div>
          ) : null}

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Professional Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    autoFocus
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    placeholder="nama@yorindo.co.id"
                    className="h-12 border-dashed bg-slate-50 pl-4 pr-11 font-mono text-sm text-slate-700"
                  />
                  <div className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm border border-dashed border-slate-400">
                    <span className="text-[10px] text-slate-400">✉</span>
                  </div>
                </div>
                {emailError ? (
                  <p className="text-sm text-rose-600">{emailError}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSendingCode}
                className="h-12 w-full border-2 border-dashed border-slate-400 bg-slate-200 font-bold text-slate-700 hover:bg-slate-300"
              >
                {isSendingCode ? "Mengirim kode..." : "Kirim Kode Verifikasi"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Tujuan OTP
                </label>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-600">
                  {submittedEmail}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  6-Digit Code
                </label>
                <OtpInput
                  value={otpDigits}
                  onChange={setOtpDigits}
                  disabled={isVerifying}
                />
                {otpError ? (
                  <p className="text-sm text-rose-600">{otpError}</p>
                ) : (
                  <p className="text-sm font-mono text-slate-400">
                    Kode berlaku{" "}
                    {Math.ceil(otpExpiresInSeconds / 60)} menit dan hanya bisa
                    dipakai sekali.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isVerifying}
                className="h-12 w-full border-2 border-dashed border-slate-400 bg-slate-800 font-bold text-white hover:bg-slate-700"
              >
                {isVerifying ? "Memverifikasi..." : "Login ke Dashboard"}
              </Button>

              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtpDigits([...EMPTY_OTP]);
                    setOtpError("");
                    setFeedbackMessage("");
                  }}
                  className="font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                >
                  Ganti email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isSendingCode}
                  className="font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  {resendCooldown > 0
                    ? `Kirim ulang dalam ${resendCooldown}s`
                    : isSendingCode
                      ? "Mengirim..."
                      : "Kirim ulang kode"}
                </button>
              </div>
            </form>
          )}

        <div className="text-center text-sm font-mono text-slate-500 pt-2">
          Akses login diberikan oleh admin internal Yorindo.
        </div>
      </div>
    </AuthLayout>
  );
}
