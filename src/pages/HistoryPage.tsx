import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatThaiDateShort, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { History, Calendar, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const HistoryPage: React.FC = () => {
  const { meetings, invitees } = useData();
  const { currentUser } = useAuth();

  const userInvitees = invitees.filter(
    i => (i.profileId === currentUser?.id || !i.profileId) && i.response
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-mcu-primary" />
          <span>ประวัติการตอบรับเข้าร่วมประชุม (RSVP History)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          ประวัติการตอบรับ การแจ้งลา และการมอบหมายผู้แทนของท่านทั้งหมด
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="p-3">การประชุม</th>
                <th className="p-3">วันที่ประชุม</th>
                <th className="p-3">สถานะตอบรับ</th>
                <th className="p-3">รูปแบบ</th>
                <th className="p-3">เหตุผล / ผู้แทน</th>
                <th className="p-3">เวลาที่บันทึก</th>
                <th className="p-3 text-center">รหัสอ้างอิงเช็กชื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userInvitees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ยังไม่มีประวัติการตอบรับ
                  </td>
                </tr>
              ) : (
                userInvitees.map(inv => {
                  const m = meetings.find(item => item.id === inv.meetingId);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">
                        {m?.title || 'การประชุมสภามหาวิทยาลัย'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {m ? formatThaiDateShort(m.meetingDate) : '-'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={inv.rsvpStatus} size="sm" />
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        {inv.response?.attendanceFormat || '-'}
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs truncate">
                        {inv.rsvpStatus === 'delegate'
                          ? `มอบ: ${inv.delegateRequest?.delegateName}`
                          : inv.response?.reason || '-'}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">
                        {inv.response?.submittedAt ? formatThaiDateTime(inv.response.submittedAt) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-mcu-primary bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {inv.response?.checkinQrCodeRef || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
