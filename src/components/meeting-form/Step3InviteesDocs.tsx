import React from 'react';
import { Users, Plus, Trash2, Upload, FileText, Save, Send } from 'lucide-react';
import { CommitteeMember, InviteeType, MeetingStatus } from '../../types';

interface ExternalInviteeItem {
  name: string;
  org: string;
  type: InviteeType;
  hasQuorum: boolean;
}

interface Step3InviteesDocsProps {
  committeeMembers: CommitteeMember[];
  selectedMemberIds: string[];
  onSelectedMemberIdsChange: (ids: string[]) => void;
  externalInvitees: ExternalInviteeItem[];
  onAddExternalInvitee: () => void;
  onUpdateExternalInvitee: (index: number, updated: Partial<ExternalInviteeItem>) => void;
  onRemoveExternalInvitee: (index: number) => void;
  invitationFile: string | null;
  onInvitationFileChange: (fileName: string) => void;
  agendaFile: string | null;
  onAgendaFileChange: (fileName: string) => void;
  invitationMessage: string;
  onInvitationMessageChange: (msg: string) => void;
  notificationChannels: ('email' | 'line' | 'link')[];
  onNotificationChannelsChange: (channels: ('email' | 'line' | 'link')[]) => void;
  sendImmediate: boolean;
  onSendImmediateChange: (send: boolean) => void;
  onPrev: () => void;
  onSave: (status: MeetingStatus) => void;
}

export const Step3InviteesDocs: React.FC<Step3InviteesDocsProps> = ({
  committeeMembers,
  selectedMemberIds,
  onSelectedMemberIdsChange,
  externalInvitees,
  onAddExternalInvitee,
  onUpdateExternalInvitee,
  onRemoveExternalInvitee,
  invitationFile,
  onInvitationFileChange,
  agendaFile,
  onAgendaFileChange,
  invitationMessage,
  onInvitationMessageChange,
  notificationChannels,
  onNotificationChannelsChange,
  sendImmediate,
  onSendImmediateChange,
  onPrev,
  onSave,
}) => {
  return (
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
                onSelectedMemberIdsChange(committeeMembers.map(m => m.id))
              }
              className="text-[11px] text-mcu-primary hover:underline font-medium"
            >
              เลือกทั้งหมด
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => onSelectedMemberIdsChange([])}
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
                        onSelectedMemberIdsChange([...selectedMemberIds, cm.id]);
                      } else {
                        onSelectedMemberIdsChange(selectedMemberIds.filter(i => i !== cm.id));
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
            onClick={onAddExternalInvitee}
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
                onChange={e => onUpdateExternalInvitee(idx, { name: e.target.value })}
                className="py-1.5 px-2.5 border border-gray-300 rounded bg-white text-xs"
              />
              <input
                type="text"
                placeholder="หน่วยงาน/ตำแหน่ง..."
                value={ext.org}
                onChange={e => onUpdateExternalInvitee(idx, { org: e.target.value })}
                className="py-1.5 px-2.5 border border-gray-300 rounded bg-white text-xs"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={ext.type}
                  onChange={e => onUpdateExternalInvitee(idx, { type: e.target.value as InviteeType })}
                  className="py-1.5 px-2 border border-gray-300 rounded bg-white text-xs flex-1"
                >
                  <option value="presenter">ผู้ชี้แจงวาระ</option>
                  <option value="observer">ผู้สังเกตการณ์</option>
                  <option value="attendee">ผู้เข้าร่วม</option>
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveExternalInvitee(idx)}
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
                if (file) onInvitationFileChange(file.name);
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
                if (file) onAgendaFileChange(file.name);
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
          onChange={e => onInvitationMessageChange(e.target.value)}
          className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg outline-none font-mono"
        />

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-gray-700">ส่งผ่านช่องทาง:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationChannels.includes('email')}
              onChange={e => {
                if (e.target.checked) onNotificationChannelsChange([...notificationChannels, 'email']);
                else onNotificationChannelsChange(notificationChannels.filter(c => c !== 'email'));
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
                if (e.target.checked) onNotificationChannelsChange([...notificationChannels, 'line']);
                else onNotificationChannelsChange(notificationChannels.filter(c => c !== 'line'));
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
                if (e.target.checked) onNotificationChannelsChange([...notificationChannels, 'link']);
                else onNotificationChannelsChange(notificationChannels.filter(c => c !== 'link'));
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
              onChange={e => onSendImmediateChange(e.target.checked)}
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
          onClick={onPrev}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
        >
          ย้อนกลับ
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSave('draft')}
            className="px-4 py-2.5 border border-purple-200 text-mcu-primary bg-purple-50 hover:bg-purple-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกร่าง</span>
          </button>

          <button
            type="button"
            onClick={() => onSave('rsvp_open')}
            className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 text-[#C8A54B]" />
            <span>บันทึกและเปิดรับตอบรับ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
