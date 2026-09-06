import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastNotification';
import { UserCircle2, Save, Phone, Mail, Building, Shield } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [organization, setOrganization] = useState(currentUser?.organization || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ phone, email, organization });
    showToast('success', 'บันทึกข้อมูลส่วนตัวสำเร็จ', 'ข้อมูลการติดต่อของท่านได้รับการปรับปรุงแล้ว');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCircle2 className="w-6 h-6 text-mcu-primary" />
          <span>ข้อมูลส่วนตัว (My Profile)</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          แก้ไขหมายเลขโทรศัพท์และอีเมลสำหรับการรับหนังสือเชิญและเอกสารการประชุม
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#4B1F5E] to-[#6B3F83] text-white text-2xl font-bold flex items-center justify-center border-2 border-[#C8A54B]">
            {currentUser?.firstName?.charAt(0) || 'ม'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {currentUser?.title}{currentUser?.firstName} {currentUser?.lastName}
            </h3>
            <p className="text-xs text-mcu-primary font-semibold mt-0.5">{currentUser?.position}</p>
            <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
              บทบาท: {currentUser?.role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              ส่วนงาน / สังกัด
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              หมายเลขโทรศัพท์มือถือ (สำหรับ SMS / WhatsApp)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              อีเมลสำหรับรับเอกสารประชุม
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
