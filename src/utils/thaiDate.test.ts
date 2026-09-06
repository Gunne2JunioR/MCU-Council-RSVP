import { describe, it, expect } from 'vitest';
import {
  toBuddhistYear,
  toGregorianYear,
  parseDate,
  formatThaiDate,
  formatThaiDateShort,
  formatThaiTime,
  formatThaiDateTime,
  getBuddhistYearOptions,
  getThaiRelativeTime,
} from './thaiDate';

describe('thaiDate Utilities', () => {
  describe('Buddhist Era Conversions', () => {
    it('converts Gregorian year to Buddhist year correctly (+543)', () => {
      expect(toBuddhistYear(2024)).toBe(2567);
      expect(toBuddhistYear(2025)).toBe(2568);
      expect(toBuddhistYear(2026)).toBe(2569);
      expect(toBuddhistYear(2000)).toBe(2543);
    });

    it('converts Buddhist year to Gregorian year correctly (-543)', () => {
      expect(toGregorianYear(2567)).toBe(2024);
      expect(toGregorianYear(2568)).toBe(2025);
      expect(toGregorianYear(2569)).toBe(2026);
    });
  });

  describe('parseDate', () => {
    it('returns null for null, undefined or empty string', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('parses valid ISO date strings', () => {
      const date = parseDate('2026-09-24T09:30:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getUTCFullYear()).toBe(2026);
    });

    it('returns null for invalid date string', () => {
      expect(parseDate('invalid-date-string')).toBeNull();
    });
  });

  describe('formatThaiDate', () => {
    it('formats date into standard Thai full month and Buddhist year', () => {
      // 2026-09-24 -> 24 กันยายน 2569
      const result = formatThaiDate('2026-09-24T09:30:00');
      expect(result).toBe('24 กันยายน 2569');
    });

    it('formats date with day of week option', () => {
      // 2026-09-24 is Thursday (วันพฤหัสบดี)
      const result = formatThaiDate('2026-09-24T09:30:00', { showDayOfWeek: true });
      expect(result).toContain('วันพฤหัสบดีที่ 24 กันยายน 2569');
    });

    it('returns "-" for invalid or null dates', () => {
      expect(formatThaiDate(null)).toBe('-');
      expect(formatThaiDate(undefined)).toBe('-');
      expect(formatThaiDate('invalid')).toBe('-');
    });
  });

  describe('formatThaiDateShort', () => {
    it('formats date into abbreviated Thai month', () => {
      const result = formatThaiDateShort('2026-09-24T09:30:00');
      expect(result).toBe('24 ก.ย. 2569');
    });
  });

  describe('formatThaiTime', () => {
    it('formats time string (HH:mm) with น. suffix', () => {
      expect(formatThaiTime('09:30')).toBe('09:30 น.');
      expect(formatThaiTime('13:45:00')).toBe('13:45 น.');
    });

    it('returns "-" for invalid time input', () => {
      expect(formatThaiTime(null)).toBe('-');
      expect(formatThaiTime('')).toBe('-');
    });
  });

  describe('formatThaiDateTime', () => {
    it('combines short date and time properly', () => {
      const formatted = formatThaiDateTime('2026-09-24T09:30:00');
      expect(formatted).toContain('24 ก.ย. 2569');
      expect(formatted).toContain('เวลา');
      expect(formatted).toContain('น.');
    });
  });

  describe('getBuddhistYearOptions', () => {
    it('returns an array of Buddhist Era years spanning past and future', () => {
      const years = getBuddhistYearOptions(2, 3);
      const currentBe = new Date().getFullYear() + 543;
      expect(years).toHaveLength(6); // -2, -1, 0, 1, 2, 3 = 6
      expect(years).toContain(currentBe);
      expect(years[0]).toBe(currentBe - 2);
      expect(years[years.length - 1]).toBe(currentBe + 3);
    });
  });

  describe('getThaiRelativeTime', () => {
    it('handles relative time formatting', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const relative = getThaiRelativeTime(tomorrow);
      expect(typeof relative).toBe('string');
      expect(relative.length).toBeGreaterThan(0);
    });
  });
});
