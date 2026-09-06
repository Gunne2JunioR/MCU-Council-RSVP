import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import {
  formatThaiDate,
  formatThaiDateShort,
  formatThaiTime,
  formatThaiDateTime
} from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Users,
  Bell,
  Activity,
  Edit,
  QrCode,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Send,
  Lock,
  Unlock,
  Copy
} from 'lucide-react';
import { MeetingStatus } from '../types';

export const MeetingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    meetings,
    invitees,
    documents,
    auditLogs,
    updateMeetingStatus,
    sendMeetingReminders
  } = useData();

  const meeting = meetings.find(m => m.id === id);

  // Modal for reminder
  const [showReminderModal, setShowReminderModal] = useState(false);

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-gray-800">ไม่พบข้อมูลการประชุม</h2>
        <Link to="/meetings" className="text-xs text-mcu-primary hover:underline mt-2 inline-block">
          &larr; กลับไปหน้ารายการประชุม
        </Link>
      </div>
    );
  }

  // Invitees for this meeting
  const meetingInvitees = invitees.filter(i => i.meetingId === meeting.id);
  const meetingDocs = documents.filter(d => d.meetingId === meeting.id);
  const meetingAudits = auditLogs.filter(a => a.entityId === meeting.id || a.details.includes(meeting.meetingNumber));

  // RSVP Breakdown
  const attendCount = meetingInvitees.filter(i => i.rsvpStatus === 'attend').length;
  const leaveCount = meetingInvitees.filter(i => i.rsvpStatus === 'leave').length;
  const cannotAttendCount = meetingInvitees.filter(i => i.rsvpStatus === 'cannot_attend').length;
  const delegateCount = meetingInvitees.filter(i => i.rsvpStatus === 'delegate').length;
  const pendingCount = meetingInvitees.filter(i => i.rsvpStatus === 'pending').length;

  const handleToggleStatus = () => {
    const nextStatus: MeetingStatus = meeting.status === 'rsvp_open' ? 'rsvp_closed' : 'rsvp_open';
    updateMeetingStatus(meeting.id, nextStatus);
    showToast(
      'info',
      nextStatus === 'rsvp_open' ? 'เปิดรับการตอบรับแล้ว' : 'ปิดรับการตอบรับแล้ว',
      `การประชุมครั้งที่ ${meeting.meetingNumber}`
    );
  };

  const handleSendReminder = () => {
    const sent = sendMeetingReminders(meeting.id);
    setShowReminderModal(false);
    showToast(
      'success',
      `ส่งการแจ้งเตือนสำเร็จ`,
      `ส่งข้อความเตือนให้ผู้ที่ยังไม่ตอบรับจำนวน ${sent} ท่านเรียบร้อยแล้ว`
    );
  };

  const handleCopyPersonalLink = (token: string) => {
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'คัดลอกลิงก์ส่วนบุคคลแล้ว', 'สามารถส่งลิงก์นี้ให้กรรมการตอบรับได้ทันที');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/meetings"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-mcu-primary bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {meeting.committeeName || 'สภามหาวิทยาลัย'} ครั้งที่ {meeting.meetingNumber}
              </span>
              <StatusBadge status={meeting.status} />
              <StatusBadge format={meeting.meetingFormat} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{meeting.title}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/meetings/${meeting.id}/edit`}
            className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>แก้ไข</span>
          </Link>

          <button
            onClick={() => setShowReminderModal(true)}
            className="px-3.5 py-2 border border-purple-200 text-mcu-primary bg-purple-50 hover:bg-purple-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-mcu-gold" />
            <span>ส่งแจ้งเตือน</span>
          </button>

          <button
            onClick={handleToggleStatus}
            className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            {meeting.status === 'rsvp_open' ? (
              <>
                <Lock className="w-4 h-4 text-amber-600" />
                <span>ปิดรับตอบรับ</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>เปิดรับตอบรับ</span>
              </>
            )}
          </button>

          <Link
            to={`/attendance?meetingId=${meeting.id}`}
            className="px-4 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-[#C8A54B]" />
            <span>เปิดเช็กชื่อวันประชุม</span>
          </Link>
        </div>
      </div>

      {/* 4 RSVP Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-card">
          <span className="text-[11px] font-medium text-gray-500">ผู้ได้รับเชิญทั้งหมด</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{meetingInvitees.length}</div>
          <span className="text-[10px] text-gray-400">ท่าน</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-card bg-emerald-50/20">
          <span className="text-[11px] font-medium text-emerald-700">ตอบรับเข้าร่วม</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{attendCount}</div>
          <span className="text-[10px] text-emerald-600">
            {meetingInvitees.length > 0 ? `${Math.round((attendCount / meetingInvitees.length) * 100)}%` : '0%'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-card bg-indigo-50/20">
          <span className="text-[11px] font-medium text-indigo-700">มอบหมายผู้แทน</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{delegateCount}</div>
          <Link to="/approvals" className="text-[10px] text-indigo-600 hover:underline">
            ดูคำขอผู้แทน &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-card bg-rose-50/20">
          <span className="text-[11px] font-medium text-rose-700">ลา / ไม่เข้าร่วม</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{leaveCount + cannotAttendCount}</div>
          <Link to="/approvals" className="text-[10px] text-rose-600 hover:underline">
            ดูคำขอลา &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-card bg-amber-50/20">
          <span className="text-[11px] font-medium text-amber-700">ยังไม่ตอบรับ</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="text-[10px] text-amber-800 hover:underline font-medium"
          >
            ส่งเตือน &rarr;
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meeting Info & Invitees (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Meeting Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>ข้อมูลการประชุม</span>
              <span className="text-xs font-normal text-gray-500">ปี พ.ศ. {meeting.beYear}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-mcu-primary" />
                  <span>วันและเวลาประชุม:</span>
                </div>
                <div className="font-semibold text-gray-900 pl-5">
                  {formatThaiDate(meeting.meetingDate)} เวลา {formatThaiTime(meeting.startTime)} - {formatThaiTime(meeting.endTime)} น.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-mcu-primary" />
                  <span>กำหนดปิดรับตอบรับ (RSVP Deadline):</span>
                </div>
                <div className="font-semibold text-gray-900 pl-5">
                  {formatThaiDateTime(meeting.rsvpDeadline)}
                </div>
              </div>
            </div>

            {/* Venue & Online details */}
            {meeting.venue && (
              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="text-gray-500 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-mcu-primary" />
                  <span>สถานที่จัดการประชุม:</span>
                </div>
                <p className="text-gray-800 pl-5 leading-relaxed">{meeting.venue}</p>
              </div>
            )}

            {meeting.onlineUrl && (
              <div className="pt-2 border-t border-gray-100 text-xs bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                <div className="text-blue-900 font-semibold flex items-center gap-1.5 mb-1">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>ห้องประชุมออนไลน์ ({meeting.onlinePlatform || 'Zoom'}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-gray-500">Meeting Link: </span>
                    <a
                      href={meeting.onlineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-mono text-[11px]"
                    >
                      {meeting.onlineUrl}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500">Meeting ID: </span>
                    <span className="font-mono font-semibold">{meeting.onlineMeetingId || '-'}</span>
                    <span className="ml-3 text-gray-500">Passcode: </span>
                    <span className="font-mono font-semibold">{meeting.onlinePasscode || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {meeting.description && (
              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="text-gray-500 mb-1">สาระสำคัญ / หมายเหตุวาระ:</div>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                  {meeting.description}
                </p>
              </div>
            )}
          </div>

          {/* Invitees Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">รายชื่อผู้ได้รับเชิญและสถานะตอบรับ</h3>
                <p className="text-xs text-gray-500">รายการกรรมการและผู้แทนที่ได้รับเชิญเข้าประชุม</p>
              </div>
              <Link
                to={`/responses?meetingId=${meeting.id}`}
                className="text-xs text-mcu-primary hover:underline font-semibold"
              >
                ดูรายงานผลตอบรับฉบับเต็ม &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                    <th className="py-2.5 px-3">ตำแหน่ง / ส่วนงาน</th>
                    <th className="py-2.5 px-3">สิทธิ์องค์ฯ</th>
                    <th className="py-2.5 px-3">สถานะตอบรับ</th>
                    <th className="py-2.5 px-3">รูปแบบ</th>
                    <th className="py-2.5 px-3 text-right">ลิงก์ตอบรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {meetingInvitees.map(inv => (
                    <tr key={inv.id} className="hover:bg-purple-50/20">
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {inv.title}{inv.firstName} {inv.lastName}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {inv.position || inv.organization}
                      </td>
                      <td className="py-2.5 px-3">
                        {inv.hasQuorumRights ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                            นับองค์
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            ไม่นับ
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={inv.rsvpStatus} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {inv.response?.attendanceFormat || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleCopyPersonalLink(inv.personalToken)}
                          className="p-1 text-gray-400 hover:text-mcu-primary hover:bg-gray-100 rounded transition"
                          title="คัดลอกลิงก์ตอบรับส่วนบุคคล"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Documents & Activity Log (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Documents Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>เอกสารแนบ</span>
              <span className="text-xs font-normal text-gray-400">{meetingDocs.length} ไฟล์</span>
            </h3>

            {meetingDocs.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">ไม่มีเอกสารแนบ</p>
            ) : (
              <div className="space-y-2">
                {meetingDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-lg border border-gray-200 hover:border-mcu-primary transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-mcu-primary flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-gray-900 truncate">{doc.title}</div>
                        <div className="text-[10px] text-gray-400">{doc.fileName}</div>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      download
                      onClick={e => {
                        e.preventDefault();
                        showToast('info', 'ดาวน์โหลดเอกสาร', `กำลังดาวน์โหลด ${doc.fileName}`);
                      }}
                      className="p-1.5 text-gray-500 hover:text-mcu-primary rounded"
                      title="ดาวน์โหลด"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity / Audit Log Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-mcu-primary" />
              <span>ประวัติการดำเนินงาน (Activity Log)</span>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {meetingAudits.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">ยังไม่มีประวัติการดำเนินงาน</p>
              ) : (
                meetingAudits.map(log => (
                  <div key={log.id} className="text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-mcu-gold mt-1.5 flex-shrink-0"></span>
                    <div>
                      <div className="font-semibold text-gray-900">{log.action}</div>
                      <div className="text-gray-600 text-[11px] leading-relaxed">{log.details}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        โดย {log.userName} • {formatThaiDateTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Confirmation Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="ส่งข้อความแจ้งเตือนตอบรับการประชุม"
        description="ส่งการแจ้งเตือนไปยังผู้ที่ยังไม่ได้ตอบรับเข้าร่วมประชุม"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowReminderModal(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSendReminder}
              className="px-4 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#C8A54B]" />
              <span>ยืนยันส่งการแจ้งเตือน ({pendingCount} ท่าน)</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          <p>
            ระบบจะจัดส่งข้อความแจ้งเตือนไปยังผู้ได้รับเชิญที่ยังมีสถานะ <span className="font-bold text-amber-700">“ยังไม่ตอบรับ”</span> จำนวน {pendingCount} ท่าน ทางอีเมลและระบบแจ้งเตือนส่วนบุคคล
          </p>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-1">
            <span className="font-bold text-mcu-primary">การประชุม:</span> {meeting.title}
            <div>
              <span className="font-bold text-mcu-primary">กำหนดปิดรับ:</span> {formatThaiDateTime(meeting.rsvpDeadline)}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
