import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateTime } from '../utils/thaiDate';
import {
  Settings,
  MapPin,
  Mail,
  Shield,
  Clock,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  Activity,
  UserCheck,
  Building
} from 'lucide-react';
import { QuorumRuleType } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, auditLogs, resetToDefaultSeed, committees } = useData();
  const { allUsers } = useAuth();
  const { showToast } = useToast();

  const [defaultVenue, setDefaultVenue] = useState(settings.defaultVenue);
  const [invitationTemplate, setInvitationTemplate] = useState(settings.invitationEmailTemplate);
  const [defaultQuorumRule, setDefaultQuorumRule] = useState<QuorumRuleType>(settings.defaultQuorumRule);
  const [tokenExpiryDays, setTokenExpiryDays] = useState(settings.tokenExpiryDays);
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'rbac' | 'audit'>('general');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultVenue,
      invitationEmailTemplate: invitationTemplate,
      defaultQuorumRule,
      tokenExpiryDays
    });
    showToast('success', 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  const handleResetSeed = () => {
    if (confirm('คำเตือน: คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่? ข้อมูลที่เพิ่มใหม่จะถูกล้าง')) {
      resetToDefaultSeed();
      showToast('info', 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-mcu-primary" />
            <span>การตั้งค่าระบบ (System Settings)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ตั้งค่าสถานที่ประชุมมาตรฐาน เทมเพลตข้อความเชิญ กฎองค์ประชุม และบทบาทผู้ใช้งาน
          </p>
        </div>

        <button
          onClick={handleResetSeed}
          className="px-3.5 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>รีเซ็ตข้อมูลตัวอย่าง (Reset Seed)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'general'
              ? 'border-mcu-primary text-mcu-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ตั้งค่าทั่วไปและสถานที่
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-mcu-primary text-mcu-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          แม่แบบข้อความเชิญ (Templates)
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'rbac'
              ? 'border-mcu-primary text-mcu-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          จัดการบทบาทและสิทธิ์ (RBAC)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-mcu-primary text-mcu-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ประวัติการดำเนินงาน (Audit Logs)
        </button>
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6 text-xs animate-fadeIn">
          {/* Default Meeting Venue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-mcu-primary" />
                <span>สถานที่จัดการประชุมเริ่มต้น (Default Meeting Venue)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setDefaultVenue(
                    'ห้องประชุม 401 ชั้น 4 อาคารพระธรรมวชิรคุณาธาร (โกศล มหาวีโร) อาคารสำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา'
                  )
                }
                className="text-mcu-primary hover:underline"
              >
                คืนค่าห้อง 401 มจร. วังน้อย
              </button>
            </div>
            <textarea
              rows={3}
              value={defaultVenue}
              onChange={e => setDefaultVenue(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mcu-primary bg-gray-50/50"
            />
            <p className="text-[11px] text-gray-500">
              * ค่าเริ่มต้นนี้จะถูกเติมลงในแบบฟอร์มสร้างการประชุมอัตโนมัติ โดยเจ้าหน้าที่สามารถแก้ไขเฉพาะครั้งได้เสมอ
            </p>
          </div>

          {/* Default Quorum Rule */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <label className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-mcu-primary" />
              <span>เกณฑ์องค์ประชุมเริ่มต้น (Default Quorum Criteria)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="defRule"
                  checked={defaultQuorumRule === 'more_than_half'}
                  onChange={() => setDefaultQuorumRule('more_than_half')}
                  className="text-mcu-primary"
                />
                <div>
                  <div className="font-semibold text-gray-800">มากกว่ากึ่งหนึ่ง (&gt; 1/2)</div>
                  <div className="text-[10px] text-gray-500">มาตรฐานตามข้อบังคับสภามหาวิทยาลัย</div>
                </div>
              </label>

              <label className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="defRule"
                  checked={defaultQuorumRule === 'not_less_than_half'}
                  onChange={() => setDefaultQuorumRule('not_less_than_half')}
                  className="text-mcu-primary"
                />
                <div>
                  <div className="font-semibold text-gray-800">ไม่น้อยกว่ากึ่งหนึ่ง (&ge; 1/2)</div>
                  <div className="text-[10px] text-gray-500">สำหรับคณะอนุกรรมการบางชุด</div>
                </div>
              </label>
            </div>
          </div>

          {/* Token Expiry Duration */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <label className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-mcu-primary" />
              <span>อายุของลิงก์ตอบรับเฉพาะบุคคล (Personal Token Expiry)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={90}
                value={tokenExpiryDays}
                onChange={e => setTokenExpiryDays(Number(e.target.value))}
                className="w-24 py-2 px-3 border border-gray-300 rounded-lg outline-none font-bold text-center"
              />
              <span className="text-gray-700">วัน นับจากวันที่ส่งคำเชิญ</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Invitation Message Templates */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-4 text-xs animate-fadeIn">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-mcu-primary" />
              <span>เทมเพลตข้อความเชิญประชุมทางอีเมล</span>
            </h3>
            <p className="text-gray-500 mt-1">
              ตัวแปรที่รองรับ: &#123;title&#125;, &#123;first_name&#125;, &#123;last_name&#125;, &#123;committee_name&#125;, &#123;meeting_number&#125;, &#123;meeting_date_th&#125;, &#123;meeting_time&#125;, &#123;venue&#125;, &#123;rsvp_deadline_th&#125;, &#123;rsvp_url&#125;
            </p>
          </div>

          <textarea
            rows={8}
            value={invitationTemplate}
            onChange={e => setInvitationTemplate(e.target.value)}
            className="w-full py-2.5 px-3 border border-gray-300 rounded-lg font-mono outline-none bg-gray-50/40"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกเทมเพลต</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Roles and Users */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden text-xs animate-fadeIn">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">บทบาทและสิทธิ์ผู้ใช้งาน (6 ระดับสิทธิ์)</h3>
            <p className="text-gray-500 mt-0.5">รายชื่อบัญชีผู้ใช้ตัวอย่างและบทบาทที่กำหนดในระบบ</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="p-3">ชื่อผู้ใช้</th>
                  <th className="p-3">อีเมล</th>
                  <th className="p-3">บทบาทระบบ</th>
                  <th className="p-3">ตำแหน่งงาน</th>
                  <th className="p-3">ขอบเขตอำนาจ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-purple-50/20">
                    <td className="p-3 font-semibold text-gray-900">
                      {u.title}{u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 text-gray-500 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-purple-50 text-mcu-primary border border-purple-200 font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{u.position}</td>
                    <td className="p-3 text-gray-500 text-[11px]">
                      {u.role === 'super_admin' && 'จัดการผู้ใช้ สิทธิ์ และการตั้งค่าทั้งหมด'}
                      {u.role === 'staff' && 'สร้างการประชุม ส่งคำเชิญ ติดตามคำตอบ'}
                      {u.role === 'secretary' && 'อนุมัติลา/ผู้แทน รับรององค์ประชุม'}
                      {u.role === 'chairperson' && 'ดูรายงานสรุปผลภาพรวม'}
                      {u.role === 'member' && 'ตอบรับการประชุม แก้ไขเบอร์/อีเมล'}
                      {u.role === 'delegate' && 'ดูงานที่ได้รับมอบหมาย'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden text-xs animate-fadeIn">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">ประวัติการดำเนินงานในระบบ (Audit Trail)</h3>
              <p className="text-gray-500 mt-0.5">บันทึกการสร้าง แก้ไข ตอบรับ พิจารณา และรับรองข้อมูลทั้งหมด</p>
            </div>
            <span className="text-gray-400 font-mono">{auditLogs.length} รายการ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="p-3">เวลาที่เกิดเหตุการณ์</th>
                  <th className="p-3">ผู้ดำเนินการ</th>
                  <th className="p-3">บทบาท</th>
                  <th className="p-3">การกระทำ (Action)</th>
                  <th className="p-3">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      {formatThaiDateTime(log.timestamp)}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{log.userName}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-mono">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-mcu-primary">{log.action}</td>
                    <td className="p-3 text-gray-600 max-w-md leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
