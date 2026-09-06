import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateShort, formatThaiTime, getBuddhistYearOptions } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import {
  PlusCircle,
  Search,
  Filter,
  Copy,
  Edit,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Meeting, MeetingStatus } from '../types';

export const MeetingListPage: React.FC = () => {
  const { meetings, invitees, duplicateMeeting, updateMeetingStatus, deleteMeeting } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals for actions
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  // Thai months for filter
  const thaiMonths = [
    { val: '0', label: 'มกราคม' },
    { val: '1', label: 'กุมภาพันธ์' },
    { val: '2', label: 'มีนาคม' },
    { val: '3', label: 'เมษายน' },
    { val: '4', label: 'พฤษภาคม' },
    { val: '5', label: 'มิถุนายน' },
    { val: '6', label: 'กรกฎาคม' },
    { val: '7', label: 'สิงหาคม' },
    { val: '8', label: 'กันยายน' },
    { val: '9', label: 'ตุลาคม' },
    { val: '10', label: 'พฤศจิกายน' },
    { val: '11', label: 'ธันวาคม' }
  ];

  const yearOptions = getBuddhistYearOptions(3, 3);

  // Filtering logic
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Search
      const searchMatch =
        searchTerm === '' ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.meetingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.committeeName && m.committeeName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Year
      const yearMatch = filterYear === 'all' || m.beYear.toString() === filterYear;

      // Month
      const d = new Date(m.meetingDate);
      const monthMatch = filterMonth === 'all' || d.getMonth().toString() === filterMonth;

      // Type
      const typeMatch = filterType === 'all' || m.meetingType === filterType;

      // Format
      const formatMatch = filterFormat === 'all' || m.meetingFormat === filterFormat;

      // Status
      const statusMatch = filterStatus === 'all' || m.status === filterStatus;

      return searchMatch && yearMatch && monthMatch && typeMatch && formatMatch && statusMatch;
    });
  }, [meetings, searchTerm, filterYear, filterMonth, filterType, filterFormat, filterStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage) || 1;
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMeetings.slice(start, start + itemsPerPage);
  }, [filteredMeetings, currentPage]);

  // Handlers
  const handleDuplicate = (id: string, title: string) => {
    const newId = duplicateMeeting(id);
    if (newId) {
      showToast('success', 'คัดลอกการประชุมสำเร็จ', `สร้างสำเนาจากการประชุม "${title}" แล้ว`);
      navigate(`/meetings/${newId}/edit`);
    }
  };

  const handleToggleRSVP = (m: Meeting) => {
    const newStatus: MeetingStatus = m.status === 'rsvp_open' ? 'rsvp_closed' : 'rsvp_open';
    updateMeetingStatus(m.id, newStatus);
    showToast(
      'info',
      newStatus === 'rsvp_open' ? 'เปิดรับการตอบรับแล้ว' : 'ปิดรับการตอบรับแล้ว',
      `การประชุมครั้งที่ ${m.meetingNumber}`
    );
  };

  const handleConfirmDelete = () => {
    if (meetingToDelete) {
      deleteMeeting(meetingToDelete.id);
      showToast('success', 'ลบการประชุมสำเร็จ', `ลบการประชุม "${meetingToDelete.title}" แล้ว`);
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              รายการการประชุม
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-mcu-primary">
              {filteredMeetings.length} รายการ
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            บริหารจัดการรายการประชุมสภามหาวิทยาลัยและคณะกรรมการ มจร.
          </p>
        </div>

        <Link
          to="/meetings/create"
          className="self-start sm:self-auto px-4 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#C8A54B]" />
          <span>สร้างการประชุมใหม่</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาชื่อการประชุม หรือ ครั้งที่..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary focus:border-transparent outline-none transition"
            />
          </div>

          {/* Filter Year (พ.ศ.) */}
          <div>
            <select
              value={filterYear}
              onChange={e => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
            >
              <option value="all">ทุกปี พ.ศ.</option>
              {yearOptions.map(y => (
                <option key={y} value={y.toString()}>
                  พ.ศ. {y}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Month */}
          <div>
            <select
              value={filterMonth}
              onChange={e => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
            >
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map(m => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Format */}
          <div>
            <select
              value={filterFormat}
              onChange={e => {
                setFilterFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
            >
              <option value="all">ทุกรูปแบบ</option>
              <option value="Onsite">Onsite</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="draft">ร่างการประชุม</option>
              <option value="rsvp_open">เปิดรับตอบรับ</option>
              <option value="rsvp_closed">ปิดรับตอบรับ</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>

        {/* Clear filter indicator */}
        {(searchTerm || filterYear !== 'all' || filterMonth !== 'all' || filterFormat !== 'all' || filterStatus !== 'all') && (
          <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100">
            <span>ผลการกรอง: {filteredMeetings.length} รายการ</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterYear('all');
                setFilterMonth('all');
                setFilterType('all');
                setFilterFormat('all');
                setFilterStatus('all');
                setCurrentPage(1);
              }}
              className="text-mcu-primary hover:underline font-medium"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Meeting Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        {paginatedMeetings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="ไม่พบการประชุมที่ตรงกับเงื่อนไข"
              description="ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายการทั้งหมด"
              actionLabel="สร้างการประชุมใหม่"
              onAction={() => navigate('/meetings/create')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="py-3 px-4">ชื่อการประชุม</th>
                  <th className="py-3 px-3">ครั้งที่</th>
                  <th className="py-3 px-3">วันที่และเวลา</th>
                  <th className="py-3 px-3">รูปแบบ</th>
                  <th className="py-3 px-3">สถานะตอบรับ</th>
                  <th className="py-3 px-3 text-center">ตอบรับแล้ว / เชิญ</th>
                  <th className="py-3 px-3">ปิดรับตอบรับ</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedMeetings.map(m => {
                  const mInvitees = invitees.filter(i => i.meetingId === m.id);
                  const respondedCount = mInvitees.filter(i => i.rsvpStatus !== 'pending').length;
                  const ratio = mInvitees.length > 0 ? (respondedCount / mInvitees.length) * 100 : 0;

                  return (
                    <tr key={m.id} className="hover:bg-purple-50/30 transition">
                      {/* Meeting Title & Committee */}
                      <td className="py-3.5 px-4 font-medium max-w-xs">
                        <Link
                          to={`/meetings/${m.id}`}
                          className="font-bold text-gray-900 hover:text-mcu-primary block line-clamp-1"
                        >
                          {m.title}
                        </Link>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {m.committeeName || 'สภามหาวิทยาลัย'}
                        </span>
                      </td>

                      {/* Session / Round */}
                      <td className="py-3.5 px-3 font-semibold text-mcu-darkPurple whitespace-nowrap">
                        {m.meetingNumber}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">
                          {formatThaiDateShort(m.meetingDate)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {formatThaiTime(m.startTime)} - {formatThaiTime(m.endTime)}
                        </div>
                      </td>

                      {/* Format */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge format={m.meetingFormat} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={m.status} size="sm" />
                      </td>

                      {/* Responded Ratio */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="font-semibold text-gray-800">
                          {respondedCount} / {mInvitees.length}
                        </div>
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className="bg-[#C8A54B] h-full rounded-full"
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-gray-600">
                        {formatThaiDateShort(m.rsvpDeadline)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <Link
                            to={`/meetings/${m.id}`}
                            className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                            title="ดูรายละเอียดการประชุม"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/meetings/${m.id}/edit`}
                            className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                            title="แก้ไขข้อมูลการประชุม"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(m.id, m.title)}
                            className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                            title="คัดลอกจากการประชุมนี้"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Toggle Open/Close */}
                          <button
                            onClick={() => handleToggleRSVP(m)}
                            className={`p-1.5 rounded-lg transition ${
                              m.status === 'rsvp_open'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={m.status === 'rsvp_open' ? 'ปิดรับตอบรับ' : 'เปิดรับตอบรับ'}
                          >
                            {m.status === 'rsvp_open' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete/Cancel */}
                          <button
                            onClick={() => setMeetingToDelete(m)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="ลบหรือยกเลิกการประชุม"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
            <div>
              หน้า {currentPage} จาก {totalPages} (ทั้งหมด {filteredMeetings.length} รายการ)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                    currentPage === page
                      ? 'bg-mcu-primary text-white border-mcu-primary'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(meetingToDelete)}
        onClose={() => setMeetingToDelete(null)}
        title="ยืนยันการลบการประชุม"
        description="การดำเนินการนี้จะลบรายการประชุมและข้อมูลที่เกี่ยวข้องออกจากระบบ"
        footer={
          <>
            <button
              type="button"
              onClick={() => setMeetingToDelete(null)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
            >
              ยืนยันการลบ
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-600">
          <p>
            ท่านต้องการลบการประชุม: <span className="font-bold text-gray-900">{meetingToDelete?.title}</span> (ครั้งที่ {meetingToDelete?.meetingNumber}) หรือไม่?
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              หมายเหตุ: เมื่อลบแล้ว รายการตอบรับ (RSVP) และเอกสารที่ผูกอยู่กับการประชุมนี้จะถูกนำออกจากระบบด้วย
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
