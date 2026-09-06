import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import {
  FileCheck2,
  UserCheck,
  UserX,
  HelpCircle,
  FileText,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Send
} from 'lucide-react';
import { ApprovalStatus } from '../types';

export const ApprovalsPage: React.FC = () => {
  const {
    invitees,
    meetings,
    reviewDelegateRequest,
    reviewLeaveRequest
  } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'delegate' | 'leave' | 'cannot_attend'>('delegate');

  // Review action modal state
  const [selectedRequest, setSelectedRequest] = useState<{
    type: 'delegate' | 'leave';
    inviteeId: string;
    action: ApprovalStatus;
    title: string;
  } | null>(null);

  const [reviewNote, setReviewNote] = useState('');
  const [canCountQuorum, setCanCountQuorum] = useState(false); // Default false as specified
  const [canVote, setCanVote] = useState(false);

  // Invitees with requests
  const delegateRequests = invitees.filter(i => i.rsvpStatus === 'delegate' && i.delegateRequest);
  const leaveRequests = invitees.filter(
    i => i.rsvpStatus === 'leave' && i.leaveRequest && i.leaveRequest.leaveType === 'leave'
  );
  const cannotAttendRequests = invitees.filter(
    i => i.rsvpStatus === 'cannot_attend' || (i.leaveRequest && i.leaveRequest.leaveType === 'cannot_attend')
  );

  const openReviewModal = (
    type: 'delegate' | 'leave',
    inviteeId: string,
    action: ApprovalStatus,
    title: string
  ) => {
    setSelectedRequest({ type, inviteeId, action, title });
    setReviewNote('');
    setCanCountQuorum(false);
    setCanVote(false);
  };

  const handleConfirmReview = () => {
    if (!selectedRequest) return;

    // Validation: Notes are strictly required for reject or request info
    if (
      (selectedRequest.action === 'rejected' || selectedRequest.action === 'info_requested') &&
      !reviewNote.trim()
    ) {
      showToast('warning', 'กรุณาระบุหมายเหตุ', 'ต้องระบุเหตุผลในการไม่อนุมัติหรือขอข้อมูลเพิ่มเติม');
      return;
    }

    if (selectedRequest.type === 'delegate') {
      reviewDelegateRequest(
        selectedRequest.inviteeId,
        selectedRequest.action,
        reviewNote,
        canCountQuorum,
        canVote
      );
      showToast(
        'success',
        'บันทึกผลการพิจารณาผู้แทนเรียบร้อย',
        `สถานะ: ${selectedRequest.action} (นับองค์ประชุม: ${canCountQuorum ? 'ได้' : 'ไม่ได้'})`
      );
    } else {
      reviewLeaveRequest(selectedRequest.inviteeId, selectedRequest.action, reviewNote);
      showToast(
        'success',
        'บันทึกผลการพิจารณาคำขอลาเรียบร้อย',
        `สถานะ: ${selectedRequest.action}`
      );
    }

    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-mcu-primary" />
          <span>ตรวจสอบผู้แทนและคำขอลา (Approvals & Verification)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          สำหรับเลขานุการสภามหาวิทยาลัยและเจ้าหน้าที่สำนักงานสภาฯ พิจารณารับรองคำขอมอบหมายผู้แทนและคำขอลา
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('delegate')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'delegate'
              ? 'border-mcu-primary text-mcu-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>คำขอมอบหมายผู้แทน</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
            {delegateRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'leave'
              ? 'border-mcu-primary text-mcu-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>คำขอลาประชุม</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800">
            {leaveRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cannot_attend')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'cannot_attend'
              ? 'border-mcu-primary text-mcu-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>แจ้งไม่สามารถเข้าร่วม</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800">
            {cannotAttendRequests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DELEGATES */}
      {activeTab === 'delegate' && (
        <div className="space-y-4">
          {delegateRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-xs">
              ไม่มีคำขอมอบหมายผู้แทนในขณะนี้
            </div>
          ) : (
            delegateRequests.map(inv => {
              const req = inv.delegateRequest!;
              const meeting = meetings.find(m => m.id === inv.meetingId);

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-card p-5 sm:p-6 space-y-4 transition hover:border-purple-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {meeting?.title} (ครั้งที่ {meeting?.meetingNumber})
                        </span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <span className="text-[11px] text-gray-400">
                        ยื่นคำขอเมื่อ: {formatThaiDateTime(req.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-500">สิทธิ์นับองค์ฯ ปัจจุบัน:</span>
                      {req.canCountAsQuorum ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          นับเป็นองค์ประชุม
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          ไม่นับเป็นองค์ประชุม
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requester & Delegate Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Council Member */}
                    <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 space-y-1">
                      <div className="text-[10px] font-bold text-mcu-primary uppercase tracking-wider">
                        กรรมการผู้มอบหมาย
                      </div>
                      <div className="font-bold text-gray-900 text-sm">
                        {inv.title}{inv.firstName} {inv.lastName}
                      </div>
                      <div className="text-gray-600">{inv.position}</div>
                      <div className="text-gray-500">{inv.organization}</div>
                      <div className="text-[11px] text-gray-400">โทร: {inv.phone}</div>
                    </div>

                    {/* Appointed Delegate */}
                    <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-1">
                      <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                        ผู้แทนที่ได้รับมอบหมาย
                      </div>
                      <div className="font-bold text-indigo-900 text-sm">
                        {req.delegateTitle}{req.delegateName}
                      </div>
                      <div className="text-gray-600">{req.delegatePosition}</div>
                      <div className="text-gray-500">{req.delegateOrganization}</div>
                      <div className="text-[11px] text-gray-600">
                        โทร: {req.delegatePhone} • รูปแบบ: {req.attendanceFormat}
                      </div>
                    </div>
                  </div>

                  {/* Reason & Document */}
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">เหตุผลความจำเป็น: </span>
                      <span className="text-gray-700">{req.reason}</span>
                    </div>

                    {req.documentName && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">หนังสือมอบหมาย:</span>
                        <span className="text-mcu-primary font-medium flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{req.documentName}</span>
                        </span>
                        <a
                          href={req.documentUrl || '#'}
                          download
                          onClick={e => {
                            e.preventDefault();
                            showToast('info', 'ดาวน์โหลดเอกสาร', `กำลังดาวน์โหลด ${req.documentName}`);
                          }}
                          className="p-1 text-gray-400 hover:text-mcu-primary transition"
                          title="ดาวน์โหลด"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {req.reviewNotes && (
                      <div className="p-2.5 bg-gray-50 rounded-lg text-[11px] border border-gray-200">
                        <span className="font-bold text-gray-700">บันทึกการพิจารณา: </span>
                        <span>{req.reviewNotes}</span>
                        <span className="text-gray-400 ml-2">({formatThaiDateTime(req.reviewedAt)})</span>
                      </div>
                    )}
                  </div>

                  {/* Review Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        openReviewModal(
                          'delegate',
                          inv.id,
                          'info_requested',
                          `ขอข้อมูลเพิ่มเติม: ${req.delegateName}`
                        )
                      }
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium rounded-lg transition"
                    >
                      ขอข้อมูลเพิ่มเติม
                    </button>

                    <button
                      onClick={() =>
                        openReviewModal(
                          'delegate',
                          inv.id,
                          'rejected',
                          `ไม่อนุมัติผู้แทน: ${req.delegateName}`
                        )
                      }
                      className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium rounded-lg transition"
                    >
                      ไม่อนุมัติ
                    </button>

                    <button
                      onClick={() =>
                        openReviewModal(
                          'delegate',
                          inv.id,
                          'approved',
                          `อนุมัติ/รับรองผู้แทน: ${req.delegateName}`
                        )
                      }
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>อนุมัติและกำหนดสิทธิ์</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2 & 3: LEAVE & CANNOT ATTEND */}
      {(activeTab === 'leave' || activeTab === 'cannot_attend') && (
        <div className="space-y-4">
          {(activeTab === 'leave' ? leaveRequests : cannotAttendRequests).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-xs">
              ไม่มีคำขอดังกล่าวในขณะนี้
            </div>
          ) : (
            (activeTab === 'leave' ? leaveRequests : cannotAttendRequests).map(inv => {
              const req = inv.leaveRequest;
              const meeting = meetings.find(m => m.id === inv.meetingId);

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-card p-5 sm:p-6 space-y-4 transition"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-900">
                        {meeting?.title} (ครั้งที่ {meeting?.meetingNumber})
                      </span>
                      <div className="text-[11px] text-gray-400">
                        ยื่นเมื่อ: {req ? formatThaiDateTime(req.createdAt) : '-'}
                      </div>
                    </div>
                    <StatusBadge status={req?.status || 'pending'} size="sm" />
                  </div>

                  <div className="text-xs space-y-2">
                    <div className="font-bold text-gray-900">
                      {inv.title}{inv.firstName} {inv.lastName} ({inv.position || inv.organization})
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200">
                      <span className="font-semibold text-gray-900">เหตุผล: </span>
                      {req?.reason || inv.response?.reason || 'ติดราชการภารกิจจำเป็น'}
                    </div>

                    {req?.documentName && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">หนังสือขอลา:</span>
                        <span className="text-mcu-primary font-medium">{req.documentName}</span>
                      </div>
                    )}

                    {req?.reviewNotes && (
                      <div className="p-2.5 bg-purple-50/50 rounded-lg text-[11px] border border-purple-100">
                        <span className="font-bold text-mcu-primary">บันทึกของสำนักงาน: </span>
                        {req.reviewNotes}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        openReviewModal(
                          'leave',
                          inv.id,
                          'info_requested',
                          `ขอข้อมูลเพิ่มเติม: ${inv.firstName}`
                        )
                      }
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium rounded-lg"
                    >
                      ขอข้อมูลเพิ่มเติม
                    </button>

                    <button
                      onClick={() =>
                        openReviewModal(
                          'leave',
                          inv.id,
                          'rejected',
                          `ไม่อนุมัติคำขอลา: ${inv.firstName}`
                        )
                      }
                      className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium rounded-lg"
                    >
                      ไม่อนุมัติ
                    </button>

                    <button
                      onClick={() =>
                        openReviewModal(
                          'leave',
                          inv.id,
                          'approved',
                          `รับทราบ/อนุมัติคำขอลา: ${inv.firstName}`
                        )
                      }
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>รับทราบและอนุมัติ</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Review Dialog Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest?.title || 'พิจารณาคำขอ'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmReview}
              className={`px-4 py-2 text-white text-xs font-semibold rounded-lg transition ${
                selectedRequest?.action === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : selectedRequest?.action === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              ยืนยันการพิจารณา
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Notes: Mandatory if rejected or info requested */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              หมายเหตุ / ข้อความถึงผู้ยื่นคำขอ{' '}
              {(selectedRequest?.action === 'rejected' ||
                selectedRequest?.action === 'info_requested') && (
                <span className="text-red-500">* (บังคับกรอก)</span>
              )}
            </label>
            <textarea
              rows={3}
              required={
                selectedRequest?.action === 'rejected' ||
                selectedRequest?.action === 'info_requested'
              }
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="ระบุเหตุผล ข้อความแจ้งผู้ยื่นคำขอ หรือข้อมูลที่ต้องการเพิ่มเติม..."
              className="w-full py-2 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mcu-primary"
            />
          </div>

          {/* Special Quorum rights config if approving delegate */}
          {selectedRequest?.type === 'delegate' && selectedRequest.action === 'approved' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>การกำหนดสิทธิ์ของผู้แทนในการประชุม</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canCountQuorum}
                    onChange={e => setCanCountQuorum(e.target.checked)}
                    className="mt-0.5 rounded text-mcu-primary"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      นับผู้แทนเป็นองค์ประชุม (Quorum Rights)
                    </span>
                    <p className="text-[11px] text-gray-500">
                      * ตามระเบียบสภาฯ ผู้แทนจะไม่ถูกนับเป็นองค์ประชุมอัตโนมัติ เว้นแต่ประธานหรือสภาฯ มีมติอนุญาต
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canVote}
                    onChange={e => setCanVote(e.target.checked)}
                    className="mt-0.5 rounded text-mcu-primary"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      อนุญาตให้ออกเสียงลงมติแทน (Voting Rights)
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
