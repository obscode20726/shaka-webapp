/** Normalize input to a 10-digit Rwandan mobile like 0781234567. */
export function normalizeRwandanMobileDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("250") && d.length >= 12) {
    d = `0${d.slice(3, 12)}`;
  }
  if (d.length === 9 && /^7[2389]/.test(d)) {
    d = `0${d}`;
  }
  return d;
}

export function isValidRwandanMobile(input: string): boolean {
  const d = normalizeRwandanMobileDigits(input);
  return /^0(72|73|78|79)\d{7}$/.test(d);
}

/** Same convention as provider auth: login identifier stored as this synthetic email. */
export function authEmailFromPhone(input: string): string {
  return `${normalizeRwandanMobileDigits(input)}@shaka.com`;
}
