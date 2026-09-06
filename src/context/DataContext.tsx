import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Meeting,
  MeetingInvitee,
  MeetingDocument,
  Committee,
  CommitteeMember,
  AttendanceLog,
  AuditLog,
  AppNotification,
  SystemSettings,
  QuorumLog,
  RSVPResponse,
  DelegateRequest,
  LeaveRequest,
  ApprovalStatus,
  MeetingStatus,
  AttendanceFormat,
  CheckInMethod
} from '../types';
import {
  INITIAL_MEETINGS,
  INITIAL_INVITEES,
  INITIAL_COMMITTEES,
  INITIAL_COMMITTEE_MEMBERS,
  INITIAL_DOCUMENTS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface DataContextType {
  meetings: Meeting[];
  invitees: MeetingInvitee[];
  committees: Committee[];
  committeeMembers: CommitteeMember[];
  documents: MeetingDocument[];
  attendanceLogs: AttendanceLog[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: SystemSettings;
  quorumLogs: QuorumLog[];

  // Meeting actions
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, selectedMembers: string[], docs?: File[]) => string;
  updateMeeting: (meetingId: string, data: Partial<Meeting>) => void;
  deleteMeeting: (meetingId: string) => void;
  duplicateMeeting: (meetingId: string) => string;
  updateMeetingStatus: (meetingId: string, status: MeetingStatus) => void;

  // Invitee & RSVP actions
  getInviteesByMeeting: (meetingId: string) => MeetingInvitee[];
  getInviteeByToken: (token: string) => MeetingInvitee | undefined;
  submitRSVP: (
    inviteeId: string,
    response: Partial<RSVPResponse>,
    delegate?: Partial<DelegateRequest>,
    leave?: Partial<LeaveRequest>
  ) => boolean;

  // Review & Approval actions
  reviewDelegateRequest: (
    inviteeId: string,
    status: ApprovalStatus,
    notes: string,
    canCountAsQuorum: boolean,
    canVote: boolean
  ) => void;
  reviewLeaveRequest: (inviteeId: string, status: ApprovalStatus, notes: string) => void;

  // Attendance & Quorum actions
  checkInInvitee: (
    meetingId: string,
    inviteeId: string,
    format: AttendanceFormat,
    method: CheckInMethod,
    notes?: string
  ) => void;
  checkOutInvitee: (meetingId: string, inviteeId: string) => void;
  certifyQuorum: (meetingId: string, notes?: string) => void;

  // Member Management
  addCommitteeMember: (data: Partial<CommitteeMember>) => void;
  updateCommitteeMember: (memberId: string, data: Partial<CommitteeMember>) => void;
  deleteCommitteeMember: (memberId: string) => void;
  importCommitteeMembers: (imported: Partial<CommitteeMember>[]) => void;

  // Settings & Notifications
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  sendMeetingReminders: (meetingId: string, inviteeIds?: string[]) => number;
  markNotificationAsRead: (notifId: string) => void;
  resetToDefaultSeed: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_PREFIX = 'mcu_council_v2_';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Helper to load from localStorage
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.warn(`Error loading ${key} from storage`, e);
      return defaultVal;
    }
  };

  const [meetings, setMeetings] = useState<Meeting[]>(() => loadStored('meetings', INITIAL_MEETINGS));
  const [invitees, setInvitees] = useState<MeetingInvitee[]>(() => loadStored('invitees', INITIAL_INVITEES));
  const [committees, setCommittees] = useState<Committee[]>(() => loadStored('committees', INITIAL_COMMITTEES));
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => loadStored('committee_members', INITIAL_COMMITTEE_MEMBERS));
  const [documents, setDocuments] = useState<MeetingDocument[]>(() => loadStored('documents', INITIAL_DOCUMENTS));
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => loadStored('attendance_logs', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('audit_logs', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored('notifications', INITIAL_NOTIFICATIONS));
  const [settings, setSettings] = useState<SystemSettings>(() => loadStored('settings', INITIAL_SETTINGS));
  const [quorumLogs, setQuorumLogs] = useState<QuorumLog[]>(() => loadStored('quorum_logs', []));

  // Sync state to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'meetings', JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'invitees', JSON.stringify(invitees)); }, [invitees]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'committees', JSON.stringify(committees)); }, [committees]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'committee_members', JSON.stringify(committeeMembers)); }, [committeeMembers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'attendance_logs', JSON.stringify(attendanceLogs)); }, [attendanceLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'quorum_logs', JSON.stringify(quorumLogs)); }, [quorumLogs]);

  // Audit Log helper
  const addAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: currentUser?.id,
      userName: `${currentUser?.title || ''}${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'เจ้าหน้าที่สำนักงานสภาฯ',
      userRole: currentUser?.role || 'staff',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. Add Meeting
  const addMeeting = (
    meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    selectedMembers: string[]
  ): string => {
    const newMeetingId = 'meet-' + Date.now();
    const newMeeting: Meeting = {
      ...meetingData,
      id: newMeetingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'user-staff'
    };

    setMeetings(prev => [newMeeting, ...prev]);

    // Create invitees from selected committee members
    const newInvitees: MeetingInvitee[] = [];
    selectedMembers.forEach((memberId, idx) => {
      const member = committeeMembers.find(cm => cm.id === memberId);
      if (member) {
        const p = member.profile;
        newInvitees.push({
          id: `inv-${Date.now()}-${idx}`,
          meetingId: newMeetingId,
          profileId: member.profileId,
          title: p?.title || '',
          firstName: p?.firstName || '',
          lastName: p?.lastName || '',
          email: p?.email || '',
          phone: p?.phone || '',
          organization: p?.organization || '',
          position: member.committeeRole || p?.position || '',
          inviteeType: 'member',
          hasQuorumRights: member.hasQuorumRights,
          hasVotingRights: member.hasVotingRights,
          personalToken: `tok_${newMeetingId.slice(-4)}_${p?.id || idx}_${Math.random().toString(36).substring(2, 7)}`,
          tokenExpiresAt: newMeeting.rsvpDeadline,
          isTokenRevoked: false,
          invitationSentAt: newMeeting.status === 'rsvp_open' ? new Date().toISOString() : undefined,
          rsvpStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    if (newInvitees.length > 0) {
      setInvitees(prev => [...prev, ...newInvitees]);
    }

    addAudit('สร้างการประชุม', 'meetings', newMeetingId, `สร้างการประชุม ${newMeeting.title} (${newMeeting.meetingNumber}) และเพิ่มผู้ได้รับเชิญ ${newInvitees.length} ท่าน`);
    return newMeetingId;
  };

  // 2. Update Meeting
  const updateMeeting = (meetingId: string, data: Partial<Meeting>) => {
    setMeetings(prev =>
      prev.map(m => (m.id === meetingId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );
    addAudit('แก้ไขการประชุม', 'meetings', meetingId, `แก้ไขข้อมูลการประชุม ID: ${meetingId}`);
  };

  // 3. Delete Meeting
  const deleteMeeting = (meetingId: string) => {
    const target = meetings.find(m => m.id === meetingId);
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    setInvitees(prev => prev.filter(inv => inv.meetingId !== meetingId));
    setDocuments(prev => prev.filter(d => d.meetingId !== meetingId));
    setAttendanceLogs(prev => prev.filter(a => a.meetingId !== meetingId));
    addAudit('ยกเลิก/ลบการประชุม', 'meetings', meetingId, `ลบการประชุม: ${target?.title || meetingId}`);
  };

  // 4. Duplicate Meeting
  const duplicateMeeting = (meetingId: string): string => {
    const orig = meetings.find(m => m.id === meetingId);
    if (!orig) return '';
    const newId = 'meet-' + Date.now();
    const origInvitees = invitees.filter(inv => inv.meetingId === meetingId);

    const dup: Meeting = {
      ...orig,
      id: newId,
      title: `${orig.title} (คัดลอก)`,
      meetingNumber: `${parseInt(orig.meetingNumber.split('/')[0] || '1') + 1}/${orig.beYear}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'user-staff'
    };

    setMeetings(prev => [dup, ...prev]);

    // Copy invitees
    const copiedInvitees: MeetingInvitee[] = origInvitees.map((inv, idx) => ({
      ...inv,
      id: `inv-${Date.now()}-${idx}`,
      meetingId: newId,
      personalToken: `tok_${newId.slice(-4)}_${inv.profileId || idx}_${Math.random().toString(36).substring(2, 7)}`,
      rsvpStatus: 'pending',
      response: undefined,
      delegateRequest: undefined,
      leaveRequest: undefined,
      attendance: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    setInvitees(prev => [...prev, ...copiedInvitees]);
    addAudit('คัดลอกการประชุม', 'meetings', newId, `คัดลอกจากการประชุม: ${orig.title} -> ${dup.title}`);
    return newId;
  };

  // 5. Update Meeting Status (e.g. open/close RSVP)
  const updateMeetingStatus = (meetingId: string, status: MeetingStatus) => {
    setMeetings(prev =>
      prev.map(m => (m.id === meetingId ? { ...m, status, updatedAt: new Date().toISOString() } : m))
    );
    addAudit('เปลี่ยนสถานะการประชุม', 'meetings', meetingId, `เปลี่ยนสถานะเป็น: ${status}`);
  };

  // 6. Get invitees
  const getInviteesByMeeting = (meetingId: string) => {
    return invitees.filter(inv => inv.meetingId === meetingId);
  };

  const getInviteeByToken = (token: string) => {
    return invitees.find(inv => inv.personalToken === token && !inv.isTokenRevoked);
  };

  // 7. Submit RSVP
  const submitRSVP = (
    inviteeId: string,
    response: Partial<RSVPResponse>,
    delegate?: Partial<DelegateRequest>,
    leave?: Partial<LeaveRequest>
  ): boolean => {
    const inv = invitees.find(i => i.id === inviteeId);
    if (!inv) return false;

    const newResponse: RSVPResponse = {
      id: 'resp-' + Date.now(),
      meetingInviteeId: inviteeId,
      status: response.status || 'attend',
      attendanceFormat: response.attendanceFormat,
      updatedPhone: response.updatedPhone,
      updatedEmail: response.updatedEmail,
      reason: response.reason,
      dietaryPreferences: response.dietaryPreferences,
      checkinQrCodeRef: `MCU-CHK-${Math.floor(100000 + Math.random() * 900000)}`,
      isAcknowledgedPdpa: true,
      submittedAt: new Date().toISOString(),
      isDraft: response.isDraft || false
    };

    let newDelegateReq: DelegateRequest | undefined = undefined;
    if (response.status === 'delegate' && delegate) {
      newDelegateReq = {
        id: 'del-' + Date.now(),
        meetingInviteeId: inviteeId,
        delegateTitle: delegate.delegateTitle || 'นาย',
        delegateName: delegate.delegateName || '',
        delegatePosition: delegate.delegatePosition || '',
        delegateOrganization: delegate.delegateOrganization || '',
        delegatePhone: delegate.delegatePhone || '',
        delegateEmail: delegate.delegateEmail || '',
        attendanceFormat: delegate.attendanceFormat || 'Onsite',
        reason: delegate.reason || '',
        documentUrl: delegate.documentUrl || '/sample-docs/power-of-attorney.pdf',
        documentName: delegate.documentName || 'หนังสือมอบหมายผู้แทน.pdf',
        status: 'pending',
        canCountAsQuorum: false, // ห้ามนับอัตโนมัติ ต้องได้รับการอนุมัติ
        canVote: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    let newLeaveReq: LeaveRequest | undefined = undefined;
    if ((response.status === 'leave' || response.status === 'cannot_attend') && leave) {
      newLeaveReq = {
        id: 'leave-' + Date.now(),
        meetingInviteeId: inviteeId,
        leaveType: response.status === 'cannot_attend' ? 'cannot_attend' : 'leave',
        reason: leave.reason || response.reason || '',
        documentUrl: leave.documentUrl,
        documentName: leave.documentName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    setInvitees(prev =>
      prev.map(i => {
        if (i.id === inviteeId) {
          return {
            ...i,
            rsvpStatus: response.status || i.rsvpStatus,
            response: newResponse,
            delegateRequest: newDelegateReq || i.delegateRequest,
            leaveRequest: newLeaveReq || i.leaveRequest,
            phone: response.updatedPhone || i.phone,
            email: response.updatedEmail || i.email,
            updatedAt: new Date().toISOString()
          };
        }
        return i;
      })
    );

    // Notify Secretary if delegate or leave requested
    if (response.status === 'delegate') {
      const newNotif: AppNotification = {
        id: 'notif-' + Date.now(),
        recipientId: 'user-sec',
        meetingId: inv.meetingId,
        title: 'มีคำขอมอบหมายผู้แทนใหม่',
        message: `${inv.title}${inv.firstName} ${inv.lastName} ได้ยื่นขอมอบหมายผู้แทน: ${delegate?.delegateName}`,
        type: 'review_approved',
        linkUrl: '/approvals',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    } else if (response.status === 'leave') {
      const newNotif: AppNotification = {
        id: 'notif-' + Date.now(),
        recipientId: 'user-sec',
        meetingId: inv.meetingId,
        title: 'มีคำขอลาการประชุมใหม่',
        message: `${inv.title}${inv.firstName} ${inv.lastName} ได้ยื่นขอลาการประชุม`,
        type: 'review_approved',
        linkUrl: '/approvals',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    addAudit(
      'ตอบรับการประชุม (RSVP)',
      'rsvp_responses',
      newResponse.id,
      `${inv.title}${inv.firstName} ${inv.lastName} ตอบรับสถานะ: ${response.status} (รูปแบบ: ${response.attendanceFormat || '-'})`
    );

    return true;
  };

  // 8. Review Delegate Request
  const reviewDelegateRequest = (
    inviteeId: string,
    status: ApprovalStatus,
    notes: string,
    canCountAsQuorum: boolean,
    canVote: boolean
  ) => {
    setInvitees(prev =>
      prev.map(inv => {
        if (inv.id === inviteeId && inv.delegateRequest) {
          const updatedDel: DelegateRequest = {
            ...inv.delegateRequest,
            status,
            reviewNotes: notes,
            reviewedBy: currentUser?.id,
            reviewedAt: new Date().toISOString(),
            canCountAsQuorum,
            canVote,
            updatedAt: new Date().toISOString()
          };
          return {
            ...inv,
            hasQuorumRights: canCountAsQuorum,
            hasVotingRights: canVote,
            delegateRequest: updatedDel
          };
        }
        return inv;
      })
    );

    const targetInv = invitees.find(i => i.id === inviteeId);
    // Send notification to member
    if (targetInv?.profileId) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        recipientId: targetInv.profileId,
        meetingId: targetInv.meetingId,
        title: status === 'approved' ? 'คำขอมอบหมายผู้แทนได้รับการอนุมัติ' : 'คำขอมอบหมายผู้แทนไม่ผ่านการอนุมัติ',
        message: `ผลการพิจารณา: ${status === 'approved' ? 'อนุมัติ' : status === 'rejected' ? 'ไม่อนุมัติ' : 'ขอข้อมูลเพิ่มเติม'} หมายเหตุ: ${notes || 'เรียบร้อย'}`,
        type: status === 'approved' ? 'review_approved' : 'review_rejected',
        linkUrl: `/my-meetings`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAudit(
      'พิจารณาคำขอมอบหมายผู้แทน',
      'delegate_requests',
      targetInv?.delegateRequest?.id || inviteeId,
      `ผลพิจารณา: ${status}, นับองค์ประชุม: ${canCountAsQuorum ? 'ได้' : 'ไม่ได้'}, หมายเหตุ: ${notes}`
    );
  };

  // 9. Review Leave Request
  const reviewLeaveRequest = (inviteeId: string, status: ApprovalStatus, notes: string) => {
    setInvitees(prev =>
      prev.map(inv => {
        if (inv.id === inviteeId && inv.leaveRequest) {
          const updatedLeave: LeaveRequest = {
            ...inv.leaveRequest,
            status,
            reviewNotes: notes,
            reviewedBy: currentUser?.id,
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return {
            ...inv,
            leaveRequest: updatedLeave
          };
        }
        return inv;
      })
    );

    const targetInv = invitees.find(i => i.id === inviteeId);
    if (targetInv?.profileId) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        recipientId: targetInv.profileId,
        meetingId: targetInv.meetingId,
        title: 'ผลการพิจารณาคำขอลาประชุม',
        message: `สำนักงานสภาฯ ได้รับทราบ/พิจารณา: ${status} หมายเหตุ: ${notes || 'บันทึกเรียบร้อย'}`,
        type: 'review_approved',
        linkUrl: `/my-meetings`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAudit(
      'พิจารณาคำขอลาประชุม',
      'leave_requests',
      targetInv?.leaveRequest?.id || inviteeId,
      `ผลพิจารณา: ${status}, หมายเหตุ: ${notes}`
    );
  };

  // 10. Check in invitee on meeting day
  const checkInInvitee = (
    meetingId: string,
    inviteeId: string,
    format: AttendanceFormat,
    method: CheckInMethod,
    notes?: string
  ) => {
    const inv = invitees.find(i => i.id === inviteeId);
    if (!inv) return;

    const isDelegate = inv.rsvpStatus === 'delegate';
    const countsForQuorum = isDelegate
      ? Boolean(inv.delegateRequest?.canCountAsQuorum)
      : inv.hasQuorumRights;

    const newLog: AttendanceLog = {
      id: 'att-' + Date.now(),
      meetingId,
      meetingInviteeId: inviteeId,
      actualFormat: format,
      checkInTime: new Date().toISOString(),
      checkInMethod: method,
      isDelegate,
      delegateRequestId: inv.delegateRequest?.id,
      countsForQuorum,
      notes,
      checkedInBy: currentUser?.id,
      createdAt: new Date().toISOString()
    };

    setAttendanceLogs(prev => {
      const filtered = prev.filter(a => a.meetingInviteeId !== inviteeId);
      return [...filtered, newLog];
    });

    setInvitees(prev =>
      prev.map(i => (i.id === inviteeId ? { ...i, attendance: newLog } : i))
    );

    addAudit(
      'เช็กชื่อเข้าร่วมประชุม',
      'attendance_logs',
      newLog.id,
      `เช็กชื่อ: ${inv.title}${inv.firstName} ${inv.lastName} รูปแบบ: ${format} วิธีการ: ${method}`
    );
  };

  // 11. Check out invitee
  const checkOutInvitee = (meetingId: string, inviteeId: string) => {
    setAttendanceLogs(prev =>
      prev.map(log =>
        log.meetingInviteeId === inviteeId && log.meetingId === meetingId
          ? { ...log, checkOutTime: new Date().toISOString() }
          : log
      )
    );
    const inv = invitees.find(i => i.id === inviteeId);
    addAudit(
      'เช็กเอาท์ / ออกจากการประชุม',
      'attendance_logs',
      inviteeId,
      `บันทึกเวลาออก: ${inv?.title || ''}${inv?.firstName || ''} ${inv?.lastName || ''}`
    );
  };

  // 12. Certify Quorum
  const certifyQuorum = (meetingId: string, notes?: string) => {
    const meetingInvitees = invitees.filter(i => i.meetingId === meetingId);
    const meetingAttendances = attendanceLogs.filter(a => a.meetingId === meetingId && !a.checkOutTime);

    const totalEligible = meetingInvitees.filter(i => i.hasQuorumRights).length;
    const currentAttended = meetingAttendances.filter(a => a.countsForQuorum).length;
    const minRequired = Math.floor(totalEligible / 2) + 1; // More than half
    const isQuorumReached = currentAttended >= minRequired;

    const onsite = meetingAttendances.filter(a => a.actualFormat === 'Onsite').length;
    const online = meetingAttendances.filter(a => a.actualFormat === 'Online').length;
    const leaves = meetingInvitees.filter(i => i.rsvpStatus === 'leave').length;

    const newQuorumLog: QuorumLog = {
      id: 'ql-' + Date.now(),
      meetingId,
      timestamp: new Date().toISOString(),
      totalEligibleMembers: totalEligible,
      minimumRequired: minRequired,
      currentAttended,
      onsiteCount: onsite,
      onlineCount: online,
      leaveCount: leaves,
      isQuorumReached,
      certifiedBy: currentUser?.id,
      certifiedByName: `${currentUser?.title || ''}${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
      certifiedAt: new Date().toISOString(),
      certificationStatus: isQuorumReached ? 'certified' : 'adjourned',
      notes: notes || (isQuorumReached ? 'องค์ประชุมครบตามระเบียบสภามหาวิทยาลัย' : 'ยังไม่ครบองค์ประชุม')
    };

    setQuorumLogs(prev => [newQuorumLog, ...prev]);

    addAudit(
      'รับรององค์ประชุม',
      'quorum_logs',
      newQuorumLog.id,
      `เลขานุการสภาฯ รับรองผลองค์ประชุม: ${isQuorumReached ? 'ครบองค์ประชุม' : 'ยังไม่ครบ'} (${currentAttended}/${totalEligible} ท่าน)`
    );
  };

  // 13. Committee Members Management
  const addCommitteeMember = (data: Partial<CommitteeMember>) => {
    const newId = 'cm-' + Date.now();
    const newMember: CommitteeMember = {
      id: newId,
      committeeId: data.committeeId || 'comm-1',
      profileId: data.profileId || 'user-new',
      memberCode: data.memberCode || `MCU-M-${Math.floor(100 + Math.random() * 900)}`,
      committeeRole: data.committeeRole || 'กรรมการสภาฯ',
      hasQuorumRights: data.hasQuorumRights ?? true,
      hasVotingRights: data.hasVotingRights ?? true,
      termStartDate: data.termStartDate || new Date().toISOString().split('T')[0],
      termEndDate: data.termEndDate || '2028-12-31',
      isActive: true,
      notes: data.notes,
      profile: data.profile
    };
    setCommitteeMembers(prev => [...prev, newMember]);
    addAudit('เพิ่มรายชื่อกรรมการ', 'committee_members', newId, `เพิ่มสมาชิกสภา: ${newMember.profile?.firstName} (${newMember.committeeRole})`);
  };

  const updateCommitteeMember = (memberId: string, data: Partial<CommitteeMember>) => {
    setCommitteeMembers(prev =>
      prev.map(cm => (cm.id === memberId ? { ...cm, ...data } : cm))
    );
    addAudit('แก้ไขข้อมูลกรรมการ', 'committee_members', memberId, `แก้ไขข้อมูลสมาชิก ID: ${memberId}`);
  };

  const deleteCommitteeMember = (memberId: string) => {
    setCommitteeMembers(prev => prev.filter(cm => cm.id !== memberId));
    addAudit('ลบ/ปิดใช้งานกรรมการ', 'committee_members', memberId, `ลบสมาชิกสภา ID: ${memberId}`);
  };

  const importCommitteeMembers = (imported: Partial<CommitteeMember>[]) => {
    const createdList: CommitteeMember[] = imported.map((item, idx) => ({
      id: `cm-imp-${Date.now()}-${idx}`,
      committeeId: item.committeeId || 'comm-1',
      profileId: item.profileId || `user-imp-${idx}`,
      memberCode: item.memberCode || `MCU-IMP-${idx + 1}`,
      committeeRole: item.committeeRole || 'กรรมการสภาฯ',
      hasQuorumRights: item.hasQuorumRights ?? true,
      hasVotingRights: item.hasVotingRights ?? true,
      termStartDate: item.termStartDate || new Date().toISOString().split('T')[0],
      termEndDate: item.termEndDate || '2028-12-31',
      isActive: true,
      notes: item.notes,
      profile: item.profile
    }));
    setCommitteeMembers(prev => [...prev, ...createdList]);
    addAudit('นำเข้ารายชื่อกรรมการผ่าน Excel', 'committee_members', 'batch', `นำเข้าข้อมูลสมาชิกสภาจำนวน ${createdList.length} รายการ`);
  };

  // 14. Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAudit('แก้ไขการตั้งค่าระบบ', 'system_settings', 'global', `ปรับปรุงการตั้งค่าระบบ`);
  };

  // 15. Send Meeting Reminders
  const sendMeetingReminders = (meetingId: string, inviteeIds?: string[]): number => {
    const m = meetings.find(item => item.id === meetingId);
    if (!m) return 0;

    let targetInvitees = invitees.filter(i => i.meetingId === meetingId && i.rsvpStatus === 'pending');
    if (inviteeIds && inviteeIds.length > 0) {
      targetInvitees = targetInvitees.filter(i => inviteeIds.includes(i.id));
    }

    const count = targetInvitees.length;
    if (count > 0) {
      setInvitees(prev =>
        prev.map(i => {
          if (targetInvitees.some(t => t.id === i.id)) {
            return { ...i, lastRemindedAt: new Date().toISOString() };
          }
          return i;
        })
      );

      // Create notifications
      const newNotifs: AppNotification[] = targetInvitees
        .filter(i => i.profileId)
        .map(i => ({
          id: 'notif-' + Date.now() + '-' + i.id,
          recipientId: i.profileId!,
          meetingId,
          title: `แจ้งเตือนตอบรับการประชุม: ${m.title}`,
          message: `สำนักงานสภามหาวิทยาลัย ขอความอนุเคราะห์ท่านตอบรับเข้าร่วมประชุม ครั้งที่ ${m.meetingNumber} ภายในกำหนดเวลา`,
          type: 'rsvp_reminder',
          linkUrl: `/rsvp/${i.personalToken}`,
          isRead: false,
          createdAt: new Date().toISOString()
        }));

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
      }

      addAudit(
        'ส่งการแจ้งเตือนเตือนตอบรับ',
        'meetings',
        meetingId,
        `ส่งแจ้งเตือนให้ผู้ยังไม่ตอบรับจำนวน ${count} ท่าน`
      );
    }
    return count;
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  // 16. Reset to seed
  const resetToDefaultSeed = () => {
    setMeetings(INITIAL_MEETINGS);
    setInvitees(INITIAL_INVITEES);
    setCommittees(INITIAL_COMMITTEES);
    setCommitteeMembers(INITIAL_COMMITTEE_MEMBERS);
    setDocuments(INITIAL_DOCUMENTS);
    setAttendanceLogs([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    setQuorumLogs([]);
    localStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        meetings,
        invitees,
        committees,
        committeeMembers,
        documents,
        attendanceLogs,
        auditLogs,
        notifications,
        settings,
        quorumLogs,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        duplicateMeeting,
        updateMeetingStatus,
        getInviteesByMeeting,
        getInviteeByToken,
        submitRSVP,
        reviewDelegateRequest,
        reviewLeaveRequest,
        checkInInvitee,
        checkOutInvitee,
        certifyQuorum,
        addCommitteeMember,
        updateCommitteeMember,
        deleteCommitteeMember,
        importCommitteeMembers,
        updateSettings,
        sendMeetingReminders,
        markNotificationAsRead,
        resetToDefaultSeed
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
