// Thai Buddhist Date & Time Utilities for MCU Council RSVP
// Organization: Mahachulalongkornrajavidyalaya University (มจร.)

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_DAYS = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

/**
 * Converts a Gregorian year to Thai Buddhist Era year (พ.ศ.)
 */
export function toBuddhistYear(year: number): number {
  return year + 543;
}

/**
 * Converts a Buddhist Era year (พ.ศ.) to Gregorian year (ค.ศ.)
 */
export function toGregorianYear(beYear: number): number {
  return beYear - 543;
}

/**
 * Parses date safely
 */
export function parseDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats date into Thai standard: "24 กันยายน 2569"
 */
export function formatThaiDate(dateInput: string | Date | null | undefined, options?: { showDayOfWeek?: boolean }): string {
  const d = parseDate(dateInput);
  if (!d) return '-';

  const day = d.getDate();
  const month = THAI_MONTHS_FULL[d.getMonth()];
  const beYear = toBuddhistYear(d.getFullYear());

  if (options?.showDayOfWeek) {
    const dayOfWeek = THAI_DAYS[d.getDay()];
    return `${dayOfWeek}ที่ ${day} ${month} ${beYear}`;
  }

  return `${day} ${month} ${beYear}`;
}

/**
 * Formats date into Short Thai: "24 ก.ย. 2569"
 */
export function formatThaiDateShort(dateInput: string | Date | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '-';

  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const beYear = toBuddhistYear(d.getFullYear());

  return `${day} ${month} ${beYear}`;
}

/**
 * Formats time: "09:30 น."
 */
export function formatThaiTime(timeOrDateInput: string | Date | null | undefined): string {
  if (!timeOrDateInput) return '-';
  if (typeof timeOrDateInput === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeOrDateInput)) {
    const [hh, mm] = timeOrDateInput.split(':');
    return `${hh}:${mm} น.`;
  }

  const d = parseDate(timeOrDateInput);
  if (!d) return '-';

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm} น.`;
}

/**
 * Formats full datetime: "24 ก.ย. 2569 เวลา 09:30 น."
 */
export function formatThaiDateTime(dateInput: string | Date | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '-';
  return `${formatThaiDateShort(d)} เวลา ${formatThaiTime(d)}`;
}

/**
 * Generates array of Buddhist Era years for selection (e.g. 2567 to 2572)
 */
export function getBuddhistYearOptions(spanPast = 2, spanFuture = 3): number[] {
  const currentBe = toBuddhistYear(new Date().getFullYear());
  const years: number[] = [];
  for (let y = currentBe - spanPast; y <= currentBe + spanFuture; y++) {
    years.push(y);
  }
  return years;
}

/**
 * Returns relative time in Thai e.g. "อีก 3 วัน", "เมื่อวานนี้"
 */
export function getThaiRelativeTime(dateInput: string | Date | null | undefined): string {
  const target = parseDate(dateInput);
  if (!target) return '-';

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs > 0) {
    if (diffHours < 24) return `อีก ${diffHours} ชั่วโมง`;
    if (diffDays === 1) return 'วันพรุ่งนี้';
    return `อีก ${diffDays} วัน`;
  } else {
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    if (absHours < 24) return `${absHours} ชั่วโมงที่แล้ว`;
    if (absDays === 1) return 'เมื่อวานนี้';
    return `${absDays} วันที่แล้ว`;
  }
}
