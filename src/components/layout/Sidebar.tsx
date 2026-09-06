import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  UserCheck,
  BarChart3,
  FileCheck2,
  QrCode,
  FileSpreadsheet,
  Settings,
  CalendarCheck2,
  History,
  UserCircle2,
  BellRing
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole } = useAuth();

  const isStaffOrAdmin = ['super_admin', 'staff', 'secretary', 'chairperson'].includes(currentRole);

  interface NavItem {
    to: string;
    label: string;
    icon: React.ReactNode;
    end?: boolean;
  }

  const staffNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/meetings', label: 'การประชุม', icon: <CalendarDays className="w-4 h-4" /> },
    { to: '/meetings/create', label: 'สร้างการประชุม', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/members', label: 'รายชื่อกรรมการ', icon: <Users className="w-4 h-4" /> },
    { to: '/invitees', label: 'ผู้ได้รับเชิญ', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/responses', label: 'ผลตอบรับ', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/approvals', label: 'ตรวจสอบผู้แทน', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/attendance', label: 'เช็กชื่อวันประชุม', icon: <QrCode className="w-4 h-4" /> },
    { to: '/reports', label: 'รายงาน', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { to: '/settings', label: 'ตั้งค่าระบบ', icon: <Settings className="w-4 h-4" /> },
  ];

  const memberNavItems: NavItem[] = [
    { to: '/my-meetings', label: 'การประชุมของฉัน', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { to: '/history', label: 'ประวัติการตอบรับ', icon: <History className="w-4 h-4" /> },
    { to: '/profile', label: 'ข้อมูลส่วนตัว', icon: <UserCircle2 className="w-4 h-4" /> },
    { to: '/notifications', label: 'แจ้งเตือน', icon: <BellRing className="w-4 h-4" /> },
  ];

  const activeNavItems = isStaffOrAdmin ? staffNavItems : memberNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="py-4 px-3 space-y-6 overflow-y-auto">
          {/* Menu Section Header */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              {isStaffOrAdmin ? 'เมนูเจ้าหน้าที่และสภาฯ' : 'เมนูกรรมการและผู้แทน'}
            </div>

            <nav className="space-y-1">
              {activeNavItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#4B1F5E] text-white shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-[#4B1F5E] hover:bg-purple-50/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-[#C8A54B]' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Quick Info Box in Sidebar */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <h5 className="text-xs font-semibold text-mcu-primary mb-1">
              {isStaffOrAdmin ? 'สำนักงานสภามหาวิทยาลัย' : 'ข้อความปฏิบัติ'}
            </h5>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {isStaffOrAdmin
                ? 'มจร. ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา ติดต่อสำนักงาน โทร. 035-248-000 ต่อ 8000'
                : 'กรุณาตอบรับการประชุมภายในกำหนดเวลาเพื่ออำนวยความสะดวกในการจัดองค์ประชุม'}
            </p>
          </div>
        </div>

        {/* Footer version */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-400 text-center">
          MCU Council RSVP v1.0 • มจร.
        </div>
      </aside>
    </>
  );
};
