import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatThaiDate, formatThaiDateShort, formatThaiTime, formatThaiDateTime } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  CalendarCheck2
} from 'lucide-react';

export const MyMeetingsPage: React.FC = () => {
  const { meetings, invitees } = useData();
  const { currentUser } = useAuth();

  // Find meetings where current user is invited or fallback to all meetings for demo
  const userInvitees = invitees.filter(i => i.profileId === currentUser?.id);
  const invitedMeetingIds = userInvitees.map(i => i.meetingId);

  // Filter meetings
  const myMeetings = meetings.filter(m =>
    invitedMeetingIds.length > 0 ? invitedMeetingIds.includes(m.id) : true
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6 text-mcu-primary" />
          <span>การประชุมของฉัน (My Meetings)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          รายการประชุมที่ท่านได้รับเชิญ ตอบรับเข้าร่วม หรือมอบหมายผู้แทน
        </p>
      </div>

      {/* Meeting Cards List */}
      <div className="space-y-4">
        {myMeetings.length === 0 ? (
          <EmptyState
            title="ไม่มีรายการประชุมในขณะนี้"
            description="ท่านยังไม่มีรายการประชุมที่ได้รับเชิญในระบบ"
          />
        ) : (
          myMeetings.map(m => {
            const userInv = invitees.find(
              i => i.meetingId === m.id && (i.profileId === currentUser?.id || !i.profileId)
            );
            const status = userInv?.rsvpStatus || 'pending';

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 sm:p-6 hover:shadow-hover transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-mcu-primary bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {m.committeeName || 'สภามหาวิทยาลัย'} ครั้งที่ {m.meetingNumber}
                      </span>
                      <StatusBadge format={m.meetingFormat} size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-gray-500">สถานะคำตอบของท่าน:</span>
                    <StatusBadge status={status} size="md" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-mcu-primary flex-shrink-0" />
                    <span>{formatThaiDate(m.meetingDate)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-mcu-primary flex-shrink-0" />
                    <span>
                      {formatThaiTime(m.startTime)} - {formatThaiTime(m.endTime)} น.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>ปิดรับตอบรับ: {formatThaiDateTime(m.rsvpDeadline)}</span>
                  </div>
                </div>

                {/* Venue or Online */}
                <div className="text-xs text-gray-700">
                  {m.meetingFormat !== 'Online' && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{m.venue}</span>
                    </div>
                  )}
                  {m.meetingFormat !== 'Onsite' && m.onlinePlatform && (
                    <div className="flex items-center gap-2 mt-1 text-blue-700">
                      <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>{m.onlinePlatform}: {m.onlineUrl || 'ลิงก์การประชุม'}</span>
                    </div>
                  )}
                </div>

                {/* Footer and RSVP Button */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400">
                    {userInv?.response?.submittedAt
                      ? `ตอบรับเมื่อ: ${formatThaiDateTime(userInv.response.submittedAt)}`
                      : 'ยังไม่ได้ตอบรับ'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/rsvp/${userInv?.personalToken || 'demo-token'}`}
                      className="px-4 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                    >
                      <span>{userInv?.response ? 'แก้ไขการตอบรับ' : 'ตอบรับเข้าร่วมประชุม'}</span>
                      <ArrowRight className="w-4 h-4 text-[#C8A54B]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
