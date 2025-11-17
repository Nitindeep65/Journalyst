export function isTokenExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt);
  const currentDate = new Date();
  return expiryDate < currentDate;
}

export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

export function getEndOfDayExpiry(): string {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
}

export function getExpiryWithOffset(hours: number): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry.toISOString();
}
