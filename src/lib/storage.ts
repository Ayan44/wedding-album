export const GUEST_NAME_KEY = "wedding_guest_name";

export function getStoredGuestName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GUEST_NAME_KEY) || "";
}

export function setStoredGuestName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_NAME_KEY, name.trim());
}

export function clearStoredGuestName(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_NAME_KEY);
}
