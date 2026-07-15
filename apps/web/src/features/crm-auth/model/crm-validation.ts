export const CRM_LOGIN_RE = /^[a-zA-Z0-9._-]{3,32}$/;
export const CRM_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasValidCrmNamePart(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 || /^[\p{L}\s'-]{2,40}$/u.test(trimmed);
}
