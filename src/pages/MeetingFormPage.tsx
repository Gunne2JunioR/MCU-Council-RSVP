import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import {
  formatThaiDate,
  formatThaiDateShort,
  toBuddhistYear,
  getBuddhistYearOptions
} from '../utils/thaiDate';
import {
  MeetingType,
  MeetingFormat,
  MeetingStatus,
  InviteeType
} from '../types';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Users,
  Upload,
  Send,
  Save,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';

export const MeetingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    meetings,
    committees,
    committeeMembers,
    settings,
    addMeeting,
    updateMeeting
  } = useData();

  // Current Step (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State - Step 1
  const [committeeId, setCommitteeId] = useState('comm-1');
  const [title, setTitle] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('10/2569');
  const [beYear, setBeYear] = useState<number>(toBuddhistYear(new Date().getFullYear()));
  const [meetingType, setMeetingType] = useState<MeetingType>('regular');
  const [description, setDescription] = useState('');

  // Form State - Step 2
  const [meetingDate, setMeetingDate] = useState('2026-10-22');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('16:30');
  const [rsvpOpenAt, setRsvpOpenAt] = useState('2026-10-01');
  const [rsvpDeadlineDate, setRsvpDeadlineDate] = useState('2026-10-18');
  const [rsvpDeadlineTime, setRsvpDeadlineTime] = useState('17:00');
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>('Hybrid');
  const [venue, setVenue] = useState(settings.defaultVenue);
  const [onlinePlatform, setOnlinePlatform] = useState('Zoom Meetings');
  const [onlineUrl, setOnlineUrl] = useState('https://zoom.us/j/1234567890');
  const [onlineMeetingId, setOnlineMeetingId] = useState('123 456 7890');
  const [onlinePasscode, setOnlinePasscode] = useState('MCU2569');
  const [onlineInstructions, setOnlineInstructions] = useState('กรุณาเข้าห้องประชุมออนไลน์ก่อนเริ่ม 15 นาที และระบุชื่อจริงในระบบ');

  // Form State - Step 3
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [externalInvitees, setExternalInvitees] = useState<
    { name: string; org: string; type: InviteeType; hasQuorum: boolean }[]
  >([]);
  const [invitationMessage, setInvitationMessage] = useState(settings.invitationEmailTemplate);
  const [notificationChannels, setNotificationChannels] = useState<('email' | 'line' | 'link')[]>([
    'email',
    'link'
  ]);
  const [sendImmediate, setSendImmediate] = useState(true);

  // Upload simulation state
  const [invitationFile, setInvitationFile] = useState<string | null>(null);
  const [agendaFile, setAgendaFile] = useState<string | null>(null);

  // Validation Error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load existing data if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const existing = meetings.find(m => m.id === id);
      if (existing) {
        setCommitteeId(existing.committeeId);
        setTitle(existing.title);
        setMeetingNumber(existing.meetingNumber);
        setBeYear(existing.beYear);
        setMeetingType(existing.meetingType);
        setDescription(existing.description || '');
        setMeetingDate(existing.meetingDate);
        setStartTime(existing.startTime);
        setEndTime(existing.endTime);
        setMeetingFormat(existing.meetingFormat);
        setVenue(existing.venue);
        setOnlinePlatform(existing.onlinePlatform || 'Zoom Meetings');
        setOnlineUrl(existing.onlineUrl || '');
        setOnlineMeetingId(existing.onlineMeetingId || '');
        setOnlinePasscode(existing.onlinePasscode || '');
        setOnlineInstructions(existing.onlineInstructions || '');
        setRsvpDeadlineDate(existing.rsvpDeadline.split('T')[0] || '2026-10-18');
        setNotificationChannels(existing.notificationChannels || ['email', 'link']);
      }
    } else {
      // Set default title based on committee and meeting number
      const comm = committees.find(c => c.id === committeeId);
      setTitle(`การประชุม${comm?.nameTh || 'สภามหาวิทยาลัย'} ครั้งที่ ${meetingNumber}`);
      // Select all active members by default
      setSelectedMemberIds(committeeMembers.filter(m => m.isActive).map(m => m.id));
    }
  }, [isEditMode, id, committeeId, meetingNumber, committees, committeeMembers]);

  // Update title automatically when committee or meeting number changes in Create mode
  const handleCommitteeChange = (newCommId: string) => {
    setCommitteeId(newCommId);
    if (!isEditMode) {
      const comm = committees.find(c => c.id === newCommId);
      setTitle(`การประชุม${comm?.nameTh || 'สภามหาวิทยาลัย'} ครั้งที่ ${meetingNumber}`);
    }
  };

  const handleMeetingNumberChange = (num: string) => {
    setMeetingNumber(num);
    if (!isEditMode) {
      const comm = committees.find(c => c.id === committeeId);
      setTitle(`การประชุม${comm?.nameTh || 'สภามหาวิทยาลัย'} ครั้งที่ ${num}`);
    }
  };

  // Add external invitee
  const handleAddExternalInvitee = () => {
    setExternalInvitees(prev => [
      ...prev,
      { name: '', org: '', type: 'presenter', hasQuorum: false }
    ]);
  };

  // Step 2 Validation: Deadline must be strictly before meeting date/time
  const validateStep2 = (): boolean => {
    setValidationError(null);
    const meetingDateTime = new Date(`${meetingDate}T${startTime}:00`);
    const deadlineDateTime = new Date(`${rsvpDeadlineDate}T${rsvpDeadlineTime}:00`);

    if (deadlineDateTime >= meetingDateTime) {
      setValidationError('วันและเวลาปิดรับตอบรับ (RSVP Deadline) ต้องอยู่ก่อนวันและเวลาเริ่มการประชุม');
      return false;
    }
    return true;
  };

  // Save handler (draft or rsvp_open)
  const handleSave = (targetStatus: MeetingStatus) => {
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    const selectedComm = committees.find(c => c.id === committeeId);
    const deadlineIso = new Date(`${rsvpDeadlineDate}T${rsvpDeadlineTime}:00`).toISOString();
    const rsvpOpenIso = new Date(`${rsvpOpenAt}T08:00:00`).toISOString();

    const meetingPayload = {
      committeeId,
      committeeName: selectedComm?.nameTh || 'สภามหาวิทยาลัย',
      title,
      meetingNumber,
      beYear,
      meetingType,
      meetingFormat,
      meetingDate,
      startTime,
      endTime,
      rsvpOpenAt: rsvpOpenIso,
      rsvpDeadline: deadlineIso,
      venue: meetingFormat !== 'Online' ? venue : '',
      onlinePlatform: meetingFormat !== 'Onsite' ? onlinePlatform : undefined,
      onlineUrl: meetingFormat !== 'Onsite' ? onlineUrl : undefined,
      onlineMeetingId: meetingFormat !== 'Onsite' ? onlineMeetingId : undefined,
      onlinePasscode: meetingFormat !== 'Onsite' ? onlinePasscode : undefined,
      onlineInstructions: meetingFormat !== 'Onsite' ? onlineInstructions : undefined,
      status: targetStatus,
      description,
      invitationTemplate: invitationMessage,
      notificationChannels,
      sendImmediateInvitation: sendImmediate
    };

    if (isEditMode && id) {
      updateMeeting(id, meetingPayload);
      showToast('success', 'บันทึกการแก้ไขเรียบร้อย', `อัปเดตข้อมูล "${title}" แล้ว`);
      navigate(`/meetings/${id}`);
    } else {
      const newId = addMeeting(meetingPayload, selectedMemberIds);
      showToast(
        'success',
        targetStatus === 'rsvp_open' ? 'สร้างและเปิดรับตอบรับเรียบร้อย' : 'บันทึกร่างการประชุมแล้ว',
        `การประชุมครั้งที่ ${meetingNumber}`
      );
      navigate(`/meetings/${newId}`);
    }
  };

  // Selected Committee Name for Preview
  const currentCommName = committees.find(c => c.id === committeeId)?.nameTh || 'สภามหาวิทยาลัย';

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/meetings"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            title="ย้อนกลับหน้ารายการประชุม"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditMode ? 'แก้ไขข้อมูลการประชุม' : 'สร้างรายการประชุมใหม่'}
            </h1>
            <p className="text-xs text-gray-500">
              กรอกข้อมูล 3 ขั้นตอนเพื่อกำหนดรายละเอียดและเปิดรับการตอบรับ
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-mcu-primary">ขั้นตอนที่ {currentStep} จาก 3</span>
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                currentStep === 1
                  ? 'bg-[#4B1F5E] text-white ring-4 ring-purple-100'
                  : currentStep > 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900">ขั้นตอนที่ 1</div>
              <div className="text-[11px] text-gray-500">ข้อมูลการประชุม</div>
            </div>
          </button>

          <div className="flex-1 h-0.5 bg-gray-200 mx-3 sm:mx-6">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: currentStep > 1 ? '100%' : '0%' }}
            ></div>
          </div>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                currentStep === 2
                  ? 'bg-[#4B1F5E] text-white ring-4 ring-purple-100'
                  : currentStep > 2
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900">ขั้นตอนที่ 2</div>
              <div className="text-[11px] text-gray-500">วัน เวลา รูปแบบ และสถานที่</div>
            </div>
          </button>

          <div className="flex-1 h-0.5 bg-gray-200 mx-3 sm:mx-6">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: currentStep > 2 ? '100%' : '0%' }}
            ></div>
          </div>

          {/* Step 3 */}
          <button
            onClick={() => {
              if (validateStep2()) setCurrentStep(3);
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                currentStep === 3
                  ? 'bg-[#4B1F5E] text-white ring-4 ring-purple-100'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900">ขั้นตอนที่ 3</div>
              <div className="text-[11px] text-gray-500">ผู้ได้รับเชิญและเอกสาร</div>
            </div>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Step Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Meeting Info */}
          {currentStep === 1 && (
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
                  onChange={e => handleCommitteeChange(e.target.value)}
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
                  onChange={e => setTitle(e.target.value)}
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
                    onChange={e => handleMeetingNumberChange(e.target.value)}
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
                    onChange={e => setBeYear(Number(e.target.value))}
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
                      onClick={() => setMeetingType(t.id as MeetingType)}
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
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ระบุสาระสำคัญของการประชุม เช่น พิจารณาแต่งตั้งอาจารย์ผู้ทรงคุณวุฒิ การจัดสรรงบประมาณ..."
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary outline-none resize-none"
                />
              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  <span>ถัดไป: วัน เวลา และสถานที่</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date, Time, Format & Venue */}
          {currentStep === 2 && (
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
                    onChange={e => setMeetingDate(e.target.value)}
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
                    onChange={e => setStartTime(e.target.value)}
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
                    onChange={e => setEndTime(e.target.value)}
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
                    onChange={e => setRsvpOpenAt(e.target.value)}
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
                    onChange={e => setRsvpDeadlineDate(e.target.value)}
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
                    onChange={e => setRsvpDeadlineTime(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-mcu-primary outline-none"
                  />
                  <span className="text-[10px] text-amber-700 mt-1 block font-medium">
                    * ต้องก่อนวันเวลาประชุม
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
                      onClick={() => setMeetingFormat(fmt)}
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
                      onClick={() => setVenue(settings.defaultVenue)}
                      className="text-[11px] text-mcu-primary hover:underline"
                    >
                      รีเซ็ตเป็นค่าเริ่มต้น
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
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
                        onChange={e => setOnlinePlatform(e.target.value)}
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
                        onChange={e => setOnlineUrl(e.target.value)}
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
                        onChange={e => setOnlineMeetingId(e.target.value)}
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
                        onChange={e => setOnlinePasscode(e.target.value)}
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
                      onChange={e => setOnlineInstructions(e.target.value)}
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
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setCurrentStep(3);
                  }}
                  className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  <span>ถัดไป: ผู้ได้รับเชิญและเอกสาร</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Invitees, Documents & Notifications */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 space-y-6 animate-fadeIn">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-mcu-primary" />
                <span>ขั้นตอนที่ 3: ผู้ได้รับเชิญ เอกสาร และการแจ้งเตือน</span>
              </h2>

              {/* 1. Member Selection from Database */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">
                      เลือกกรรมการจากฐานข้อมูลสมาชิก ({selectedMemberIds.length} ท่าน)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      กำหนดสิทธิ์นับองค์ประชุมและสิทธิ์ออกเสียงอัตโนมัติตามตำแหน่ง
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMemberIds(committeeMembers.map(m => m.id))
                      }
                      className="text-[11px] text-mcu-primary hover:underline font-medium"
                    >
                      เลือกทั้งหมด
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-[11px] text-gray-500 hover:underline"
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {committeeMembers.map(cm => {
                    const isSelected = selectedMemberIds.includes(cm.id);
                    return (
                      <label
                        key={cm.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedMemberIds(prev => [...prev, cm.id]);
                              } else {
                                setSelectedMemberIds(prev => prev.filter(i => i !== cm.id));
                              }
                            }}
                            className="rounded text-mcu-primary focus:ring-mcu-primary"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {cm.profile?.title}{cm.profile?.firstName} {cm.profile?.lastName}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {cm.committeeRole} • {cm.profile?.organization}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                            นับองค์ประชุม
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                            มีสิทธิ์ออกเสียง
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. External Invitees */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">
                      ผู้ได้รับเชิญภายนอก / ผู้ชี้แจงวาระ ({externalInvitees.length} ท่าน)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      สำหรับผู้ชี้แจง ผู้สังเกตการณ์ หรือบุคคลภายนอกสภา
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExternalInvitee}
                    className="px-2.5 py-1 text-xs border border-purple-200 text-mcu-primary bg-purple-50 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มบุคคลภายนอก</span>
                  </button>
                </div>

                {externalInvitees.map((ext, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="ชื่อ-นามสกุล..."
                        value={ext.name}
                        onChange={e => {
                          const val = e.target.value;
                          setExternalInvitees(prev =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        className="py-1.5 px-2.5 border border-gray-300 rounded bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="หน่วยงาน/ตำแหน่ง..."
                        value={ext.org}
                        onChange={e => {
                          const val = e.target.value;
                          setExternalInvitees(prev =>
                            prev.map((item, i) => (i === idx ? { ...item, org: val } : item))
                          );
                        }}
                        className="py-1.5 px-2.5 border border-gray-300 rounded bg-white text-xs"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={ext.type}
                          onChange={e => {
                            const val = e.target.value as InviteeType;
                            setExternalInvitees(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, type: val } : item))
                            );
                          }}
                          className="py-1.5 px-2 border border-gray-300 rounded bg-white text-xs flex-1"
                        >
                          <option value="presenter">ผู้ชี้แจงวาระ</option>
                          <option value="observer">ผู้สังเกตการณ์</option>
                          <option value="attendee">ผู้เข้าร่วม</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setExternalInvitees(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Document Upload (Invitation Letter & Agenda) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-gray-900">เอกสารประกอบการประชุม</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Invitation File */}
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-mcu-primary transition bg-gray-50/50">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-gray-800">
                      {invitationFile ? 'หนังสือเชิญ/นิมนต์: ' + invitationFile : 'อัปโหลดหนังสือเชิญประชุม (PDF)'}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">ไฟล์ PDF ขนาดไม่เกิน 25MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setInvitationFile(file.name);
                      }}
                      className="hidden"
                      id="inv-file-upload"
                    />
                    <label
                      htmlFor="inv-file-upload"
                      className="mt-3 inline-block px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      เลือกไฟล์
                    </label>
                  </div>

                  {/* Agenda File */}
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-mcu-primary transition bg-gray-50/50">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-gray-800">
                      {agendaFile ? 'ระเบียบวาระ: ' + agendaFile : 'อัปโหลดระเบียบวาระการประชุม (PDF)'}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">ไฟล์ PDF เอกสารประกอบวาระ</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setAgendaFile(file.name);
                      }}
                      className="hidden"
                      id="agenda-file-upload"
                    />
                    <label
                      htmlFor="agenda-file-upload"
                      className="mt-3 inline-block px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      เลือกไฟล์
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Notification Template & Channels */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-gray-900">ข้อความแจ้งเตือนและช่องทางส่ง</h3>
                <textarea
                  rows={4}
                  value={invitationMessage}
                  onChange={e => setInvitationMessage(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg outline-none font-mono"
                />

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-semibold text-gray-700">ส่งผ่านช่องทาง:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.includes('email')}
                      onChange={e => {
                        if (e.target.checked) setNotificationChannels(prev => [...prev, 'email']);
                        else setNotificationChannels(prev => prev.filter(c => c !== 'email'));
                      }}
                      className="rounded text-mcu-primary"
                    />
                    <span>อีเมล (Email)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.includes('line')}
                      onChange={e => {
                        if (e.target.checked) setNotificationChannels(prev => [...prev, 'line']);
                        else setNotificationChannels(prev => prev.filter(c => c !== 'line'));
                      }}
                      className="rounded text-mcu-primary"
                    />
                    <span>LINE Notify</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.includes('link')}
                      onChange={e => {
                        if (e.target.checked) setNotificationChannels(prev => [...prev, 'link']);
                        else setNotificationChannels(prev => prev.filter(c => c !== 'link'));
                      }}
                      className="rounded text-mcu-primary"
                    />
                    <span>ลิงก์เฉพาะบุคคล</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={sendImmediate}
                      onChange={e => setSendImmediate(e.target.checked)}
                      className="rounded text-mcu-primary"
                    />
                    <span className="font-medium">
                      ส่งคำเชิญทันทีหลังเปิดรับตอบรับ
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 3 Action Buttons */}
              <div className="pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  ย้อนกลับ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="px-4 py-2.5 border border-purple-200 text-mcu-primary bg-purple-50 hover:bg-purple-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกร่าง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('rsvp_open')}
                    className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4 text-[#C8A54B]" />
                    <span>บันทึกและเปิดรับตอบรับ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
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
                  การประชุม {currentCommName} ครั้งที่ {meetingNumber || '-'}
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
        </div>
      </div>
    </div>
  );
};
