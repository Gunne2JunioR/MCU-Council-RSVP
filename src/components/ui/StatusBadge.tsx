import React from 'react';
import { RSVPStatus, MeetingStatus, ApprovalStatus, MeetingFormat } from '../../types';

interface StatusBadgeProps {
  status?: RSVPStatus | MeetingStatus | ApprovalStatus | MeetingFormat | string;
  format?: 'Onsite' | 'Online' | 'Hybrid';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, format, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  // Specific format badge
  if (format) {
    if (format === 'Onsite') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Onsite (ในห้องประชุม)
        </span>
      );
    }
    if (format === 'Online') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Online (ออนไลน์)
        </span>
      );
    }
    if (format === 'Hybrid') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Hybrid (ผสมผสาน)
        </span>
      );
    }
  }

  // RSVP Status
  switch (status) {
    case 'attend':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          เข้าร่วมประชุม
        </span>
      );
    case 'online':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
          เข้าร่วมออนไลน์
        </span>
      );
    case 'pending':
    case 'info_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
          รอตรวจสอบ / ยังไม่ตอบรับ
        </span>
      );
    case 'leave':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
          ลาประชุม
        </span>
      );
    case 'cannot_attend':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
          ไม่สามารถเข้าร่วม
        </span>
      );
    case 'delegate':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          มอบหมายผู้แทน
        </span>
      );

    // Meeting Status
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          ร่างการประชุม
        </span>
      );
    case 'rsvp_open':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          เปิดรับตอบรับ
        </span>
      );
    case 'rsvp_closed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          ปิดรับตอบรับ
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
          อยู่ระหว่างประชุม
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          เสร็จสิ้น
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          ยกเลิก
        </span>
      );

    // Approval status
    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          อนุมัติแล้ว
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          ไม่อนุมัติ
        </span>
      );
    case 'acknowledged':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          รับทราบแล้ว
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          {status || 'ยังไม่ตอบรับ'}
        </span>
      );
  }
};
