/**
 * Turn API error bodies (often JSON strings) into a readable message.
 */
export function parseSubmitErrorMessage(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return "Failed to submit registration.";
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as { message?: unknown };
      if (parsed?.message != null) return String(parsed.message);
    } catch {
      // fall through
    }
  }
  return trimmed;
}

/**
 * Detect duplicate email/phone style errors from backend message text (any language).
 */
export function isDuplicateRegistrationError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    message.includes("sudah terdaftar") ||
    lower.includes("already registered") ||
    lower.includes("email already") ||
    lower.includes("phone already") ||
    lower.includes("phone number already")
  );
}

export const DUPLICATE_REGISTRATION_TITLE =
  "This email or phone number is already registered for this event.";

export const DUPLICATE_REGISTRATION_DESCRIPTION =
  "You cannot submit a registration using the same email or phone number as an existing registration for this event.";
