import { describe, it, expect } from 'vitest';
import {
  calculateQuorum,
  canDelegateCountAsQuorum,
  validateMeetingDates,
} from './quorum';

describe('Quorum & Business Invariant Utilities', () => {
  describe('calculateQuorum - more_than_half rule', () => {
    it('calculates quorum correctly for even number of eligible members', () => {
      // 10 members: half is 5, more than half is 6
      const result5 = calculateQuorum({
        totalEligible: 10,
        quorumAttendedCount: 5,
        quorumRule: 'more_than_half',
      });
      expect(result5.minimumRequired).toBe(6);
      expect(result5.isQuorumReached).toBe(false);

      const result6 = calculateQuorum({
        totalEligible: 10,
        quorumAttendedCount: 6,
        quorumRule: 'more_than_half',
      });
      expect(result6.isQuorumReached).toBe(true);
      expect(result6.percentage).toBe(60);
    });

    it('calculates quorum correctly for odd number of eligible members', () => {
      // 11 members: floor(11/2) + 1 = 6
      const result = calculateQuorum({
        totalEligible: 11,
        quorumAttendedCount: 6,
        quorumRule: 'more_than_half',
      });
      expect(result.minimumRequired).toBe(6);
      expect(result.isQuorumReached).toBe(true);
    });
  });

  describe('calculateQuorum - not_less_than_half rule', () => {
    it('calculates quorum correctly for not_less_than_half', () => {
      // 10 members: half is 5, not less than half is 5
      const result = calculateQuorum({
        totalEligible: 10,
        quorumAttendedCount: 5,
        quorumRule: 'not_less_than_half',
      });
      expect(result.minimumRequired).toBe(5);
      expect(result.isQuorumReached).toBe(true);

      // 11 members: ceil(11/2) = 6
      const resultOdd = calculateQuorum({
        totalEligible: 11,
        quorumAttendedCount: 5,
        quorumRule: 'not_less_than_half',
      });
      expect(resultOdd.minimumRequired).toBe(6);
      expect(resultOdd.isQuorumReached).toBe(false);
    });
  });

  describe('calculateQuorum - custom_count and chairperson rule', () => {
    it('respects custom threshold', () => {
      const result = calculateQuorum({
        totalEligible: 20,
        quorumAttendedCount: 12,
        quorumRule: 'custom_count',
        customThreshold: 15,
      });
      expect(result.minimumRequired).toBe(15);
      expect(result.isQuorumReached).toBe(false);
    });

    it('requires chairperson when required flag is true', () => {
      // Count is enough (8/10), but chairperson is absent
      const absentChair = calculateQuorum({
        totalEligible: 10,
        quorumAttendedCount: 8,
        quorumRule: 'more_than_half',
        requiresChairperson: true,
        isChairpersonPresent: false,
      });
      expect(absentChair.isQuorumReached).toBe(false);

      // Count is enough and chairperson is present
      const presentChair = calculateQuorum({
        totalEligible: 10,
        quorumAttendedCount: 8,
        quorumRule: 'more_than_half',
        requiresChairperson: true,
        isChairpersonPresent: true,
      });
      expect(presentChair.isQuorumReached).toBe(true);
    });

    it('handles zero or empty eligible list safely', () => {
      const zero = calculateQuorum({
        totalEligible: 0,
        quorumAttendedCount: 0,
        quorumRule: 'more_than_half',
      });
      expect(zero.isQuorumReached).toBe(false);
      expect(zero.percentage).toBe(0);
    });
  });

  describe('canDelegateCountAsQuorum (Cardinal Invariant 2)', () => {
    it('returns false by default if request is null or pending', () => {
      expect(canDelegateCountAsQuorum(null)).toBe(false);
      expect(canDelegateCountAsQuorum(undefined)).toBe(false);
      expect(canDelegateCountAsQuorum({ status: 'pending', canCountAsQuorum: false })).toBe(false);
      expect(canDelegateCountAsQuorum({ status: 'pending', canCountAsQuorum: true })).toBe(false);
    });

    it('returns false if approved without quorum rights', () => {
      expect(canDelegateCountAsQuorum({ status: 'approved', canCountAsQuorum: false })).toBe(false);
    });

    it('returns true ONLY if approved and explicitly granted quorum rights by secretary', () => {
      expect(canDelegateCountAsQuorum({ status: 'approved', canCountAsQuorum: true })).toBe(true);
    });
  });

  describe('validateMeetingDates (Cardinal Invariant 6)', () => {
    it('accepts deadline that is before meeting date and start time', () => {
      const res = validateMeetingDates('2026-09-24', '09:30', '2026-09-22T17:00:00');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects deadline that is equal to or after meeting date and start time', () => {
      const resSame = validateMeetingDates('2026-09-24', '09:30', '2026-09-24T09:30:00');
      expect(resSame.isValid).toBe(false);
      expect(resSame.error).toContain('วันและเวลาปิดรับการตอบรับต้องอยู่ก่อนวันและเวลาเริ่มการประชุมเสมอ');

      const resAfter = validateMeetingDates('2026-09-24', '09:30', '2026-09-24T10:00:00');
      expect(resAfter.isValid).toBe(false);
    });

    it('handles invalid or empty inputs gracefully', () => {
      const resEmpty = validateMeetingDates('', '', '');
      expect(resEmpty.isValid).toBe(false);
    });
  });
});
