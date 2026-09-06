import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateShort, formatThaiTime, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  UserMinus,
  FileSpreadsheet,
  Printer,
  Copy,
  ExternalLink,
  FileText
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { exportReportToPdf } from '../utils/pdfExport';

export const ResponsesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMeetingId = searchParams.get('meetingId');
  const { meetings, invitees, sendMeetingReminders } = useData();
  const { showToast } = useToast();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    initialMeetingId || meetings[0]?.id || ''
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Remind modal
  const [showRemindModal, setShowRemindModal] = useState(false);

  // Current selected meeting
  const currentMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];

  // Invitees for current meeting
  const currentInvitees = useMemo(() => {
    return invitees.filter(i => i.meetingId === selectedMeetingId);
  }, [invitees, selectedMeetingId]);

  // Counts
  const totalCount = currentInvitees.length;
  const onsiteCount = currentInvitees.filter(i => i.response?.status === 'attend' && i.response?.attendanceFormat === 'Onsite').length;
  const onlineCount = currentInvitees.filter(i => i.response?.status === 'attend' && i.response?.attendanceFormat === 'Online').length;
  const leaveCount = currentInvitees.filter(i => i.rsvpStatus === 'leave').length;
  const cannotCount = currentInvitees.filter(i => i.rsvpStatus === 'cannot_attend').length;
  const delegateCount = currentInvitees.filter(i => i.rsvpStatus === 'delegate').length;
  const pendingCount = currentInvitees.filter(i => i.rsvpStatus === 'pending').length;

  // Chart data
  const chartData = [
    { name: 'เข้าร่วม Onsite', count: onsiteCount, fill: '#10B981' },
    { name: 'เข้าร่วม Online', count: onlineCount, fill: '#2563EB' },
    { name: 'มอบหมายผู้แทน', count: delegateCount, fill: '#6366F1' },
    { name: 'ลาประชุม', count: leaveCount, fill: '#EF4444' },
    { name: 'ไม่สามารถร่วม', count: cannotCount, fill: '#F87171' },
    { name: 'ยังไม่ตอบรับ', count: pendingCount, fill: '#9CA3AF' },
  ].filter(d => d.count > 0);

  // Filtered invitees
  const filteredInvitees = useMemo(() => {
    return currentInvitees.filter(i => {
      const matchSearch =
        searchTerm === '' ||
        `${i.title}${i.firstName} ${i.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === 'all' || i.rsvpStatus === filterStatus;
      const matchFormat = filterFormat === 'all' || i.response?.attendanceFormat === filterFormat;
      const matchType = filterType === 'all' || i.inviteeType === filterType;

      return matchSearch && matchStatus && matchFormat && matchType;
    });
  }, [currentInvitees, searchTerm, filterStatus, filterFormat, filterType]);

  // Send reminders
  const handleSendReminder = () => {
    const count = sendMeetingReminders(selectedMeetingId);
    setShowRemindModal(false);
    showToast(
      'success',
      'ส่งข้อความเตือนเรียบร้อย',
      `ส่งเตือนผู้ที่ยังไม่ตอบรับจำนวน ${count} ท่าน`
    );
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!currentMeeting) return;

    const dataRows = filteredInvitees.map((inv, idx) => ({
      ลำดับ: idx + 1,
      'ชื่อ-นามสกุล': `${inv.title}${inv.firstName} ${inv.lastName}`,
      ตำแหน่ง: inv.position,
      ส่วนงาน: inv.organization,
      ประเภท: inv.inviteeType === 'member' ? 'กรรมการ' : inv.inviteeType,
      สถานะตอบรับ:
        inv.rsvpStatus === 'attend'
          ? 'เข้าร่วม'
          : inv.rsvpStatus === 'leave'
          ? 'ลาประชุม'
          : inv.rsvpStatus === 'cannot_attend'
          ? 'ไม่สามารถเข้าร่วม'
          : inv.rsvpStatus === 'delegate'
          ? 'มอบหมายผู้แทน'
          : 'ยังไม่ตอบรับ',
      รูปแบบการเข้าร่วม: inv.response?.attendanceFormat || '-',
      เหตุผล: inv.response?.reason || inv.delegateRequest?.reason || inv.leaveRequest?.reason || '-',
      วันที่ตอบรับ: inv.response?.submittedAt ? formatThaiDateTime(inv.response.submittedAt) : '-',
      สิทธิ์นับองค์ประชุม: inv.hasQuorumRights ? 'มีสิทธิ์' : 'ไม่มีสิทธิ์'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ผลการตอบรับ');
    XLSX.writeFile(workbook, `MCU_RSVP_${currentMeeting.meetingNumber.replace('/', '-')}.xlsx`);
    showToast('success', 'ส่งออกข้อมูลสำเร็จ', 'ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header and Meeting Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            ผลการตอบรับการประชุม (RSVP Tracking)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ติดตามและรายงานผลการตอบรับเข้าร่วมประชุมสภามหาวิทยาลัย
          </p>
        </div>

        {/* Meeting Dropdown Selector */}
        <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            เลือกการประชุม:
          </label>
          <select
            value={selectedMeetingId}
            onChange={e => setSelectedMeetingId(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-purple-200 rounded-lg bg-white shadow-xs font-semibold text-mcu-primary focus:ring-2 focus:ring-mcu-primary outline-none"
          >
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                ครั้งที่ {m.meetingNumber} ({formatThaiDateShort(m.meetingDate)}) - {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7 Summary Cards as requested */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 font-medium">ผู้ได้รับเชิญ</span>
          <div className="text-xl font-bold text-gray-900 mt-0.5">{totalCount}</div>
          <span className="text-[10px] text-gray-400">ท่าน</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] text-emerald-700 font-semibold">เข้าร่วม Onsite</span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{onsiteCount}</div>
          <span className="text-[10px] text-emerald-600">ในห้องประชุม</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[10px] text-blue-700 font-semibold">เข้าร่วม Online</span>
          <div className="text-xl font-bold text-blue-600 mt-0.5">{onlineCount}</div>
          <span className="text-[10px] text-blue-600">ออนไลน์</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-[10px] text-rose-700 font-semibold">ลาประชุม</span>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{leaveCount}</div>
          <span className="text-[10px] text-rose-600">แจ้งลา</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-red-200 shadow-xs bg-red-50/20">
          <span className="text-[10px] text-red-700 font-semibold">ไม่สามารถร่วม</span>
          <div className="text-xl font-bold text-red-600 mt-0.5">{cannotCount}</div>
          <span className="text-[10px] text-red-600">ติดภารกิจ</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/20">
          <span className="text-[10px] text-indigo-700 font-semibold">มอบหมายผู้แทน</span>
          <div className="text-xl font-bold text-indigo-600 mt-0.5">{delegateCount}</div>
          <span className="text-[10px] text-indigo-600">ส่งผู้แทน</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-[10px] text-amber-700 font-semibold">ยังไม่ตอบรับ</span>
          <div className="text-xl font-bold text-amber-600 mt-0.5">{pendingCount}</div>
          <span className="text-[10px] text-amber-700 font-medium">รอการตอบ</span>
        </div>
      </div>

      {/* Chart and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">
              แผนภูมิเปรียบเทียบผลการตอบรับ
            </h3>
            <span className="text-[11px] text-gray-400">
              การประชุมครั้งที่ {currentMeeting?.meetingNumber}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => [`${val} ท่าน`, 'จำนวน']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">
              การดำเนินการด่วน
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              ติดตามผู้ที่ยังไม่ได้ตอบรับ หรือส่งออกข้อมูลเพื่อเตรียมจัดทำแฟ้มประชุม
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setShowRemindModal(true)}
                disabled={pendingCount === 0}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>ส่งเตือนเฉพาะผู้ยังไม่ตอบรับ ({pendingCount} ท่าน)</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ส่งออกรายงานเป็น Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => {
                  try {
                    exportReportToPdf({
                      title: `รายงานสรุปผลการตอบรับเข้าร่วมประชุม (ครั้งที่ ${currentMeeting?.meetingNumber || '-'})`,
                      meeting: currentMeeting,
                      headers: ['ลำดับ', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'สถานะตอบรับ', 'รูปแบบ/เหตุผล', 'สิทธิ์องค์ประชุม'],
                      data: filteredInvitees.map((inv, idx) => [
                        idx + 1,
                        `${inv.title}${inv.firstName} ${inv.lastName}`,
                        inv.position,
                        inv.rsvpStatus === 'attend' ? `เข้าร่วม (${inv.response?.attendanceFormat || '-'})` : inv.rsvpStatus,
                        inv.response?.reason || inv.delegateRequest?.reason || inv.leaveRequest?.reason || '-',
                        inv.hasQuorumRights ? 'มีสิทธิ์' : 'ไม่มีสิทธิ์'
                      ]),
                      summaryNotes: [
                        `ยอดผู้ได้รับเชิญทั้งหมด: ${totalCount} ท่าน`,
                        `เข้าร่วม Onsite: ${onsiteCount} ท่าน | เข้าร่วม Online: ${onlineCount} ท่าน | ลาประชุม: ${leaveCount} ท่าน | มอบหมายผู้แทน: ${delegateCount} ท่าน | ยังไม่ตอบรับ: ${pendingCount} ท่าน`,
                        `กำหนดปิดรับตอบรับ: ${formatThaiDateTime(currentMeeting?.rsvpDeadline)}`
                      ]
                    });
                    showToast('success', 'ดาวน์โหลดไฟล์ PDF รายงานสำเร็จ');
                  } catch (err) {
                    console.error(err);
                    showToast('error', 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
                  }
                }}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>ดาวน์โหลดรายงานเป็น PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>พิมพ์หน้านี้</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            กำหนดปิดรับ: {formatThaiDateTime(currentMeeting?.rsvpDeadline)}
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ-นามสกุล หรือตำแหน่ง..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mcu-primary"
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
            >
              <option value="all">ทุกสถานะตอบรับ</option>
              <option value="attend">เข้าร่วม</option>
              <option value="delegate">มอบหมายผู้แทน</option>
              <option value="leave">ลาประชุม</option>
              <option value="cannot_attend">ไม่สามารถเข้าร่วม</option>
              <option value="pending">ยังไม่ตอบรับ</option>
            </select>
          </div>

          {/* Filter Format */}
          <div>
            <select
              value={filterFormat}
              onChange={e => setFilterFormat(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
            >
              <option value="all">ทุกรูปแบบเข้าร่วม</option>
              <option value="Onsite">Onsite (ในห้องประชุม)</option>
              <option value="Online">Online (ออนไลน์)</option>
            </select>
          </div>

          {/* Filter Invitee Type */}
          <div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
            >
              <option value="all">ทุกประเภทผู้ได้รับเชิญ</option>
              <option value="member">กรรมการ</option>
              <option value="presenter">ผู้ชี้แจงวาระ</option>
              <option value="observer">ผู้สังเกตการณ์</option>
              <option value="attendee">ผู้เข้าร่วม</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Response Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3">ตำแหน่ง / ส่วนงาน</th>
                <th className="py-3 px-3">ประเภท</th>
                <th className="py-3 px-3">สถานะตอบรับ</th>
                <th className="py-3 px-3">รูปแบบ</th>
                <th className="py-3 px-3">เหตุผล / ผู้แทน</th>
                <th className="py-3 px-3">วันที่ตอบรับ</th>
                <th className="py-3 px-3 text-right">ลิงก์ตอบรับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredInvitees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredInvitees.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-purple-50/20 transition">
                    <td className="py-3 px-3 text-center text-gray-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Full name */}
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      {inv.title}{inv.firstName} {inv.lastName}
                    </td>

                    {/* Position / Org */}
                    <td className="py-3 px-3 text-gray-600">
                      <div>{inv.position}</div>
                      <div className="text-[10px] text-gray-400">{inv.organization}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {inv.inviteeType === 'member' ? 'กรรมการ' : inv.inviteeType}
                      </span>
                    </td>

                    {/* RSVP Status */}
                    <td className="py-3 px-3">
                      <StatusBadge status={inv.rsvpStatus} size="sm" />
                    </td>

                    {/* Attendance Format */}
                    <td className="py-3 px-3">
                      {inv.response?.attendanceFormat ? (
                        <span className="font-semibold text-gray-800">
                          {inv.response.attendanceFormat}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Reason or Delegate info */}
                    <td className="py-3 px-3 max-w-xs">
                      {inv.rsvpStatus === 'delegate' ? (
                        <div className="text-indigo-700">
                          <span className="font-semibold">{inv.delegateRequest?.delegateName}</span>
                          <span className="text-[10px] text-gray-500 block">
                            (รอตรวจสอบสิทธิ์องค์ฯ)
                          </span>
                        </div>
                      ) : inv.response?.reason ? (
                        <span className="text-gray-600 line-clamp-1">{inv.response.reason}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Submitted date */}
                    <td className="py-3 px-3 whitespace-nowrap text-gray-500 text-[11px]">
                      {inv.response?.submittedAt ? formatThaiDateShort(inv.response.submittedAt) : 'ยังไม่ตอบ'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/rsvp/${inv.personalToken}`;
                          navigator.clipboard.writeText(url);
                          showToast('success', 'คัดลอกลิงก์ส่วนบุคคลแล้ว');
                        }}
                        className="p-1 text-gray-400 hover:text-mcu-primary rounded"
                        title="คัดลอกลิงก์ตอบรับ"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remind Modal */}
      <Modal
        isOpen={showRemindModal}
        onClose={() => setShowRemindModal(false)}
        title="ส่งการแจ้งเตือนผู้ที่ยังไม่ตอบรับ"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowRemindModal(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSendReminder}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>ยืนยันส่งเตือน ({pendingCount} ท่าน)</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          <p>
            ระบบจะส่งอีเมลและข้อความแจ้งเตือนเตือนความจำไปยังกรรมการ/ผู้ได้รับเชิญที่ยังมีสถานะ
            <strong className="text-amber-700"> “ยังไม่ตอบรับ”</strong> สำหรับการประชุม {currentMeeting?.title}
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
            จำนวนผู้ที่จะได้รับข้อความเตือน: <strong>{pendingCount} ท่าน</strong>
          </div>
        </div>
      </Modal>
    </div>
  );
};
