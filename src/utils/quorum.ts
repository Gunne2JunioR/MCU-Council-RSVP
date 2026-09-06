import { QuorumRuleType } from '../types';

export interface QuorumCalculationParams {
  totalEligible: number;
  quorumAttendedCount: number;
  quorumRule: QuorumRuleType;
  customThreshold?: number;
  requiresChairperson?: boolean;
  isChairpersonPresent?: boolean;
}

export interface QuorumCalculationResult {
  totalEligible: number;
  minimumRequired: number;
  quorumAttendedCount: number;
  isChairpersonPresent: boolean;
  isQuorumReached: boolean;
  percentage: number;
}

/**
 * Calculates council quorum according to MCU council meeting regulations.
 * Supports:
 * - 'more_than_half': เกินกึ่งหนึ่ง (floor(N/2) + 1)
 * - 'not_less_than_half': ไม่น้อยกว่ากึ่งหนึ่ง (ceil(N/2))
 * - 'custom_count': จำนวนระบุเฉพาะ
 * - 'chairperson_required': ต้องมีประธาน/นายกสภาฯ ร่วมด้วยเสมอ
 */
export function calculateQuorum({
  totalEligible,
  quorumAttendedCount,
  quorumRule,
  customThreshold,
  requiresChairperson = false,
  isChairpersonPresent = true,
}: QuorumCalculationParams): QuorumCalculationResult {
  let minimumRequired = 1;

  if (totalEligible <= 0) {
    return {
      totalEligible: 0,
      minimumRequired: 0,
      quorumAttendedCount: 0,
      isChairpersonPresent: isChairpersonPresent ?? true,
      isQuorumReached: false,
      percentage: 0,
    };
  }

  if (quorumRule === 'more_than_half') {
    minimumRequired = Math.floor(totalEligible / 2) + 1;
  } else if (quorumRule === 'not_less_than_half') {
    minimumRequired = Math.ceil(totalEligible / 2);
  } else if (quorumRule === 'custom_count') {
    minimumRequired = customThreshold && customThreshold > 0 ? customThreshold : Math.floor(totalEligible / 2) + 1;
  } else if (quorumRule === 'chairperson_required') {
    minimumRequired = Math.floor(totalEligible / 2) + 1;
  }

  const chairpersonSatisfied = (requiresChairperson || quorumRule === 'chairperson_required')
    ? Boolean(isChairpersonPresent)
    : true;

  const isQuorumReached = quorumAttendedCount >= minimumRequired && chairpersonSatisfied;
  const percentage = totalEligible > 0 ? Math.min(100, Math.round((quorumAttendedCount / totalEligible) * 100)) : 0;

  return {
    totalEligible,
    minimumRequired,
    quorumAttendedCount,
    isChairpersonPresent: isChairpersonPresent ?? true,
    isQuorumReached,
    percentage,
  };
}

/**
 * Invariant: Delegates CANNOT count as quorum automatically (must be false by default).
 * Only when secretary explicitly approves canCountAsQuorum in delegate request.
 */
export function canDelegateCountAsQuorum(delegateRequest?: { status: string; canCountAsQuorum?: boolean } | null): boolean {
  if (!delegateRequest) return false;
  if (delegateRequest.status !== 'approved') return false;
  return Boolean(delegateRequest.canCountAsQuorum);
}

/**
 * Invariant: RSVP deadline must be strictly before meeting date + start time.
 */
export function validateMeetingDates(
  meetingDate: string,
  startTime: string,
  rsvpDeadline: string
): { isValid: boolean; error?: string } {
  if (!meetingDate || !startTime || !rsvpDeadline) {
    return { isValid: false, error: 'กรุณาระบุวันประชุม เวลาเริ่ม และกำหนดเวลาตอบรับให้ครบถ้วน' };
  }

  // Format meeting date and start time to Date object
  // If meetingDate is YYYY-MM-DD and startTime is HH:mm or HH:mm:ss
  const normalizedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
  const meetingDateTime = new Date(`${meetingDate}T${normalizedStartTime}`);
  const deadlineDateTime = new Date(rsvpDeadline);

  if (isNaN(meetingDateTime.getTime()) || isNaN(deadlineDateTime.getTime())) {
    return { isValid: false, error: 'รูปแบบวันเวลาไม่ถูกต้อง' };
  }

  if (deadlineDateTime.getTime() >= meetingDateTime.getTime()) {
    return { isValid: false, error: 'วันและเวลาปิดรับการตอบรับต้องอยู่ก่อนวันและเวลาเริ่มการประชุมเสมอ' };
  }

  return { isValid: true };
}
