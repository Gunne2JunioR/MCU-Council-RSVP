import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateShort, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  UserCheck,
  Search,
  Copy,
  ExternalLink,
  Filter,
  Share2,
  QrCode as QrIcon,
  Send,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Sparkles,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { MeetingInvitee } from '../types';

export const InviteesPage: React.FC = () => {
  const { invitees, meetings, sendMeetingReminders } = useData();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMeeting, setFilterMeeting] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Share / QR Modal State
  const [selectedInvitee, setSelectedInvitee] = useState<MeetingInvitee | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const filtered = invitees.filter(inv => {
    const name = `${inv.title}${inv.firstName} ${inv.lastName}`;
    const matchSearch =
      searchTerm === '' ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMeeting = filterMeeting === 'all' || inv.meetingId === filterMeeting;
    const matchStatus = filterStatus === 'all' || inv.rsvpStatus === filterStatus;
    return matchSearch && matchMeeting && matchStatus;
  });

  const currentMeetingObj = meetings.find(m => m.id === filterMeeting);

  // Copy Single Link
  const handleCopyLink = (token: string, name: string) => {
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'คัดลอกลิงก์สำเร็จ', `คัดลอกลิงก์เฉพาะบุคคลของ ${name} เรียบร้อยแล้ว`);
  };

  // Copy Full Invitation Message for LINE / Chat
  const handleCopyInvitationMessage = (inv: MeetingInvitee) => {
    const m = meetings.find(item => item.id === inv.meetingId);
    const url = `${window.location.origin}/rsvp/${inv.personalToken}`;
    const messageText = `นมัสการ / เรียน ${inv.title}${inv.firstName} ${inv.lastName}
สำนักงานสภามหาวิทยาลัย มจร. ขอความอนุเคราะห์ท่านโปรดตอบรับการเข้าร่วมประชุมสภามหาวิทยาลัย ครั้งที่ ${m?.meetingNumber || '-'} (${m?.title || '-'})
กำหนดประชุม: ${m ? formatThaiDateShort(m.meetingDate) : '-'} เวลา ${m?.startTime || ''} น.
ณ ${m?.venue || 'ห้องประชุม 401 อาคารสำนักงานอธิการบดี'}

โปรดคลิกลิงก์เฉพาะบุคคลของท่านเพื่อตอบรับและเลือกรูปแบบการเข้าร่วม:
${url}

(ลิงก์นี้เฉพาะสำหรับ ${inv.title}${inv.firstName} ${inv.lastName} เท่านั้น ข้อมูลจะถูกบันทึกเข้าระบบสภาฯ ทันที)`;

    navigator.clipboard.writeText(messageText);
    showToast('success', 'คัดลอกข้อความพร้อมลิงก์สำเร็จ', 'สามารถนำไปวางส่งใน LINE หรืออีเมลได้ทันที');
  };

  // Export All Personal Links to Excel
  const handleExportLinksExcel = () => {
    const dataRows = filtered.map((inv, idx) => {
      const m = meetings.find(item => item.id === inv.meetingId);
      const personalUrl = `${window.location.origin}/rsvp/${inv.personalToken}`;
      return {
        'ลำดับ': idx + 1,
        'ชื่อ-นามสกุล': `${inv.title}${inv.firstName} ${inv.lastName}`,
        'ตำแหน่ง': inv.position,
        'ส่วนงาน/สังกัด': inv.organization,
        'เบอร์โทรศัพท์': inv.phone,
        'อีเมล': inv.email,
        'การประชุม': `${m?.title || ''} (ครั้งที่ ${m?.meetingNumber || ''})`,
        'สถานะตอบรับ': inv.rsvpStatus === 'attend' ? 'เข้าร่วม' : inv.rsvpStatus === 'leave' ? 'ลาประชุม' : inv.rsvpStatus === 'delegate' ? 'ผู้แทน' : 'ยังไม่ตอบรับ',
        'ลิงก์ตอบรับเฉพาะบุคคล (Personal RSVP URL)': personalUrl
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ลิงก์เฉพาะบุคคล');
    XLSX.writeFile(wb, `MCU_Personal_RSVP_Links_${Date.now()}.xlsx`);
    showToast('success', 'ส่งออกไฟล์ Excel สำเร็จ', 'รวมลิงก์เฉพาะบุคคลของกรรมการทุกท่านเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-mcu-primary" />
            <span>ลิงก์เฉพาะกรรมการแต่ละคนและผู้ได้รับเชิญ (Personal RSVP Links)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            สร้างและแจกจ่ายลิงก์ตอบรับเฉพาะบุคคล (Personal Token) สำหรับกรรมการแต่ละท่าน ข้อมูลตอบรับจะถูกจับคู่และบันทึกเข้าระบบอัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportLinksExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก Excel รวมทุกลิงก์</span>
          </button>
        </div>
      </div>

      {/* Highlights / How it works Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50/50 border border-purple-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-mcu-primary text-white rounded-lg shadow-xs flex-shrink-0">
            <Sparkles className="w-5 h-5 text-mcu-gold" />
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <h4 className="font-bold text-mcu-darkPurple text-sm">ข้อดีของ "ลิงก์เฉพาะบุคคล" ในการเก็บข้อมูล:</h4>
            <p className="leading-relaxed">
              • กรรมการหรือเลขาฯ ส่วนตัวสามารถคลิกตอบรับได้ทันทีโดย<strong>ไม่ต้องล็อกอินรหัสผ่าน</strong><br />
              • ระบบรู้ตัวตนล่วงหน้าอัตโนมัติ (Prefilled Data) ป้องกันการกรอกชื่อซ้ำหรือสะกดผิด<br />
              • สามารถกดปุ่ม <span className="font-semibold text-mcu-primary">"คัดลอกข้อความ LINE"</span> เพื่อส่งเข้ากลุ่ม LINE หรือแช็ตส่วนตัวของกรรมการได้ในคลิกเดียว
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, ตำแหน่ง หรือสังกัด..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-mcu-primary"
          />
        </div>

        <div>
          <select
            value={filterMeeting}
            onChange={e => setFilterMeeting(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-mcu-primary font-medium"
          >
            <option value="all">ทุกการประชุม ({invitees.length} รายการ)</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                ครั้งที่ {m.meetingNumber} - {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-mcu-primary"
          >
            <option value="all">สถานะตอบรับทั้งหมด</option>
            <option value="pending">ยังไม่ตอบรับ (รอติดตาม)</option>
            <option value="attend">ตอบรับเข้าร่วม</option>
            <option value="leave">ขอลาการประชุม</option>
            <option value="delegate">มอบหมายผู้แทน</option>
            <option value="cannot_attend">ไม่สามารถเข้าร่วม</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="p-3 w-12 text-center">ลำดับ</th>
                <th className="p-3">ชื่อ-นามสกุลกรรมการ / ผู้ได้รับเชิญ</th>
                <th className="p-3">ตำแหน่ง / ส่วนงาน</th>
                <th className="p-3">การประชุม</th>
                <th className="p-3">สถานะตอบรับ</th>
                <th className="p-3 text-center">คัดลอกลิงก์เฉพาะบุคคล</th>
                <th className="p-3 text-right">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลผู้ได้รับเชิญตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              ) : (
                filtered.map((inv, idx) => {
                  const m = meetings.find(item => item.id === inv.meetingId);
                  const personalUrl = `${window.location.origin}/rsvp/${inv.personalToken}`;
                  return (
                    <tr key={inv.id} className="hover:bg-purple-50/20 transition">
                      <td className="p-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-gray-900">
                        {inv.title}{inv.firstName} {inv.lastName}
                        {inv.inviteeType === 'member' && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-mcu-primary font-medium">
                            กรรมการสภาฯ
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        <div>{inv.position}</div>
                        <div className="text-[10px] text-gray-400">{inv.organization}</div>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div className="font-medium text-gray-800 line-clamp-1">{m?.title}</div>
                        <div className="text-[10px] text-gray-400">ครั้งที่ {m?.meetingNumber} ({m ? formatThaiDateShort(m.meetingDate) : '-'})</div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={inv.rsvpStatus} size="sm" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-gray-50 border border-gray-200 rounded-lg max-w-xs truncate text-[11px] font-mono text-gray-600">
                          <span className="truncate">{personalUrl}</span>
                          <button
                            onClick={() => handleCopyLink(inv.personalToken, `${inv.title}${inv.firstName} ${inv.lastName}`)}
                            className="p-1 hover:text-mcu-primary hover:bg-white rounded transition text-gray-400"
                            title="คัดลอกเฉพาะ URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyInvitationMessage(inv)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition flex items-center gap-1 text-[11px]"
                            title="คัดลอกข้อความคำเชิญพร้อมลิงก์สำหรับส่ง LINE"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden md:inline">ก๊อปข้อความ LINE</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvitee(inv);
                              setIsShareModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                            title="ดู QR Code และรายละเอียดการแชร์"
                          >
                            <QrIcon className="w-4 h-4 text-mcu-primary" />
                          </button>

                          <Link
                            to={`/rsvp/${inv.personalToken}`}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                            title="เปิดหน้าตอบรับของกรรมการท่านนี้ทันที"
                          >
                            <ExternalLink className="w-4 h-4 text-mcu-gold" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share / QR Code Modal */}
      {selectedInvitee && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`ลิงก์และ QR Code ตอบรับเฉพาะบุคคล: ${selectedInvitee.title}${selectedInvitee.firstName} ${selectedInvitee.lastName}`}
          maxWidth="md"
          footer={
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg text-gray-700"
            >
              ปิดหน้าต่าง
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 text-gray-700">
              <p className="font-semibold text-mcu-darkPurple">{selectedInvitee.title}${selectedInvitee.firstName} {selectedInvitee.lastName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{selectedInvitee.position} • {selectedInvitee.organization}</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
              <QRCodeSVG
                value={`${window.location.origin}/rsvp/${selectedInvitee.personalToken}`}
                size={160}
                level="M"
                includeMargin
              />
              <span className="text-[11px] text-gray-500 mt-2 font-medium">
                สแกนด้วยสมาร์ตโฟนเพื่อเปิดหน้าตอบรับทันที
              </span>
            </div>

            {/* URL Display */}
            <div>
              <label className="block text-gray-600 font-semibold mb-1">ลิงก์เฉพาะบุคคล (Unique URL):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/rsvp/${selectedInvitee.personalToken}`}
                  className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-[11px] select-all outline-none"
                />
                <button
                  onClick={() => handleCopyLink(selectedInvitee.personalToken, `${selectedInvitee.title}${selectedInvitee.firstName} ${selectedInvitee.lastName}`)}
                  className="px-3 py-2 bg-mcu-primary hover:bg-mcu-secondary text-white font-semibold rounded-lg flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก</span>
                </button>
              </div>
            </div>

            {/* LINE / Message Action */}
            <div className="pt-2">
              <button
                onClick={() => handleCopyInvitationMessage(selectedInvitee)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>คัดลอกข้อความทางการพร้อมลิงก์ (สำหรับส่ง LINE)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
