import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDate, formatThaiDateShort, formatThaiTime, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Eye,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  FileText,
  BarChart,
  School
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportReportToPdf, printReportHtml } from '../utils/pdfExport';

export const ReportsPage: React.FC = () => {
  const { meetings, invitees, attendanceLogs, quorumLogs, committeeMembers } = useData();
  const { showToast } = useToast();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [selectedReportType, setSelectedReportType] = useState<string>('rsvp_summary');
  const [dateRangeFrom, setDateRangeFrom] = useState('2026-01-01');
  const [dateRangeTo, setDateRangeTo] = useState('2026-12-31');

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const currentMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  const meetingInvitees = invitees.filter(i => i.meetingId === selectedMeetingId);
  const meetingAttendances = attendanceLogs.filter(a => a.meetingId === selectedMeetingId);

  // 10 Report Types
  const reportOptions = [
    { id: 'rsvp_summary', label: '1. รายงานสรุปผลการตอบรับ (RSVP Summary)' },
    { id: 'attend_onsite', label: '2. รายชื่อผู้เข้าร่วมประชุม Onsite (ณ ห้องประชุม 401)' },
    { id: 'attend_online', label: '3. รายชื่อผู้เข้าร่วมประชุม Online (ผ่านระบบออนไลน์)' },
    { id: 'leave_list', label: '4. รายชื่อผู้ขอลาการประชุม' },
    { id: 'delegate_list', label: '5. รายชื่อผู้ขอมอบหมายผู้แทนเข้าร่วมประชุม' },
    { id: 'pending_list', label: '6. รายชื่อผู้ยังไม่ตอบรับการเข้าร่วม' },
    { id: 'actual_attendance', label: '7. รายงานเช็กชื่อจริงวันประชุม (Actual Attendance Log)' },
    { id: 'quorum_status', label: '8. รายงานสถานะและการรับรององค์ประชุม (Quorum Report)' },
    { id: 'individual_stats', label: '9. สถิติการเข้าร่วมประชุมรายบุคคล (Attendance by Member)' },
    { id: 'periodic_stats', label: '10. สถิติภาพรวมรายเดือน รายไตรมาส และรายปี' }
  ];

  // Generate Report Table Data based on selected report type
  const reportData = useMemo(() => {
    switch (selectedReportType) {
      case 'rsvp_summary':
        return meetingInvitees.map((inv, idx) => ({
          col1: idx + 1,
          col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
          col3: inv.position,
          col4: inv.rsvpStatus === 'attend' ? `เข้าร่วม (${inv.response?.attendanceFormat})` : inv.rsvpStatus,
          col5: inv.response?.reason || inv.delegateRequest?.reason || '-',
          col6: inv.hasQuorumRights ? 'มีสิทธิ์นับองค์' : 'ไม่นับ'
        }));

      case 'attend_onsite':
        return meetingInvitees
          .filter(i => i.rsvpStatus === 'attend' && i.response?.attendanceFormat === 'Onsite')
          .map((inv, idx) => ({
            col1: idx + 1,
            col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
            col3: inv.position,
            col4: inv.organization,
            col5: inv.response?.dietaryPreferences || 'ปกติ',
            col6: 'Onsite (ห้อง 401)'
          }));

      case 'attend_online':
        return meetingInvitees
          .filter(i => i.rsvpStatus === 'attend' && i.response?.attendanceFormat === 'Online')
          .map((inv, idx) => ({
            col1: idx + 1,
            col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
            col3: inv.position,
            col4: inv.organization,
            col5: inv.email,
            col6: currentMeeting?.onlinePlatform || 'Zoom'
          }));

      case 'leave_list':
        return meetingInvitees
          .filter(i => i.rsvpStatus === 'leave')
          .map((inv, idx) => ({
            col1: idx + 1,
            col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
            col3: inv.position,
            col4: inv.leaveRequest?.reason || inv.response?.reason || '-',
            col5: inv.leaveRequest?.status || 'pending',
            col6: inv.leaveRequest?.reviewNotes || '-'
          }));

      case 'delegate_list':
        return meetingInvitees
          .filter(i => i.rsvpStatus === 'delegate')
          .map((inv, idx) => ({
            col1: idx + 1,
            col2: `${inv.title}${inv.firstName} ${inv.lastName} (ผู้มอบ)`,
            col3: `${inv.delegateRequest?.delegateTitle || ''}${inv.delegateRequest?.delegateName || ''} (ผู้แทน)`,
            col4: inv.delegateRequest?.delegatePosition || '-',
            col5: inv.delegateRequest?.reason || '-',
            col6: inv.delegateRequest?.canCountAsQuorum ? 'นับเป็นองค์ประชุม' : 'ไม่นับองค์ประชุม'
          }));

      case 'pending_list':
        return meetingInvitees
          .filter(i => i.rsvpStatus === 'pending')
          .map((inv, idx) => ({
            col1: idx + 1,
            col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
            col3: inv.position,
            col4: inv.phone,
            col5: inv.email,
            col6: 'ยังไม่ตอบรับ'
          }));

      case 'actual_attendance':
        return meetingAttendances.map((att, idx) => {
          const inv = invitees.find(i => i.id === att.meetingInviteeId);
          return {
            col1: idx + 1,
            col2: `${inv?.title || ''}${inv?.firstName || ''} ${inv?.lastName || ''}`,
            col3: att.actualFormat,
            col4: formatThaiTime(att.checkInTime),
            col5: att.checkOutTime ? formatThaiTime(att.checkOutTime) : 'ยังอยู่ในห้องประชุม',
            col6: att.checkInMethod
          };
        });

      case 'individual_stats':
        return committeeMembers.map((cm, idx) => ({
          col1: idx + 1,
          col2: `${cm.profile?.title || ''}${cm.profile?.firstName || ''} ${cm.profile?.lastName || ''}`,
          col3: cm.committeeRole,
          col4: cm.profile?.organization || 'มจร.',
          col5: 'เข้าร่วม 85% (8/9 ครั้ง)',
          col6: 'สถานะปกติ'
        }));

      default:
        return meetingInvitees.map((inv, idx) => ({
          col1: idx + 1,
          col2: `${inv.title}${inv.firstName} ${inv.lastName}`,
          col3: inv.position,
          col4: inv.rsvpStatus,
          col5: inv.response?.attendanceFormat || '-',
          col6: '-'
        }));
    }
  }, [selectedReportType, meetingInvitees, meetingAttendances, currentMeeting, committeeMembers, invitees]);

  // Headers for current report table
  const tableHeaders = useMemo(() => {
    switch (selectedReportType) {
      case 'rsvp_summary':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ผลตอบรับ', 'เหตุผล/หมายเหตุ', 'สิทธิ์องค์ฯ'];
      case 'attend_onsite':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ส่วนงาน', 'อาหาร/ภัตตาหาร', 'สถานที่'];
      case 'attend_online':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ส่วนงาน', 'อีเมล', 'แพลตฟอร์ม'];
      case 'leave_list':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'เหตุผลการลา', 'สถานะพิจารณา', 'บันทึกสำนักงาน'];
      case 'delegate_list':
        return ['ลำดับ', 'กรรมการผู้มอบหมาย', 'ผู้แทนที่ได้รับมอบ', 'ตำแหน่งผู้แทน', 'เหตุผล', 'สิทธิ์องค์ประชุม'];
      case 'pending_list':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'โทรศัพท์', 'อีเมล', 'สถานะ'];
      case 'actual_attendance':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'รูปแบบเข้าประชุม', 'เวลาเข้า', 'เวลาออก', 'วิธีเช็กชื่อ'];
      case 'individual_stats':
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่งในสภาฯ', 'สังกัด/ส่วนงาน', 'สถิติการเข้าประชุม', 'สถานะ'];
      default:
        return ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'สถานะ', 'รูปแบบ', 'หมายเหตุ'];
    }
  }, [selectedReportType]);

  // Download Excel
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      reportData.map(r => ({
        [tableHeaders[0]]: r.col1,
        [tableHeaders[1]]: r.col2,
        [tableHeaders[2]]: r.col3,
        [tableHeaders[3]]: r.col4,
        [tableHeaders[4]]: r.col5,
        [tableHeaders[5]]: r.col6
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, `MCU_Report_${selectedReportType}.xlsx`);
    showToast('success', 'ดาวน์โหลดรายงาน Excel สำเร็จ');
  };

  // Direct Download PDF (jsPDF)
  const handleDownloadPdf = () => {
    try {
      const selectedOption = reportOptions.find(o => o.id === selectedReportType);
      exportReportToPdf({
        title: selectedOption?.label || 'รายงานการประชุมสภามหาวิทยาลัย มจร.',
        meeting: currentMeeting,
        headers: tableHeaders,
        data: reportData.map(r => [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6]),
        summaryNotes: [
          `ข้อมูล ณ วันที่พิมพ์รายงาน: ${formatThaiDate(new Date().toISOString())}`,
          'เอกสารนี้สร้างจากระบบตอบรับเข้าร่วมประชุมสภามหาวิทยาลัย มจร. (MCU Council RSVP)',
          'การรับรององค์ประชุมเป็นไปตามข้อบังคับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'
        ]
      });
      showToast('success', 'ดาวน์โหลดไฟล์ PDF รายงานสำเร็จ');
    } catch (err) {
      console.error(err);
      showToast('error', 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    }
  };

  // Print to PDF with Official Thai Typography
  const handlePrint = () => {
    try {
      const selectedOption = reportOptions.find(o => o.id === selectedReportType);
      printReportHtml({
        title: selectedOption?.label || 'รายงานการประชุมสภามหาวิทยาลัย มจร.',
        meeting: currentMeeting,
        headers: tableHeaders,
        data: reportData.map(r => [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6]),
        summaryNotes: [
          `ข้อมูล ณ วันที่พิมพ์รายงาน: ${formatThaiDate(new Date().toISOString())}`,
          'เอกสารนี้สร้างจากระบบตอบรับเข้าร่วมประชุมสภามหาวิทยาลัย มจร. (MCU Council RSVP)',
          'การรับรององค์ประชุมเป็นไปตามข้อบังคับมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'
        ]
      });
      showToast('info', 'กำลังเปิดหน้าต่างพิมพ์รายงานทางการ...');
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-mcu-primary" />
            <span>รายงานและสถิติการประชุม (Reports & Analytics)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            สร้างรายงานผลการตอบรับ รายชื่อผู้เข้าร่วม องค์ประชุม และสถิติภาพรวม พร้อมพิมพ์และส่งออก
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 border border-purple-200 text-mcu-primary bg-purple-50 hover:bg-purple-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-mcu-gold" />
            <span>พรีวิว</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก Excel</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>ดาวน์โหลด PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#C8A54B]" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* 1. Report Type Selection */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1.5">
              เลือกรูปแบบรายงาน (10 รูปแบบ) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedReportType}
              onChange={e => setSelectedReportType(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-white font-medium text-gray-800 outline-none focus:ring-2 focus:ring-mcu-primary"
            >
              {reportOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Meeting Selection */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              เลือกการประชุม
            </label>
            <select
              value={selectedMeetingId}
              onChange={e => setSelectedMeetingId(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-white font-medium text-gray-800 outline-none focus:ring-2 focus:ring-mcu-primary"
            >
              {meetings.map(m => (
                <option key={m.id} value={m.id}>
                  ครั้งที่ {m.meetingNumber} ({formatThaiDateShort(m.meetingDate)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Selection (for quarterly/annual stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">ช่วงวันที่เริ่มต้น</label>
            <input
              type="date"
              value={dateRangeFrom}
              onChange={e => setDateRangeFrom(e.target.value)}
              className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">ถึงวันที่</label>
            <input
              type="date"
              value={dateRangeTo}
              onChange={e => setDateRangeTo(e.target.value)}
              className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Report Document View (Print-Ready) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-10 space-y-6">
        {/* Document Official Header */}
        <div className="text-center pb-6 border-b border-gray-200 space-y-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B1F5E] to-[#6B3F83] text-[#C8A54B] mx-auto flex items-center justify-center font-bold text-xs shadow-sm mb-2 border border-[#C8A54B]">
            มจร
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            สำนักงานสภามหาวิทยาลัย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </h2>
          <h3 className="text-sm font-semibold text-mcu-primary">
            {reportOptions.find(r => r.id === selectedReportType)?.label}
          </h3>
          <p className="text-xs text-gray-500">
            การประชุม{currentMeeting?.committeeName || 'สภามหาวิทยาลัย'} ครั้งที่ {currentMeeting?.meetingNumber} วันที่ {formatThaiDate(currentMeeting?.meetingDate)}
          </p>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                {tableHeaders.map((th, idx) => (
                  <th key={idx} className="py-2.5 px-3 border-r border-gray-200 last:border-r-0">
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60">
                  <td className="py-2.5 px-3 border-r border-gray-200 text-center font-mono w-12">
                    {row.col1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-gray-200 font-semibold text-gray-900">
                    {row.col2}
                  </td>
                  <td className="py-2.5 px-3 border-r border-gray-200">{row.col3}</td>
                  <td className="py-2.5 px-3 border-r border-gray-200">{row.col4}</td>
                  <td className="py-2.5 px-3 border-r border-gray-200">{row.col5}</td>
                  <td className="py-2.5 px-3">{row.col6}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Document Signatures Area */}
        <div className="pt-10 grid grid-cols-2 text-center text-xs text-gray-700 gap-8">
          <div>
            <p className="mb-14">ลงชื่อ.......................................................... เจ้าหน้าที่ผู้จัดทำ</p>
            <p className="font-semibold">(นางสาววราภรณ์ กัลยาณมิตร)</p>
            <p className="text-[11px] text-gray-500">นักวิชาการสำนักงานสภามหาวิทยาลัย</p>
          </div>
          <div>
            <p className="mb-14">ลงชื่อ.......................................................... เลขานุการสภาฯ</p>
            <p className="font-semibold">(พระมหาบุญรอด ปิยธมฺโม, รศ.ดร.)</p>
            <p className="text-[11px] text-gray-500">รองอธิการบดีฝ่ายบริหาร / เลขานุการสภามหาวิทยาลัย</p>
          </div>
        </div>
      </div>

      {/* Interactive Report Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="ตัวอย่างก่อนดาวน์โหลดรายงาน (Interactive Preview)"
        maxWidth="4xl"
        footer={
          <>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                handleDownloadExcel();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Excel</span>
            </button>
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                handleDownloadPdf();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-lg text-mcu-primary font-semibold">
            {reportOptions.find(r => r.id === selectedReportType)?.label} - {currentMeeting?.title}
          </div>
          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-2 text-gray-600 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.map((r, i) => (
                  <tr key={i}>
                    <td className="p-2">{r.col1}</td>
                    <td className="p-2 font-medium">{r.col2}</td>
                    <td className="p-2">{r.col3}</td>
                    <td className="p-2">{r.col4}</td>
                    <td className="p-2">{r.col5}</td>
                    <td className="p-2">{r.col6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
