export const STUDENT_SELECTION_COOKIE = "sms_selected_student";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function readSelectedStudentId(): string | null {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${STUDENT_SELECTION_COOKIE}=`));

  if (!entry) return null;

  return decodeURIComponent(entry.slice(STUDENT_SELECTION_COOKIE.length + 1)) || null;
}

export function writeSelectedStudentId(studentId: string | null): void {
  if (typeof document === "undefined") return;

  const value = studentId
    ? `${STUDENT_SELECTION_COOKIE}=${encodeURIComponent(studentId)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
    : `${STUDENT_SELECTION_COOKIE}=; path=/; max-age=0; samesite=lax`;

  document.cookie = value;
}
