import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateShort, formatThaiTime, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  MapPin,
  Video,
  Search,
  UserCheck,
  Sliders,
  Sparkles,
  AlertTriangle,
  History,
  Camera,
  LogOut,
  LogIn
} from 'lucide-react';
import { QuorumRuleType, AttendanceFormat, CheckInMethod, MeetingInvitee } from '../types';
import { exportReportToPdf } from '../utils/pdfExport';
import { calculateQuorum } from '../utils/quorum';
import { CameraQrScanner } from '../components/attendance/CameraQrScanner';

export const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMeetingId = searchParams.get('meetingId');
  const {
    meetings,
    invitees,
    attendanceLogs,
    quorumLogs,
    checkInInvitee,
    checkOutInvitee,
    certifyQuorum
  } = useData();
  const { currentRole, currentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    initialMeetingId || meetings[0]?.id || ''
  );

  const [searchTerm, setSearchTerm] = useState('');

  // Quorum Rule Configuration State
  const [quorumRule, setQuorumRule] = useState<QuorumRuleType>('more_than_half');
  const [customThreshold, setCustomThreshold] = useState<number>(4);
  const [requiresChairperson, setRequiresChairperson] = useState(true);

  // Manual Check-in Modal
  const [manualCheckInTarget, setManualCheckInTarget] = useState<MeetingInvitee | null>(null);
  const [checkInFormat, setCheckInFormat] = useState<AttendanceFormat>('Onsite');
  const [checkInNotes, setCheckInNotes] = useState('');

  // QR Scanner Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Certify Quorum Modal
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);
  const [certifyNote, setCertifyNote] = useState('ครบองค์ประชุมตามระเบียบสภามหาวิทยาลัย');

  const currentMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  const meetingInvitees = invitees.filter(i => i.meetingId === selectedMeetingId);
  const meetingAttendances = attendanceLogs.filter(a => a.meetingId === selectedMeetingId);
  const meetingQuorumLogs = quorumLogs.filter(q => q.meetingId === selectedMeetingId);

  // Quorum Calculations
  // Total eligible members who count for quorum
  const eligibleInvitees = meetingInvitees.filter(i => i.hasQuorumRights);
  const totalEligible = eligibleInvitees.length;

  // Currently active checked-in attendees (counts for quorum and hasn't checked out)
  const activeAttendances = meetingAttendances.filter(a => !a.checkOutTime);
  const quorumAttendedCount = activeAttendances.filter(a => a.countsForQuorum).length;

  // Chairperson check
  const chairpersonInvitee = meetingInvitees.find(
    i => i.position?.includes('นายกสภา') || i.position?.includes('ประธาน')
  );
  const isChairpersonPresent = chairpersonInvitee
    ? activeAttendances.some(a => a.meetingInviteeId === chairpersonInvitee.id)
    : true;

  // Threshold and quorum status via centralized business logic
  const {
    minimumRequired,
    isQuorumReached,
  } = calculateQuorum({
    totalEligible,
    quorumAttendedCount,
    quorumRule,
    customThreshold,
    requiresChairperson,
    isChairpersonPresent,
  });

  // Stats
  const checkedInOnsite = activeAttendances.filter(a => a.actualFormat === 'Onsite').length;
  const checkedInOnline = activeAttendances.filter(a => a.actualFormat === 'Online').length;
  const leaveCount = meetingInvitees.filter(i => i.rsvpStatus === 'leave').length;
  const notCheckedInCount = Math.max(0, meetingInvitees.length - activeAttendances.length);

  // Filtered invitee list
  const filteredInvitees = useMemo(() => {
    return meetingInvitees.filter(inv => {
      const name = `${inv.title}${inv.firstName} ${inv.lastName}`;
      return (
        searchTerm === '' ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [meetingInvitees, searchTerm]);

  // Execute check in
  const handleExecuteCheckIn = () => {
    if (!manualCheckInTarget) return;

    checkInInvitee(
      selectedMeetingId,
      manualCheckInTarget.id,
      checkInFormat,
      'staff_manual',
      checkInNotes
    );

    showToast(
      'success',
      'เช็กชื่อสำเร็จ',
      `บันทึกการเข้าร่วมของ ${manualCheckInTarget.title}${manualCheckInTarget.firstName} (${checkInFormat})`
    );
    setManualCheckInTarget(null);
    setCheckInNotes('');
  };

  // Execute check out
  const handleExecuteCheckOut = (invId: string, name: string) => {
    checkOutInvitee(selectedMeetingId, invId);
    showToast('info', 'บันทึกเวลาออกแล้ว', `เช็กเอาท์: ${name}`);
  };

  // Prepare mock QR codes for quick testing/simulation
  const mockQrCodes = useMemo(() => {
    return meetingInvitees.slice(0, 6).map(inv => ({
      label: `${inv.title}${inv.firstName} ${inv.lastName} (${inv.position})`,
      code: inv.response?.checkinQrCodeRef || `MCU-RSVP:${currentMeeting.meetingNumber}:${inv.id}`,
    }));
  }, [meetingInvitees, currentMeeting.meetingNumber]);

  // Handle QR Code Scan (Camera or manual)
  const handleSimulateQrScan = (codeToScan?: string) => {
    const code = codeToScan?.trim() || '';
    if (!code) return;

    // Find invitee matching code or ref
    const matched = meetingInvitees.find(
      i =>
        i.response?.checkinQrCodeRef === code ||
        i.id === code ||
        code.includes(i.id) ||
        code.includes(i.personalToken)
    );

    if (matched) {
      checkInInvitee(
        selectedMeetingId,
        matched.id,
        matched.response?.attendanceFormat || 'Onsite',
        'qr_code',
        'สแกน QR Code หน้าห้องประชุม'
      );
      showToast(
        'success',
        'สแกน QR Code สำเร็จ!',
        `ยินดีต้อนรับ ${matched.title}${matched.firstName} ${matched.lastName}`
      );
      setIsQrModalOpen(false);
    } else {
      showToast('error', 'ไม่พบบัตรเช็กชื่อนี้', 'QR Code ไม่ตรงกับการประชุมนี้');
    }
  };

  // Certify Quorum Handler
  const handleConfirmCertify = () => {
    certifyQuorum(selectedMeetingId, certifyNote);
    setIsCertifyModalOpen(false);
    showToast(
      'success',
      'รับรองผลองค์ประชุมเรียบร้อย',
      `เลขานุการสภาฯ รับรองผลการประชุม ครั้งที่ ${currentMeeting.meetingNumber}`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-mcu-primary" />
            <span>เช็กชื่อวันประชุมและตรวจสอบองค์ประชุม</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            บันทึกการเข้าร่วมประชุม Onsite/Online ตรวจสอบเกณฑ์องค์ประชุมตามกฎระเบียบ และรับรองผล
          </p>
        </div>

        {/* Meeting selector and actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMeetingId}
            onChange={e => setSelectedMeetingId(e.target.value)}
            className="py-2 px-3 text-xs border border-purple-200 rounded-lg bg-white shadow-xs font-semibold text-mcu-primary outline-none"
          >
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                ครั้งที่ {m.meetingNumber} - {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-2 bg-[#C8A54B] hover:bg-[#b5933d] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>สแกน QR Code</span>
          </button>

          <button
            onClick={() => {
              try {
                exportReportToPdf({
                  title: `รายงานสถานะและบัญชีเช็กชื่อองค์ประชุม (ครั้งที่ ${currentMeeting?.meetingNumber || '-'})`,
                  meeting: currentMeeting,
                  headers: ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ผลตอบรับ', 'เช็กชื่อ', 'เวลารายงานตัว'],
                  data: meetingInvitees.map((inv, idx) => {
                    const att = attendanceLogs.find(a => a.meetingInviteeId === inv.id);
                    return [
                      idx + 1,
                      `${inv.title}${inv.firstName} ${inv.lastName}`,
                      inv.position,
                      inv.rsvpStatus,
                      att ? `เข้าประชุม (${att.actualFormat})` : 'ยังไม่มา',
                      att ? formatThaiTime(att.checkInTime) : '-'
                    ];
                  }),
                  summaryNotes: [
                    `ผลการตรวจองค์ประชุม: ${isQuorumReached ? 'ครบองค์ประชุม' : 'ยังไม่ครบองค์ประชุม'}`,
                    `ยอดรวมผู้มีสิทธิ์: ${totalEligible} ท่าน | ขั้นต่ำที่ต้องการ: ${minimumRequired} ท่าน | มาประชุมแล้ว: ${quorumAttendedCount} ท่าน`,
                    'บันทึกข้อมูลโดยระบบเช็กชื่ออัตโนมัติ MCU Council RSVP'
                  ]
                });
                showToast('success', 'ดาวน์โหลดรายงานบัญชีเช็กชื่อ PDF สำเร็จ');
              } catch (err) {
                console.error(err);
                showToast('error', 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
              }
            }}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ออกรายงานองค์ประชุม (PDF)</span>
          </button>
        </div>
      </div>

      {/* PROMINENT QUORUM STATUS BANNER */}
      <div
        className={`rounded-2xl p-6 border shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isQuorumReached
            ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-800 text-white border-emerald-500'
            : 'bg-gradient-to-r from-amber-700 via-amber-600 to-orange-800 text-white border-amber-500'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
            {isQuorumReached ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>สถานะ: ครบองค์ประชุมแล้ว (Quorum Reached)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>สถานะ: ยังไม่ครบองค์ประชุม (Quorum Incomplete)</span>
              </>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            มีผู้เข้าร่วม {quorumAttendedCount} จากเกณฑ์ขั้นต่ำ {minimumRequired} ท่าน (สิทธิทั้งหมด {totalEligible} ท่าน)
          </h2>

          <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
            {isQuorumReached
              ? 'การประชุมมีกรรมการเข้าร่วมครบตามข้อบังคับ สามารถเปิดการประชุมและดำเนินวาระการประชุมตามกฎหมายได้'
              : 'จำนวนกรรมการที่เข้าร่วมยังไม่ถึงกึ่งหนึ่ง หรือยังไม่มีประธาน/ผู้แทนประธานเข้าร่วมประชุม'}
          </p>
        </div>

        {/* Secretary Certification Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsCertifyModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-gray-100 text-gray-900 text-xs sm:text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-mcu-primary" />
            <span>รับรององค์ประชุม (สำหรับเลขานุการสภาฯ)</span>
          </button>
        </div>
      </div>

      {/* 7 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 font-medium">สิทธิ์นับองค์ทั้งหมด</span>
          <div className="text-xl font-bold text-gray-900 mt-0.5">{totalEligible}</div>
          <span className="text-[10px] text-gray-400">ท่าน</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs bg-purple-50/20">
          <span className="text-[10px] text-mcu-primary font-semibold">เกณฑ์ขั้นต่ำ</span>
          <div className="text-xl font-bold text-mcu-primary mt-0.5">{minimumRequired}</div>
          <span className="text-[10px] text-gray-500">ท่าน</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] text-emerald-700 font-semibold">เช็กชื่อแล้ว (นับองค์)</span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{quorumAttendedCount}</div>
          <span className="text-[10px] text-emerald-600">ในที่ประชุม</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-600 font-medium">Onsite</span>
          <div className="text-xl font-bold text-gray-800 mt-0.5">{checkedInOnsite}</div>
          <span className="text-[10px] text-gray-400">ในห้อง 401</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[10px] text-blue-700 font-semibold">Online</span>
          <div className="text-xl font-bold text-blue-600 mt-0.5">{checkedInOnline}</div>
          <span className="text-[10px] text-blue-600">ผ่าน Zoom/Meet</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-[10px] text-rose-700 font-semibold">ลาประชุม</span>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{leaveCount}</div>
          <span className="text-[10px] text-rose-600">แจ้งลาแล้ว</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 font-medium">ยังไม่เช็กชื่อ</span>
          <div className="text-xl font-bold text-gray-700 mt-0.5">{notCheckedInCount}</div>
          <span className="text-[10px] text-gray-400">ท่าน</span>
        </div>
      </div>

      {/* Quorum Configuration Drawer & Rules */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-mcu-primary" />
            <span className="font-bold text-gray-900">กำหนดกติกาการคำนวณองค์ประชุม:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="rule"
                checked={quorumRule === 'more_than_half'}
                onChange={() => setQuorumRule('more_than_half')}
                className="text-mcu-primary"
              />
              <span>มากกว่ากึ่งหนึ่ง (&gt; 1/2)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="rule"
                checked={quorumRule === 'not_less_than_half'}
                onChange={() => setQuorumRule('not_less_than_half')}
                className="text-mcu-primary"
              />
              <span>ไม่น้อยกว่ากึ่งหนึ่ง (&ge; 1/2)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="rule"
                checked={quorumRule === 'custom_count'}
                onChange={() => setQuorumRule('custom_count')}
                className="text-mcu-primary"
              />
              <span>จำนวนขั้นต่ำ:</span>
              {quorumRule === 'custom_count' && (
                <input
                  type="number"
                  min={1}
                  max={totalEligible}
                  value={customThreshold}
                  onChange={e => setCustomThreshold(Number(e.target.value))}
                  className="w-14 py-0.5 px-1.5 border border-gray-300 rounded text-center font-bold"
                />
              )}
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer pl-3 border-l border-gray-200">
              <input
                type="checkbox"
                checked={requiresChairperson}
                onChange={e => setRequiresChairperson(e.target.checked)}
                className="rounded text-mcu-primary"
              />
              <span className="font-semibold text-gray-800">ต้องมีนายกสภาฯ / ผู้แทนประธาน</span>
            </label>
          </div>
        </div>
      </div>

      {/* Attendance Table & Check-in Control */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อกรรมการเพื่อเช็กชื่อ..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
            />
          </div>
          <div className="text-xs text-gray-500">
            แสดง {filteredInvitees.length} ท่าน
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3">ตำแหน่ง</th>
                <th className="py-3 px-3 text-center">สิทธิ์องค์ฯ</th>
                <th className="py-3 px-3">การตอบรับ (RSVP)</th>
                <th className="py-3 px-3">สถานะการเข้าประชุมจริง</th>
                <th className="py-3 px-3">เวลาเช็กชื่อ</th>
                <th className="py-3 px-3 text-right">การเช็กชื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredInvitees.map(inv => {
                const attLog = activeAttendances.find(a => a.meetingInviteeId === inv.id);
                const isCheckedIn = Boolean(attLog);

                return (
                  <tr key={inv.id} className="hover:bg-purple-50/20 transition">
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div>
                        {inv.title}{inv.firstName} {inv.lastName}
                      </div>
                      {inv.rsvpStatus === 'delegate' && inv.delegateRequest && (
                        <div className="text-[10px] text-indigo-700 font-medium">
                          ผู้แทน: {inv.delegateRequest.delegateName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-gray-600">
                      <div>{inv.position}</div>
                      <div className="text-[10px] text-gray-400">{inv.organization}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {inv.hasQuorumRights ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          นับองค์
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">ไม่นับ</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={inv.rsvpStatus} size="sm" />
                    </td>

                    <td className="py-3 px-3">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>เช็กชื่อแล้ว ({attLog?.actualFormat})</span>
                        </span>
                      ) : inv.rsvpStatus === 'leave' ? (
                        <span className="text-rose-600 text-[11px]">ลาการประชุม</span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">ยังไม่เช็กชื่อ</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                      {attLog ? formatThaiTime(attLog.checkInTime) : '-'}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isCheckedIn ? (
                        <button
                          onClick={() => handleExecuteCheckOut(inv.id, `${inv.title}${inv.firstName}`)}
                          className="px-2.5 py-1 border border-gray-300 hover:bg-gray-100 text-gray-600 rounded text-xs transition inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3 text-gray-500" />
                          <span>เช็กเอาท์</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setManualCheckInTarget(inv);
                            setCheckInFormat(
                              inv.response?.attendanceFormat ||
                                (currentMeeting.meetingFormat === 'Online' ? 'Online' : 'Onsite')
                            );
                          }}
                          className="px-3 py-1 bg-mcu-primary hover:bg-mcu-secondary text-white rounded text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3 h-3 text-mcu-gold" />
                          <span>เช็กชื่อ</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quorum Logs & History Timeline */}
      {meetingQuorumLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
            <History className="w-4 h-4 text-mcu-primary" />
            <span>ประวัติการรับรององค์ประชุม (Certification History)</span>
          </div>

          <div className="space-y-2">
            {meetingQuorumLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-mcu-primary">
                    รับรองโดย: {log.certifiedByName || 'เลขานุการสภามหาวิทยาลัย'}
                  </div>
                  <div className="text-gray-600 mt-0.5">
                    ผล: {log.isQuorumReached ? 'ครบองค์ประชุม' : 'ยังไม่ครบ'} (เข้าร่วม {log.currentAttended} / {log.totalEligibleMembers} ท่าน) • {log.notes}
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  {formatThaiDateTime(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Check-in Modal */}
      <Modal
        isOpen={Boolean(manualCheckInTarget)}
        onClose={() => setManualCheckInTarget(null)}
        title="เช็กชื่อเข้าร่วมประชุม (Staff Manual Check-in)"
        footer={
          <>
            <button
              type="button"
              onClick={() => setManualCheckInTarget(null)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleExecuteCheckIn}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันเช็กชื่อ</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-gray-500">กรรมการ / ผู้เข้าร่วม:</div>
            <div className="font-bold text-gray-900 text-sm mt-0.5">
              {manualCheckInTarget?.title}{manualCheckInTarget?.firstName} {manualCheckInTarget?.lastName}
            </div>
            <div className="text-gray-600 mt-0.5">
              {manualCheckInTarget?.position} • {manualCheckInTarget?.organization}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              รูปแบบการเข้าร่วมจริง <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                  checkInFormat === 'Onsite'
                    ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="chkFmt"
                  checked={checkInFormat === 'Onsite'}
                  onChange={() => setCheckInFormat('Onsite')}
                />
                <span>Onsite (ณ ห้องประชุม 401)</span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                  checkInFormat === 'Online'
                    ? 'border-blue-500 bg-blue-50 font-bold text-blue-900'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="chkFmt"
                  checked={checkInFormat === 'Online'}
                  onChange={() => setCheckInFormat('Online')}
                />
                <span>Online (ระบบประชุมออนไลน์)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              หมายเหตุ (เช่น มาสาย, ออกก่อน, ผู้แทนเข้าร่วม)
            </label>
            <input
              type="text"
              value={checkInNotes}
              onChange={e => setCheckInNotes(e.target.value)}
              placeholder="ระบุหมายเหตุถ้ามี..."
              className="w-full py-2 px-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Camera & QR Scanner Modal */}
      <CameraQrScanner
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScan={(code) => handleSimulateQrScan(code)}
        mockCodes={mockQrCodes}
      />

      {/* Certify Quorum Modal */}
      <Modal
        isOpen={isCertifyModalOpen}
        onClose={() => setIsCertifyModalOpen(false)}
        title="รับรองผลการตรวจสอบองค์ประชุม"
        description="สำหรับการประชุมสภามหาวิทยาลัย มจร."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCertifyModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmCertify}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>บันทึกการรับรององค์ประชุม</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
            <div className="font-bold text-mcu-primary text-sm">
              ผลการนับองค์ประชุม ณ เวลา {formatThaiTime(new Date().toISOString())}
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div>
                ผู้มีสิทธิ์นับองค์: <strong>{totalEligible} ท่าน</strong>
              </div>
              <div>
                เกณฑ์ขั้นต่ำ: <strong>{minimumRequired} ท่าน</strong>
              </div>
              <div>
                เข้าร่วมจริง (Onsite/Online): <strong className="text-emerald-700">{quorumAttendedCount} ท่าน</strong>
              </div>
              <div>
                ผลสรุป: <strong className={isQuorumReached ? 'text-emerald-700' : 'text-amber-700'}>
                  {isQuorumReached ? 'ครบองค์ประชุม' : 'ยังไม่ครบองค์ประชุม'}
                </strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              บันทึกหมายเหตุการรับรอง
            </label>
            <textarea
              rows={3}
              value={certifyNote}
              onChange={e => setCertifyNote(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
