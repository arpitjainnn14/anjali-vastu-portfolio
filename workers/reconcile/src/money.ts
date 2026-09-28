/** Amounts in ₹, Indian digit grouping. Paise in, rupees out. */

function indianGroup(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

export function rupees(paise: number): string {
  const whole = Math.floor(paise / 100);
  const fraction = paise % 100;
  return `₹${indianGroup(whole)}${fraction ? `.${String(fraction).padStart(2, '0')}` : ''}`;
}
