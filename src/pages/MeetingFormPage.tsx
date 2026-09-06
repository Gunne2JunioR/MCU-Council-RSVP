import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { toBuddhistYear } from '../utils/thaiDate';
import { validateMeetingDates } from '../utils/quorum';
import {
  MeetingType,
  MeetingFormat,
  MeetingStatus,
  InviteeType
} from '../types';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Step1BasicInfo } from '../components/meeting-form/Step1BasicInfo';
import { Step2ScheduleVenue } from '../components/meeting-form/Step2ScheduleVenue';
import { Step3InviteesDocs } from '../components/meeting-form/Step3InviteesDocs';
import { MeetingSummarySidebar } from '../components/meeting-form/MeetingSummarySidebar';

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
  const [onlineInstructions, setOnlineInstructions] = useState(
    'กรุณาเข้าห้องประชุมออนไลน์ก่อนเริ่ม 15 นาที และระบุชื่อจริงในระบบ'
  );

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

  // Add/update external invitee
  const handleAddExternalInvitee = () => {
    setExternalInvitees(prev => [
      ...prev,
      { name: '', org: '', type: 'presenter', hasQuorum: false }
    ]);
  };

  const handleUpdateExternalInvitee = (
    index: number,
    updated: Partial<{ name: string; org: string; type: InviteeType; hasQuorum: boolean }>
  ) => {
    setExternalInvitees(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updated } : item))
    );
  };

  const handleRemoveExternalInvitee = (index: number) => {
    setExternalInvitees(prev => prev.filter((_, idx) => idx !== index));
  };

  // Step 2 Validation: Deadline must be strictly before meeting date/time (Cardinal Invariant 6)
  const validateStep2 = (): boolean => {
    setValidationError(null);
    const deadlineIso = `${rsvpDeadlineDate}T${rsvpDeadlineTime}:00`;
    const result = validateMeetingDates(meetingDate, startTime, deadlineIso);
    if (!result.isValid) {
      setValidationError(result.error || 'วันและเวลาปิดรับตอบรับ (RSVP Deadline) ต้องอยู่ก่อนวันและเวลาเริ่มการประชุม');
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
          {currentStep === 1 && (
            <Step1BasicInfo
              committeeId={committeeId}
              onCommitteeChange={handleCommitteeChange}
              title={title}
              onTitleChange={setTitle}
              meetingNumber={meetingNumber}
              onMeetingNumberChange={handleMeetingNumberChange}
              beYear={beYear}
              onBeYearChange={setBeYear}
              meetingType={meetingType}
              onMeetingTypeChange={setMeetingType}
              description={description}
              onDescriptionChange={setDescription}
              committees={committees}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2ScheduleVenue
              meetingDate={meetingDate}
              onMeetingDateChange={setMeetingDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              rsvpOpenAt={rsvpOpenAt}
              onRsvpOpenAtChange={setRsvpOpenAt}
              rsvpDeadlineDate={rsvpDeadlineDate}
              onRsvpDeadlineDateChange={setRsvpDeadlineDate}
              rsvpDeadlineTime={rsvpDeadlineTime}
              onRsvpDeadlineTimeChange={setRsvpDeadlineTime}
              meetingFormat={meetingFormat}
              onMeetingFormatChange={setMeetingFormat}
              venue={venue}
              onVenueChange={setVenue}
              defaultVenue={settings.defaultVenue}
              onlinePlatform={onlinePlatform}
              onOnlinePlatformChange={setOnlinePlatform}
              onlineUrl={onlineUrl}
              onOnlineUrlChange={setOnlineUrl}
              onlineMeetingId={onlineMeetingId}
              onOnlineMeetingIdChange={setOnlineMeetingId}
              onlinePasscode={onlinePasscode}
              onOnlinePasscodeChange={setOnlinePasscode}
              onlineInstructions={onlineInstructions}
              onOnlineInstructionsChange={setOnlineInstructions}
              onPrev={() => setCurrentStep(1)}
              onNext={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
            />
          )}

          {currentStep === 3 && (
            <Step3InviteesDocs
              committeeMembers={committeeMembers}
              selectedMemberIds={selectedMemberIds}
              onSelectedMemberIdsChange={setSelectedMemberIds}
              externalInvitees={externalInvitees}
              onAddExternalInvitee={handleAddExternalInvitee}
              onUpdateExternalInvitee={handleUpdateExternalInvitee}
              onRemoveExternalInvitee={handleRemoveExternalInvitee}
              invitationFile={invitationFile}
              onInvitationFileChange={setInvitationFile}
              agendaFile={agendaFile}
              onAgendaFileChange={setAgendaFile}
              invitationMessage={invitationMessage}
              onInvitationMessageChange={setInvitationMessage}
              notificationChannels={notificationChannels}
              onNotificationChannelsChange={setNotificationChannels}
              sendImmediate={sendImmediate}
              onSendImmediateChange={setSendImmediate}
              onPrev={() => setCurrentStep(2)}
              onSave={handleSave}
            />
          )}
        </div>

        {/* Right Column: Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <MeetingSummarySidebar
            committeeName={currentCommName}
            meetingNumber={meetingNumber}
            meetingDate={meetingDate}
            startTime={startTime}
            endTime={endTime}
            meetingFormat={meetingFormat}
            venue={venue}
            onlinePlatform={onlinePlatform}
            rsvpDeadlineDate={rsvpDeadlineDate}
            rsvpDeadlineTime={rsvpDeadlineTime}
          />
        </div>
      </div>
    </div>
  );
};
