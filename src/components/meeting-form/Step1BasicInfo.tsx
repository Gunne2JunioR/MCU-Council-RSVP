import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Committee, MeetingType } from '../../types';
import { getBuddhistYearOptions } from '../../utils/thaiDate';

interface Step1BasicInfoProps {
  committeeId: string;
  onCommitteeChange: (commId: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  meetingNumber: string;
  onMeetingNumberChange: (num: string) => void;
  beYear: number;
  onBeYearChange: (year: number) => void;
  meetingType: MeetingType;
  onMeetingTypeChange: (type: MeetingType) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  committees: Committee[];
  onNext: () => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  committeeId,
  onCommitteeChange,
  title,
  onTitleChange,
  meetingNumber,
  onMeetingNumberChange,
  beYear,
  onBeYearChange,
  meetingType,
  onMeetingTypeChange,
  description,
  onDescriptionChange,
  committees,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 space-y-5 animate-fadeIn">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-mcu-primary" />
        <span>ขั้นตอนที่ 1: ข้อมูลการประชุม</span>
      </h2>

      {/* Committee select */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          ชื่อคณะกรรมการ <span className="text-red-500">*</span>
        </label>
        <select
          value={committeeId}
          onChange={e => onCommitteeChange(e.target.value)}
          className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
        >
          {committees.map(c => (
            <option key={c.id} value={c.id}>
              {c.nameTh}
            </option>
          ))}
          <option value="other">อื่น ๆ (ระบุ)</option>
        </select>
      </div>

      {/* Meeting Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          ชื่อการประชุม <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="เช่น การประชุมสภามหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ครั้งที่ 10/2569"
          className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
        />
      </div>

      {/* Session / Round and BE Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            ครั้งที่ประชุม <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={meetingNumber}
            onChange={e => onMeetingNumberChange(e.target.value)}
            placeholder="เช่น 1/2569, 8/2569, 12/2570"
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">ตัวอย่าง: 1/2569 หรือ 8/2569</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            ปี พ.ศ. <span className="text-red-500">*</span>
          </label>
          <select
            value={beYear}
            onChange={e => onBeYearChange(Number(e.target.value))}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
          >
            {getBuddhistYearOptions(3, 3).map(y => (
              <option key={y} value={y}>
                พ.ศ. {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meeting Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          ประเภทการประชุม <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'regular', label: 'ประชุมปกติ' },
            { id: 'special', label: 'ประชุมวาระพิเศษ' },
            { id: 'urgent', label: 'ประชุมวาระเร่งด่วน' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onMeetingTypeChange(t.id as MeetingType)}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                meetingType === t.id
                  ? 'bg-purple-50 border-mcu-primary text-mcu-primary font-bold shadow-xs'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description / Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          รายละเอียดหรือหมายเหตุวาระการประชุม
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder="ระบุสาระสำคัญของการประชุม เช่น พิจารณาแต่งตั้งอาจารย์ผู้ทรงคุณวุฒิ การจัดสรรงบประมาณ..."
          className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none resize-none"
        />
      </div>

      {/* Navigation button */}
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <span>ถัดไป: วัน เวลา และสถานที่</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
