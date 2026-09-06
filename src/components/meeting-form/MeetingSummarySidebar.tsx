import React from 'react';
import { Eye, Calendar, MapPin, HelpCircle } from 'lucide-react';
import { MeetingFormat } from '../../types';
import { formatThaiDate, formatThaiDateShort } from '../../utils/thaiDate';

interface MeetingSummarySidebarProps {
  committeeName: string;
  meetingNumber: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  meetingFormat: MeetingFormat;
  venue: string;
  onlinePlatform: string;
  rsvpDeadlineDate: string;
  rsvpDeadlineTime: string;
}

export const MeetingSummarySidebar: React.FC<MeetingSummarySidebarProps> = ({
  committeeName,
  meetingNumber,
  meetingDate,
  startTime,
  endTime,
  meetingFormat,
  venue,
  onlinePlatform,
  rsvpDeadlineDate,
  rsvpDeadlineTime,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 sticky top-24">
      <div className="flex items-center gap-2 text-mcu-primary font-bold text-xs mb-3 pb-2 border-b border-gray-100">
        <Eye className="w-4 h-4 text-mcu-gold" />
        <span>Live Preview (ตัวอย่างข้อความทางการ)</span>
      </div>

      {/* Official Announcement Card */}
      <div className="p-4 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border border-purple-100 space-y-3">
        <div className="text-center pb-2 border-b border-purple-100/60">
          <div className="w-8 h-8 rounded-full bg-mcu-primary text-mcu-gold mx-auto flex items-center justify-center font-bold text-xs mb-1">
            มจร
          </div>
          <div className="text-[10px] text-gray-500">สำนักงานสภามหาวิทยาลัย</div>
        </div>

        {/* Exact format requested in instructions */}
        <div className="space-y-2 text-xs text-gray-800 leading-relaxed font-sans">
          <div className="font-bold text-mcu-darkPurple text-sm">
            การประชุม {committeeName} ครั้งที่ {meetingNumber || '-'}
          </div>

          <div className="flex items-start gap-1.5 text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-mcu-primary flex-shrink-0 mt-0.5" />
            <span>
              วันที่ {formatThaiDate(meetingDate)} เวลา {startTime || '-'}–{endTime || '-'} น.
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-mcu-primary flex-shrink-0 mt-0.5" />
            <span className="text-[11px]">
              {meetingFormat === 'Online'
                ? `การประชุมออนไลน์ผ่าน ${onlinePlatform}`
                : meetingFormat === 'Hybrid'
                ? `${venue} และระบบออนไลน์ (${onlinePlatform})`
                : venue}
            </span>
          </div>

          <div className="pt-2 border-t border-purple-100 text-[11px] text-gray-500">
            <span>กำหนดปิดรับตอบรับ: {formatThaiDateShort(rsvpDeadlineDate)} เวลา {rsvpDeadlineTime} น.</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          เมื่อกด "บันทึกและเปิดรับตอบรับ" ระบบจะสร้างลิงก์ Token เฉพาะบุคคลสำหรับกรรมการแต่ละท่านโดยอัตโนมัติ
        </span>
      </div>
    </div>
  );
};
