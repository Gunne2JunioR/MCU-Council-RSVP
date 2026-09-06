import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastNotification';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, School } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole, allUsers } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('staff.mcu@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        showToast('success', 'เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ MCU Council RSVP');
        navigate('/');
      } else {
        setErrorMsg('ไม่พบข้อมูลบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง');
        showToast('error', 'เข้าสู่ระบบไม่สำเร็จ', 'กรุณาตรวจสอบอีเมลหรือรหัสผ่าน');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('staff.mcu@example.com');
      showToast('success', 'เข้าสู่ระบบผ่าน MCU SSO สำเร็จ', 'เข้าสู่ระบบด้วยบัญชีมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย');
      setIsLoading(false);
      navigate('/');
    }, 600);
  };

  const handleQuickLoginAsRole = (role: UserRole) => {
    switchRole(role);
    showToast('info', `สลับบทบาทเป็น ${role}`, 'เข้าสู่ระบบในฐานะบัญชีตัวอย่างเพื่อการทดสอบ');
    if (role === 'member' || role === 'delegate') {
      navigate('/my-meetings');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#341342] via-[#4B1F5E] to-[#6B3F83] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#C8A54B]/30">
        {/* Left Side: Brand presentation */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#4B1F5E] to-[#2B0E38] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full border-8 border-[#C8A54B]/20 pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full border-4 border-[#C8A54B]/10 pointer-events-none"></div>

          <div>
            {/* University Emblem Placeholder */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xs border-2 border-[#C8A54B] text-[#C8A54B] mb-6 shadow-md">
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M5.6 18.4l4.3-4.3M14.1 9.9l4.3-4.3" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>

            <span className="inline-block text-[11px] font-semibold tracking-wider text-[#C8A54B] uppercase bg-[#C8A54B]/20 px-2.5 py-1 rounded-full mb-3">
              มจร. • MCU
            </span>

            <h1 className="text-2xl font-bold leading-snug tracking-tight text-white">
              ระบบตอบรับเข้าร่วมประชุม<br />สภามหาวิทยาลัย
            </h1>
            <p className="text-sm text-purple-200 mt-2 leading-relaxed">
              สำนักงานสภามหาวิทยาลัย<br />
              มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-400/20 text-xs text-purple-200 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A54B]" />
              <span>รองรับการประชุม Onsite, Online และ Hybrid</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A54B]" />
              <span>เช็กชื่อ ตรวจสอบองค์ประชุม และออกรายงาน</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A54B]" />
              <span>จัดการคำขอลาและมอบหมายผู้แทน</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form & Quick Role Selection */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
                <p className="text-xs text-gray-500 mt-1">กรอกข้อมูลบัญชีเพื่อเข้าสู่ระบบบริหารการประชุม</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  อีเมลหรือรหัสผู้ใช้งาน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@mcu.ac.th หรือชื่ออีเมล"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={e => {
                      e.preventDefault();
                      showToast('info', 'ลืมรหัสผ่าน', 'กรุณาติดต่อสำนักงานสภามหาวิทยาลัย โทร. 035-248-000 ต่อ 8000');
                    }}
                    className="text-[11px] text-mcu-primary hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">หรือ</span>
                </div>
              </div>

              {/* University SSO Option */}
              <button
                type="button"
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium border border-gray-300 rounded-lg shadow-2xs transition flex items-center justify-center gap-2"
              >
                <School className="w-4 h-4 text-mcu-primary" />
                <span>เข้าสู่ระบบด้วยบัญชีมหาวิทยาลัย (MCU SSO)</span>
              </button>
            </form>
          </div>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-mcu-gold" />
              <span>คลิกทดสอบด่วนตามบทบาท (Quick Demo Roles):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => handleQuickLoginAsRole('staff')}
                className="px-2 py-1.5 text-left rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs text-mcu-primary transition"
              >
                <div className="font-semibold">Staff (เจ้าหน้าที่)</div>
                <div className="text-[10px] text-gray-500">สร้างประชุม/ติดตาม</div>
              </button>

              <button
                onClick={() => handleQuickLoginAsRole('secretary')}
                className="px-2 py-1.5 text-left rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs text-amber-900 transition"
              >
                <div className="font-semibold">Secretary (เลขาฯ)</div>
                <div className="text-[10px] text-gray-500">อนุมัติลา/รับรององค์ฯ</div>
              </button>

              <button
                onClick={() => handleQuickLoginAsRole('chairperson')}
                className="px-2 py-1.5 text-left rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs text-rose-900 transition"
              >
                <div className="font-semibold">Chair (นายกสภาฯ)</div>
                <div className="text-[10px] text-gray-500">สรุปผลการประชุม</div>
              </button>

              <button
                onClick={() => handleQuickLoginAsRole('member')}
                className="px-2 py-1.5 text-left rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs text-emerald-900 transition"
              >
                <div className="font-semibold">Member (กรรมการ)</div>
                <div className="text-[10px] text-gray-500">ตอบรับ/ขอลา/มอบหมาย</div>
              </button>

              <button
                onClick={() => handleQuickLoginAsRole('delegate')}
                className="px-2 py-1.5 text-left rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-900 transition"
              >
                <div className="font-semibold">Delegate (ผู้แทน)</div>
                <div className="text-[10px] text-gray-500">ดูงานที่ได้รับมอบหมาย</div>
              </button>

              <button
                onClick={() => handleQuickLoginAsRole('super_admin')}
                className="px-2 py-1.5 text-left rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs text-slate-900 transition"
              >
                <div className="font-semibold">Super Admin</div>
                <div className="text-[10px] text-gray-500">ตั้งค่าระบบ/สิทธิ์ทั้งหมด</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
