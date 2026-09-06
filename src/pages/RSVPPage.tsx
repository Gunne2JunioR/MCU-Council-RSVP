import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastNotification';
import {
  formatThaiDate,
  formatThaiDateShort,
  formatThaiTime,
  formatThaiDateTime
} from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Mail,
  Building,
  Upload,
  ShieldCheck,
  AlertCircle,
  QrCode as QrIcon,
  Download,
  ArrowRight,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RSVPStatus, AttendanceFormat } from '../types';

export const RSVPPage: React.FC = () => {
  const { token, id } = useParams<{ token?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const { meetings, invitees, submitRSVP } = useData();
  const { currentUser, currentRole } = useAuth();
  const { showToast } = useToast();

  // Find Invitee by token or by logged in user + meeting id
  const targetInvitee = invitees.find(i => {
    if (token) return i.personalToken === token;
    if (id) return i.meetingId === id && i.profileId === currentUser?.id;
    return false;
  }) || invitees[0]; // fallback to first sample invitee if testing directly

  const targetMeeting = meetings.find(m => m.id === targetInvitee?.meetingId) || meetings[0];

  // State: Editable contact details
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // State: RSVP status
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('attend');
  const [attendanceFormat, setAttendanceFormat] = useState<AttendanceFormat>('Onsite');
  const [dietary, setDietary] = useState('');

  // State: Leave / Cannot attend
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDocName, setLeaveDocName] = useState<string | null>(null);

  // State: Delegate
  const [delegateTitle, setDelegateTitle] = useState('ผศ.ดร.');
  const [delegateName, setDelegateName] = useState('อภิชาต สิริปัญโญ (สมมุติ)');
  const [delegatePosition, setDelegatePosition] = useState('รองคณบดีฝ่ายวิชาการ');
  const [delegateOrg, setDelegateOrg] = useState('คณะพุทธศาสตร์');
  const [delegatePhone, setDelegatePhone] = useState('089-444-1234');
  const [delegateEmail, setDelegateEmail] = useState('delegate.mcu@example.com');
  const [delegateFormat, setDelegateFormat] = useState<AttendanceFormat>('Onsite');
  const [delegateReason, setDelegateReason] = useState('ติดราชการภารกิจตรวจประเมินคุณภาพการศึกษาของ สป.อว.');
  const [delegateDocName, setDelegateDocName] = useState<string | null>('หนังสือมอบหมายผู้แทน.pdf');

  // Certify and PDPA Checkbox
  const [isCertified, setIsCertified] = useState(true);

  // Submitted Success State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string>('');

  // Initialize data
  useEffect(() => {
    if (targetInvitee) {
      setContactPhone(targetInvitee.phone);
      setContactEmail(targetInvitee.email);

      if (targetInvitee.response) {
        setRsvpStatus(targetInvitee.response.status);
        if (targetInvitee.response.attendanceFormat) {
          setAttendanceFormat(targetInvitee.response.attendanceFormat);
        }
        if (targetInvitee.response.dietaryPreferences) {
          setDietary(targetInvitee.response.dietaryPreferences);
        }
        if (targetInvitee.response.reason) {
          setLeaveReason(targetInvitee.response.reason);
        }
      }

      if (targetMeeting) {
        if (targetMeeting.meetingFormat === 'Onsite') setAttendanceFormat('Onsite');
        if (targetMeeting.meetingFormat === 'Online') setAttendanceFormat('Online');
      }
    }
  }, [targetInvitee, targetMeeting]);

  const handleSubmit = (isDraft = false) => {
    if (!isCertified && !isDraft) {
      showToast('warning', 'กรุณารับรองความถูกต้อง', 'โปรดทำเครื่องหมายรับรองความถูกต้องของข้อมูล');
      return;
    }

    if (rsvpStatus === 'attend' && targetMeeting.meetingFormat === 'Hybrid' && !attendanceFormat) {
      showToast('warning', 'กรุณาเลือกรูปแบบการเข้าร่วม', 'โปรดเลือกว่าจะเข้าร่วมแบบ Onsite หรือ Online');
      return;
    }

    if ((rsvpStatus === 'leave' || rsvpStatus === 'cannot_attend') && !leaveReason.trim() && !isDraft) {
      showToast('warning', 'กรุณาระบุเหตุผล', 'โปรดระบุเหตุผลการลาหรือไม่สามารถเข้าร่วม');
      return;
    }

    if (rsvpStatus === 'delegate' && (!delegateName.trim() || !delegateReason.trim()) && !isDraft) {
      showToast('warning', 'กรุณากรอกข้อมูลผู้แทนให้ครบถ้วน', 'โปรดระบุชื่อผู้แทนและเหตุผลการมอบหมาย');
      return;
    }

    const responsePayload = {
      status: rsvpStatus,
      attendanceFormat: rsvpStatus === 'attend' ? attendanceFormat : undefined,
      updatedPhone: contactPhone,
      updatedEmail: contactEmail,
      reason: rsvpStatus === 'leave' || rsvpStatus === 'cannot_attend' ? leaveReason : undefined,
      dietaryPreferences: dietary,
      isDraft
    };

    const delegatePayload = rsvpStatus === 'delegate' ? {
      delegateTitle,
      delegateName,
      delegatePosition,
      delegateOrganization: delegateOrg,
      delegatePhone,
      delegateEmail,
      attendanceFormat: delegateFormat,
      reason: delegateReason,
      documentName: delegateDocName || 'หนังสือมอบหมายผู้แทน.pdf'
    } : undefined;

    const leavePayload = (rsvpStatus === 'leave' || rsvpStatus === 'cannot_attend') ? {
      leaveType: rsvpStatus,
      reason: leaveReason,
      documentName: leaveDocName || undefined
    } : undefined;

    const success = submitRSVP(targetInvitee.id, responsePayload, delegatePayload, leavePayload);

    if (success) {
      const refCode = `MCU-${targetMeeting.meetingNumber.replace('/', '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRef(refCode);
      setIsSubmitted(true);
      showToast(
        'success',
        isDraft ? 'บันทึกแบบร่างสำเร็จ' : 'บันทึกการตอบรับเรียบร้อยแล้ว',
        'ระบบได้บันทึกข้อมูลการตอบรับของท่านเข้าสู่ระบบสำนักงานสภามหาวิทยาลัย'
      );
    }
  };

  // SUCCESS SCREEN
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#4B1F5E] to-[#6B3F83] p-6 sm:p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-[#C8A54B]">
              <CheckCircle2 className="w-9 h-9 text-[#C8A54B]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">บันทึกการตอบรับเรียบร้อยแล้ว</h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              สำนักงานสภามหาวิทยาลัย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Summary details */}
            <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">การประชุม:</span>
                <span className="font-bold text-gray-900 text-right">{targetMeeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วันและเวลา:</span>
                <span className="font-medium text-gray-800">
                  {formatThaiDate(targetMeeting.meetingDate)} ({formatThaiTime(targetMeeting.startTime)} - {formatThaiTime(targetMeeting.endTime)} น.)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ผู้ตอบรับ:</span>
                <span className="font-semibold text-mcu-primary">
                  {targetInvitee.title}{targetInvitee.firstName} {targetInvitee.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะที่ตอบรับ:</span>
                <StatusBadge status={rsvpStatus} />
              </div>
              {rsvpStatus === 'attend' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">รูปแบบการเข้าร่วม:</span>
                  <span className="font-bold text-emerald-700">{attendanceFormat}</span>
                </div>
              )}
              {rsvpStatus === 'delegate' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ผู้แทนที่มอบหมาย:</span>
                  <span className="font-bold text-indigo-700">{delegateName} (รอตรวจสอบ)</span>
                </div>
              )}
            </div>

            {/* QR Code for Check-in on Meeting Day */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-200 mb-3">
                <QRCodeSVG
                  value={`MCU-RSVP:${submittedRef}:${targetInvitee.id}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-xs font-mono font-bold text-gray-800 tracking-wider">
                รหัสอ้างอิง: {submittedRef}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                ท่านสามารถแสดง QR Code นี้แก่เจ้าหน้าที่เพื่อเช็กชื่อเข้าร่วมประชุม ณ ห้องประชุม 401
              </p>
            </div>

            {/* PDPA Reminder */}
            <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 text-center border border-gray-100">
              “ข้อมูลของท่านใช้เพื่อบริหารจัดการการประชุมของสำนักงานสภามหาวิทยาลัยเท่านั้น ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)”
            </div>

            <div className="flex justify-center gap-3">
              <Link
                to="/my-meetings"
                className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow transition"
              >
                กลับไปหน้ารายการประชุมของฉัน
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-meetings"
          className="text-xs text-mcu-primary hover:underline flex items-center gap-1 font-medium"
        >
          &larr; กลับหน้ารายการประชุมของฉัน
        </Link>
        <span className="text-xs text-gray-400">แบบฟอร์มตอบรับทางการ มจร.</span>
      </div>

      {/* Meeting Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-[#4B1F5E] to-[#6B3F83] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8A54B]/20 text-[#C8A54B] text-[11px] font-semibold border border-[#C8A54B]/30 mb-2">
              <span>{targetMeeting.committeeName || 'สภามหาวิทยาลัย'} ครั้งที่ {targetMeeting.meetingNumber}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold leading-snug">{targetMeeting.title}</h1>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge format={targetMeeting.meetingFormat} size="lg" />
          </div>
        </div>

        {/* Meeting Details Bar */}
        <div className="p-4 sm:p-6 bg-purple-50/30 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-mcu-primary mt-0.5" />
            <div>
              <span className="text-gray-500 block">วันประชุม:</span>
              <span className="font-semibold text-gray-900">{formatThaiDate(targetMeeting.meetingDate)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-mcu-primary mt-0.5" />
            <div>
              <span className="text-gray-500 block">เวลาประชุม:</span>
              <span className="font-semibold text-gray-900">
                {formatThaiTime(targetMeeting.startTime)} - {formatThaiTime(targetMeeting.endTime)} น.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-rose-600 mt-0.5" />
            <div>
              <span className="text-gray-500 block">กำหนดปิดรับตอบรับ:</span>
              <span className="font-bold text-rose-700">{formatThaiDateTime(targetMeeting.rsvpDeadline)}</span>
            </div>
          </div>
        </div>

        {/* Venue or Online display depending on format */}
        <div className="p-4 sm:p-6 text-xs space-y-3">
          {(targetMeeting.meetingFormat === 'Onsite' || targetMeeting.meetingFormat === 'Hybrid') && (
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <MapPin className="w-4 h-4 text-mcu-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900">สถานที่จัดการประชุม:</span>
                <p className="text-gray-700 mt-0.5 leading-relaxed">{targetMeeting.venue}</p>
              </div>
            </div>
          )}

          {(targetMeeting.meetingFormat === 'Online' || targetMeeting.meetingFormat === 'Hybrid') && (
            <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-200">
              <Video className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-blue-900">
                  ข้อมูลการประชุมออนไลน์ ({targetMeeting.onlinePlatform || 'Zoom'}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-gray-500">Meeting ID: </span>
                    <span className="font-mono font-semibold">{targetMeeting.onlineMeetingId || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Passcode: </span>
                    <span className="font-mono font-semibold">{targetMeeting.onlinePasscode || '-'}</span>
                  </div>
                </div>
                {targetMeeting.onlineInstructions && (
                  <p className="text-[11px] text-blue-800 mt-1">{targetMeeting.onlineInstructions}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Prefilled Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-mcu-primary" />
            <h3 className="text-sm font-bold text-gray-900">ข้อมูลผู้ตอบรับ</h3>
          </div>
          <span className="text-[11px] text-gray-400">
            อนุญาตให้แก้ไขเบอร์โทรและอีเมลสำหรับติดต่อ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">ชื่อ-นามสกุล:</span>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-900">
              {targetInvitee.title}{targetInvitee.firstName} {targetInvitee.lastName}
            </div>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">ตำแหน่งในสภา / สิทธิ์:</span>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {targetInvitee.position || 'กรรมการสภามหาวิทยาลัย'}
            </div>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">ส่วนงาน / สังกัด:</span>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {targetInvitee.organization || 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย'}
            </div>
          </div>
        </div>

        {/* Editable Phone and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              หมายเลขโทรศัพท์มือถือ (แก้ไขได้) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              อีเมลสำหรับรับเอกสาร (แก้ไขได้) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="name@mcu.ac.th"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main RSVP Choices: 4 Radio Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            เลือกการตอบรับเข้าร่วมประชุม <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-gray-500">
            โปรดเลือกความประสงค์ในการเข้าร่วมการประชุมครั้งนี้
          </p>
        </div>

        {/* Radio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Attend */}
          <div
            onClick={() => setRsvpStatus('attend')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
              rsvpStatus === 'attend'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-emerald-800">1. สามารถเข้าร่วม</span>
                <input
                  type="radio"
                  name="rsvpStatus"
                  checked={rsvpStatus === 'attend'}
                  onChange={() => setRsvpStatus('attend')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                สามารถเข้าร่วมประชุมได้ด้วยตนเอง
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-4"></div>
          </div>

          {/* 2. Cannot Attend */}
          <div
            onClick={() => setRsvpStatus('cannot_attend')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
              rsvpStatus === 'cannot_attend'
                ? 'border-red-500 bg-red-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-red-800">2. ไม่สามารถเข้าร่วม</span>
                <input
                  type="radio"
                  name="rsvpStatus"
                  checked={rsvpStatus === 'cannot_attend'}
                  onChange={() => setRsvpStatus('cannot_attend')}
                  className="text-red-600 focus:ring-red-500"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                ติดภารกิจอื่น ไม่สามารถร่วมได้
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-red-500 mt-4"></div>
          </div>

          {/* 3. Leave */}
          <div
            onClick={() => setRsvpStatus('leave')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
              rsvpStatus === 'leave'
                ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-rose-800">3. ลาประชุม</span>
                <input
                  type="radio"
                  name="rsvpStatus"
                  checked={rsvpStatus === 'leave'}
                  onChange={() => setRsvpStatus('leave')}
                  className="text-rose-600 focus:ring-rose-500"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                แจ้งลาประชุมอย่างเป็นทางการ
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-rose-500 mt-4"></div>
          </div>

          {/* 4. Delegate */}
          <div
            onClick={() => setRsvpStatus('delegate')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
              rsvpStatus === 'delegate'
                ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-indigo-800">4. มอบหมายผู้แทน</span>
                <input
                  type="radio"
                  name="rsvpStatus"
                  checked={rsvpStatus === 'delegate'}
                  onChange={() => setRsvpStatus('delegate')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                มอบหมายผู้แทนเข้าร่วมแทนตน
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-4"></div>
          </div>
        </div>

        {/* CONDITIONAL SECTION 1: IF ATTEND */}
        {rsvpStatus === 'attend' && (
          <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-200 space-y-4 animate-fadeIn text-xs">
            <h4 className="font-bold text-emerald-900">รูปแบบการเข้าร่วมประชุม</h4>

            {targetMeeting.meetingFormat === 'Hybrid' && (
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-2 ${
                    attendanceFormat === 'Onsite'
                      ? 'bg-white border-emerald-500 shadow-xs font-semibold text-emerald-900'
                      : 'border-gray-200 bg-white/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendFormat"
                    checked={attendanceFormat === 'Onsite'}
                    onChange={() => setAttendanceFormat('Onsite')}
                    className="text-emerald-600"
                  />
                  <span>เข้าร่วม ณ ห้องประชุม (Onsite)</span>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-2 ${
                    attendanceFormat === 'Online'
                      ? 'bg-white border-blue-500 shadow-xs font-semibold text-blue-900'
                      : 'border-gray-200 bg-white/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendFormat"
                    checked={attendanceFormat === 'Online'}
                    onChange={() => setAttendanceFormat('Online')}
                    className="text-blue-600"
                  />
                  <span>เข้าร่วมออนไลน์ผ่านระบบ (Online)</span>
                </label>
              </div>
            )}

            {targetMeeting.meetingFormat === 'Onsite' && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                การประชุมนี้จัดในรูปแบบ <span className="font-bold text-emerald-700">Onsite เท่านั้น</span> ณ {targetMeeting.venue}
              </div>
            )}

            {targetMeeting.meetingFormat === 'Online' && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                การประชุมนี้จัดในรูปแบบ <span className="font-bold text-blue-700">Online เท่านั้น</span> ผ่าน {targetMeeting.onlinePlatform}
              </div>
            )}

            {/* Dietary preferences if Onsite */}
            {attendanceFormat === 'Onsite' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  ข้อจำกัดด้านอาหาร / ภัตตาหาร (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                  placeholder="เช่น ภัตตาหารเจ, มังสวิรัติ, ฮาลาล, แพ้อาหารทะเล..."
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* CONDITIONAL SECTION 2: IF LEAVE OR CANNOT ATTEND */}
        {(rsvpStatus === 'leave' || rsvpStatus === 'cannot_attend') && (
          <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200 space-y-4 animate-fadeIn text-xs">
            <h4 className="font-bold text-rose-900">
              รายละเอียดเหตุผลการ{rsvpStatus === 'leave' ? 'ลาประชุม' : 'ไม่สามารถเข้าร่วม'}
            </h4>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                เหตุผลความจำเป็น <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="ระบุเหตุผล เช่น ติดภารกิจราชการต่างประเทศ ติดศาสนกิจ หรือเหตุสุดวิสัย..."
                className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                แนบเอกสารหนังสือขอลา / หลักฐาน (ถ้ามี)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="leave-file-input"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setLeaveDocName(f.name);
                  }}
                />
                <label
                  htmlFor="leave-file-input"
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  <span>เลือกไฟล์เอกสารแนบ</span>
                </label>
                {leaveDocName && (
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {leaveDocName}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONAL SECTION 3: IF DELEGATE */}
        {rsvpStatus === 'delegate' && (
          <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-200 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-900">ข้อมูลผู้แทนที่ได้รับมอบหมาย</h4>
              <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-medium">
                ต้องผ่านการตรวจสอบ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  คำนำหน้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={delegateTitle}
                  onChange={e => setDelegateTitle(e.target.value)}
                  placeholder="เช่น ผศ.ดร. หรือ นาย"
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  ชื่อ-นามสกุลผู้แทน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={delegateName}
                  onChange={e => setDelegateName(e.target.value)}
                  placeholder="ชื่อ-นามสกุลผู้แทน..."
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  ตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={delegatePosition}
                  onChange={e => setDelegatePosition(e.target.value)}
                  placeholder="เช่น รองคณบดี..."
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  ส่วนงาน / สังกัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={delegateOrg}
                  onChange={e => setDelegateOrg(e.target.value)}
                  placeholder="เช่น คณะพุทธศาสตร์ มจร."
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  โทรศัพท์มือถือผู้แทน <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={delegatePhone}
                  onChange={e => setDelegatePhone(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  อีเมลผู้แทน <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={delegateEmail}
                  onChange={e => setDelegateEmail(e.target.value)}
                  placeholder="delegate@mcu.ac.th"
                  className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                รูปแบบที่ผู้แทนจะเข้าร่วม <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="delFormat"
                    checked={delegateFormat === 'Onsite'}
                    onChange={() => setDelegateFormat('Onsite')}
                    className="text-indigo-600"
                  />
                  <span>Onsite (ในห้องประชุม)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="delFormat"
                    checked={delegateFormat === 'Online'}
                    onChange={() => setDelegateFormat('Online')}
                    className="text-indigo-600"
                  />
                  <span>Online (ออนไลน์)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                เหตุผลการมอบหมาย <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={delegateReason}
                onChange={e => setDelegateReason(e.target.value)}
                placeholder="ระบุเหตุผลการมอบหมาย..."
                className="w-full py-1.5 px-3 border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                อัปโหลดหนังสือมอบหมายผู้แทน (PDF) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="del-file-input"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setDelegateDocName(f.name);
                  }}
                />
                <label
                  htmlFor="del-file-input"
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  <span>เลือกไฟล์หนังสือมอบหมาย</span>
                </label>
                {delegateDocName && (
                  <span className="text-[11px] text-indigo-700 font-semibold">
                    {delegateDocName}
                  </span>
                )}
              </div>
            </div>

            {/* Note about review */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>หมายเหตุสำคัญ:</strong> ผู้แทนจะเข้าร่วมได้เมื่อสำนักงานสภามหาวิทยาลัยตรวจสอบและรับรองข้อมูลแล้ว ทั้งนี้ ผู้แทนจะไม่ถูกนับเป็นองค์ประชุม เว้นแต่มีมติระบุสิทธิ์ชัดเจน
              </span>
            </div>
          </div>
        )}

        {/* Certification Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={isCertified}
              onChange={e => setIsCertified(e.target.checked)}
              className="mt-0.5 rounded text-mcu-primary focus:ring-mcu-primary"
            />
            <span className="font-semibold text-gray-900">
              ข้าพเจ้ารับรองว่าข้อมูลข้างต้นเป็นความจริงและถูกต้องทุกประการ
            </span>
          </label>
        </div>

        {/* PDPA Statement */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500 text-center">
          “ข้อมูลของท่านใช้เพื่อบริหารจัดการการประชุมของสำนักงานสภามหาวิทยาลัยเท่านั้น”
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition"
          >
            บันทึกร่าง
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-6 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C8A54B]" />
            <span>ยืนยันการตอบรับ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
