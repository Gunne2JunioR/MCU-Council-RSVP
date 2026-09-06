// MCU Council RSVP - Types Definition

export type UserRole = 'super_admin' | 'staff' | 'secretary' | 'chairperson' | 'member' | 'delegate';

export interface UserProfile {
  id: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  organization: string;
  position: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Committee {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string;
  defaultQuorumRule: 'more_than_half' | 'not_less_than_half' | 'custom_count' | 'chairperson_required';
  defaultQuorumCustomCount?: number;
  isActive: boolean;
}

export interface CommitteeMember {
  id: string;
  committeeId: string;
  profileId: string;
  memberCode: string;
  committeeRole: string; // เช่น นายกสภาฯ, อธิการบดี, กรรมการสภาฯ ผู้ทรงคุณวุฒิ
  hasQuorumRights: boolean;
  hasVotingRights: boolean;
  termStartDate: string;
  termEndDate: string;
  isActive: boolean;
  notes?: string;
  profile?: UserProfile;
}

export type MeetingType = 'regular' | 'special' | 'urgent';
export type MeetingFormat = 'Onsite' | 'Online' | 'Hybrid';
export type MeetingStatus = 'draft' | 'rsvp_open' | 'rsvp_closed' | 'in_progress' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  committeeId: string;
  committeeName?: string;
  title: string;
  meetingNumber: string; // เช่น "8/2569"
  beYear: number; // 2569
  meetingType: MeetingType;
  meetingFormat: MeetingFormat;
  meetingDate: string; // ISO string "YYYY-MM-DD"
  startTime: string; // "09:30"
  endTime: string; // "16:30"
  rsvpOpenAt: string; // ISO datetime
  rsvpDeadline: string; // ISO datetime
  venue: string;
  onlinePlatform?: string;
  onlineUrl?: string;
  onlineMeetingId?: string;
  onlinePasscode?: string;
  onlineInstructions?: string;
  status: MeetingStatus;
  description?: string;
  invitationTemplate?: string;
  notificationChannels: ('email' | 'line' | 'link')[];
  sendImmediateInvitation?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingDocument {
  id: string;
  meetingId: string;
  docType: 'invitation' | 'agenda' | 'minute' | 'appendix' | 'other';
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // bytes
  isConfidential?: boolean;
  uploadedBy?: string;
  createdAt: string;
}

export type InviteeType = 'member' | 'attendee' | 'presenter' | 'observer';
export type RSVPStatus = 'pending' | 'attend' | 'leave' | 'cannot_attend' | 'delegate';
export type AttendanceFormat = 'Onsite' | 'Online';

export interface MeetingInvitee {
  id: string;
  meetingId: string;
  profileId?: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  inviteeType: InviteeType;
  hasQuorumRights: boolean;
  hasVotingRights: boolean;
  personalToken: string;
  tokenExpiresAt: string;
  isTokenRevoked: boolean;
  invitationSentAt?: string;
  lastRemindedAt?: string;
  rsvpStatus: RSVPStatus;
  createdAt: string;
  updatedAt: string;

  // Joined/Attached data
  response?: RSVPResponse;
  delegateRequest?: DelegateRequest;
  leaveRequest?: LeaveRequest;
  attendance?: AttendanceLog;
}

export interface RSVPResponse {
  id: string;
  meetingInviteeId: string;
  status: RSVPStatus;
  attendanceFormat?: AttendanceFormat;
  updatedPhone?: string;
  updatedEmail?: string;
  reason?: string;
  dietaryPreferences?: string;
  checkinQrCodeRef: string;
  isAcknowledgedPdpa: boolean;
  submittedAt: string;
  isDraft: boolean;
}

export type ApprovalStatus = 'pending' | 'approved' | 'acknowledged' | 'rejected' | 'info_requested';

export interface DelegateRequest {
  id: string;
  meetingInviteeId: string;
  delegateTitle: string;
  delegateName: string;
  delegatePosition: string;
  delegateOrganization: string;
  delegatePhone: string;
  delegateEmail: string;
  attendanceFormat: AttendanceFormat;
  reason: string;
  documentUrl?: string;
  documentName?: string;
  status: ApprovalStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  canCountAsQuorum: boolean; // default false
  canVote: boolean; // default false
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  meetingInviteeId: string;
  leaveType: 'leave' | 'cannot_attend';
  reason: string;
  documentUrl?: string;
  documentName?: string;
  status: ApprovalStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CheckInMethod = 'qr_code' | 'staff_manual' | 'online_link';

export interface AttendanceLog {
  id: string;
  meetingId: string;
  meetingInviteeId: string;
  actualFormat: AttendanceFormat;
  checkInTime: string; // ISO datetime
  checkOutTime?: string;
  checkInMethod: CheckInMethod;
  isDelegate: boolean;
  delegateRequestId?: string;
  countsForQuorum: boolean;
  notes?: string; // เช่น มาสาย, ออกก่อน, มอบหมายผู้แทน
  checkedInBy?: string;
  createdAt: string;
}

export type QuorumRuleType = 'more_than_half' | 'not_less_than_half' | 'custom_count' | 'chairperson_required';

export interface QuorumRule {
  id: string;
  meetingId: string;
  ruleType: QuorumRuleType;
  customCount?: number;
  requiresChairperson: boolean;
  allowDelegateQuorum: boolean;
  notes?: string;
}

export interface QuorumLog {
  id: string;
  meetingId: string;
  timestamp: string;
  totalEligibleMembers: number;
  minimumRequired: number;
  currentAttended: number;
  onsiteCount: number;
  onlineCount: number;
  leaveCount: number;
  isQuorumReached: boolean;
  certifiedBy?: string;
  certifiedByName?: string;
  certifiedAt?: string;
  certificationStatus: 'unverified' | 'certified' | 'adjourned';
  notes?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  meetingId?: string;
  title: string;
  message: string;
  type: 'meeting_invitation' | 'rsvp_reminder' | 'review_approved' | 'review_rejected' | 'quorum_certified' | 'system_alert';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemSettings {
  defaultVenue: string;
  invitationEmailTemplate: string;
  defaultQuorumRule: QuorumRuleType;
  tokenExpiryDays: number;
  allowSelfRegistration: boolean;
  lineNotifyEnabled: boolean;
}
