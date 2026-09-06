import React from 'react';
import { Calendar, MapPin, Video, ArrowLeft, ArrowRight } from 'lucide-react';
import { MeetingFormat } from '../../types';
import { formatThaiDate } from '../../utils/thaiDate';

interface Step2ScheduleVenueProps {
  meetingDate: string;
  onMeetingDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  rsvpOpenAt: string;
  onRsvpOpenAtChange: (date: string) => void;
  rsvpDeadlineDate: string;
  onRsvpDeadlineDateChange: (date: string) => void;
  rsvpDeadlineTime: string;
  onRsvpDeadlineTimeChange: (time: string) => void;
  meetingFormat: MeetingFormat;
  onMeetingFormatChange: (format: MeetingFormat) => void;
  venue: string;
  onVenueChange: (venue: string) => void;
  defaultVenue: string;
  onlinePlatform: string;
  onOnlinePlatformChange: (platform: string) => void;
  onlineUrl: string;
  onOnlineUrlChange: (url: string) => void;
  onlineMeetingId: string;
  onOnlineMeetingIdChange: (id: string) => void;
  onlinePasscode: string;
  onOnlinePasscodeChange: (code: string) => void;
  onlineInstructions: string;
  onOnlineInstructionsChange: (inst: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step2ScheduleVenue: React.FC<Step2ScheduleVenueProps> = ({
  meetingDate,
  onMeetingDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  rsvpOpenAt,
  onRsvpOpenAtChange,
  rsvpDeadlineDate,
  onRsvpDeadlineDateChange,
  rsvpDeadlineTime,
  onRsvpDeadlineTimeChange,
  meetingFormat,
  onMeetingFormatChange,
  venue,
  onVenueChange,
  defaultVenue,
  onlinePlatform,
  onOnlinePlatformChange,
  onlineUrl,
  onOnlineUrlChange,
  onlineMeetingId,
  onOnlineMeetingIdChange,
  onlinePasscode,
  onOnlinePasscodeChange,
  onlineInstructions,
  onOnlineInstructionsChange,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 space-y-6 animate-fadeIn">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-mcu-primary" />
        <span>ขั้นตอนที่ 2: วัน เวลา รูปแบบ และสถานที่</span>
      </h2>

      {/* Date & Meeting Times */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            วันที่ประชุม <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={meetingDate}
            onChange={e => onMeetingDateChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            {formatThaiDate(meetingDate)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            เวลาเริ่มประชุม <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={startTime}
            onChange={e => onStartTimeChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            เวลาสิ้นสุดโดยประมาณ <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={endTime}
            onChange={e => onEndTimeChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
          />
        </div>
      </div>

      {/* RSVP Open Date and RSVP Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-purple-50/40 rounded-xl border border-purple-100">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            วันที่เริ่มเปิดรับตอบรับ
          </label>
          <input
            type="date"
            value={rsvpOpenAt}
            onChange={e => onRsvpOpenAtChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            วันปิดรับตอบรับ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={rsvpDeadlineDate}
            onChange={e => onRsvpDeadlineDateChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            {formatThaiDate(rsvpDeadlineDate)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            เวลาปิดรับตอบรับ <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={rsvpDeadlineTime}
            onChange={e => onRsvpDeadlineTimeChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
          />
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">
            * ต้องก่อนวันเวลาเริ่มประชุม (ตามกฎ Cardinal Invariant 6)
          </span>
        </div>
      </div>

      {/* Meeting Format: Segmented Control */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          ประเภทการจัดประชุม <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 p-1 bg-gray-100 rounded-xl">
          {(['Onsite', 'Online', 'Hybrid'] as MeetingFormat[]).map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => onMeetingFormatChange(fmt)}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                meetingFormat === fmt
                  ? 'bg-white text-mcu-darkPurple shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {fmt === 'Onsite' && 'Onsite (ณ สถานที่)'}
              {fmt === 'Online' && 'Online (ออนไลน์)'}
              {fmt === 'Hybrid' && 'Hybrid (ผสมผสาน)'}
            </button>
          ))}
        </div>
      </div>

      {/* Venue section (shown if Onsite or Hybrid) */}
      {(meetingFormat === 'Onsite' || meetingFormat === 'Hybrid') && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-mcu-primary" />
              <span>สถานที่จัดการประชุม</span>
            </label>
            <button
              type="button"
              onClick={() => onVenueChange(defaultVenue)}
              className="text-[11px] text-mcu-primary hover:underline"
            >
              รีเซ็ตเป็นค่าเริ่มต้น
            </button>
          </div>
          <textarea
            rows={3}
            value={venue}
            onChange={e => onVenueChange(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none bg-white"
          />
          <p className="text-[11px] text-gray-500 italic">
            “ระบบกำหนดสถานที่มาตรฐานให้อัตโนมัติ สามารถแก้ไขได้ในกรณีเปลี่ยนสถานที่ประชุม”
          </p>
        </div>
      )}

      {/* Online meeting section (shown if Online or Hybrid) */}
      {(meetingFormat === 'Online' || meetingFormat === 'Hybrid') && (
        <div className="space-y-4 p-4 bg-blue-50/40 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-blue-900">
              ข้อมูลการประชุมออนไลน์ ({meetingFormat})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อแพลตฟอร์ม
              </label>
              <select
                value={onlinePlatform}
                onChange={e => onOnlinePlatformChange(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              >
                <option value="Zoom Meetings">Zoom Meetings</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Cisco Webex">Cisco Webex</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meeting Link (URL)
              </label>
              <input
                type="url"
                value={onlineUrl}
                onChange={e => onOnlineUrlChange(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meeting ID
              </label>
              <input
                type="text"
                value={onlineMeetingId}
                onChange={e => onOnlineMeetingIdChange(e.target.value)}
                placeholder="เช่น 987 654 3210"
                className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Passcode / รหัสผ่านห้อง
              </label>
              <input
                type="text"
                value={onlinePasscode}
                onChange={e => onOnlinePasscodeChange(e.target.value)}
                placeholder="เช่น MCU2569"
                className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              คำแนะนำการเข้าร่วมประชุมออนไลน์
            </label>
            <textarea
              rows={2}
              value={onlineInstructions}
              onChange={e => onOnlineInstructionsChange(e.target.value)}
              placeholder="เช่น กรุณาตั้งชื่อในระบบ Zoom เป็น ชื่อ-นามสกุล..."
              className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
        >
          ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <span>ถัดไป: ผู้ได้รับเชิญและเอกสาร</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
