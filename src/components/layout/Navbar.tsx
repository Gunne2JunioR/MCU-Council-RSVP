import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import {
  Bell,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const userNotifs = notifications.filter(
    n => n.recipientId === currentUser?.id || currentRole === 'staff' || currentRole === 'secretary'
  );
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  const roleLabels: Record<UserRole, { th: string; badge: string; color: string }> = {
    super_admin: { th: 'ผู้ดูแลระบบสูงสุด', badge: 'Admin', color: 'bg-purple-100 text-purple-800' },
    staff: { th: 'เจ้าหน้าที่สำนักงานสภาฯ', badge: 'Staff', color: 'bg-indigo-100 text-indigo-800' },
    secretary: { th: 'เลขานุการสภามหาวิทยาลัย', badge: 'Secretary', color: 'bg-amber-100 text-amber-800' },
    chairperson: { th: 'นายกสภามหาวิทยาลัย', badge: 'Chairperson', color: 'bg-rose-100 text-rose-800' },
    member: { th: 'กรรมการสภามหาวิทยาลัย', badge: 'Member', color: 'bg-emerald-100 text-emerald-800' },
    delegate: { th: 'ผู้แทนกรรมการ', badge: 'Delegate', color: 'bg-blue-100 text-blue-800' }
  };

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    // If switching to member, redirect to member view
    if (role === 'member' || role === 'delegate') {
      navigate('/my-meetings');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left Side: Mobile Menu button + University Emblem Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            {/* MCU Emblem Placeholder */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#4B1F5E] to-[#6B3F83] text-[#C8A54B] shadow-sm border border-[#C8A54B]/30 flex-shrink-0">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M5.6 18.4l4.3-4.3M14.1 9.9l4.3-4.3" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {/* Gold Ring Indicator */}
              <div className="absolute -inset-0.5 rounded-full border border-[#C8A54B]/50 pointer-events-none"></div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-mcu-darkPurple group-hover:text-mcu-primary transition">
                  MCU Council RSVP
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-[#F5E9C9] text-[#7A5813] rounded-full border border-[#C8A54B]/40">
                  มจร.
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-gray-500 font-normal leading-tight line-clamp-1">
                ระบบตอบรับเข้าร่วมประชุมสภามหาวิทยาลัย มหาจุฬาลงกรณราชวิทยาลัย
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher (Crucial for Reviewers & Testing) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-mcu-primary text-xs font-medium transition shadow-xs"
              title="สลับบทบาทเพื่อทดสอบระบบ"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-mcu-primary" />
              <span className="hidden sm:inline">บทบาท:</span>
              <span className="font-semibold text-mcu-darkPurple">
                {roleLabels[currentRole]?.badge || currentRole}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex items-center justify-between">
                  <span>สลับบทบาททดสอบ (RBAC)</span>
                  <Sparkles className="w-3.5 h-3.5 text-mcu-gold" />
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition ${
                      currentRole === role ? 'bg-purple-50/80 font-bold text-mcu-primary' : 'text-gray-700'
                    }`}
                  >
                    <div>
                      <div>{roleLabels[role].th}</div>
                      <div className="text-[10px] text-gray-400">role: {role}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${roleLabels[role].color}`}>
                      {roleLabels[role].badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Demo RSVP Link for Easy Testing */}
          <Link
            to="/rsvp/token_rsvp_001"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#7A5813] text-xs font-semibold transition shadow-xs"
            title="เปิดหน้าตอบรับการประชุมจำลองสำหรับกรรมการ"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C8A54B]" />
            <span>ลองตอบรับ (RSVP)</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-gray-500 hover:text-mcu-primary rounded-lg hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-800">การแจ้งเตือน</h4>
                  <span className="text-[11px] text-gray-500">{userNotifs.length} รายการ</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {userNotifs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">ไม่มีการแจ้งเตือนใหม่</div>
                  ) : (
                    userNotifs.slice(0, 6).map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs hover:bg-gray-50 cursor-pointer transition ${
                          !notif.isRead ? 'bg-purple-50/40' : ''
                        }`}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.linkUrl) {
                            navigate(notif.linkUrl);
                            setShowNotifMenu(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-gray-900">{notif.title}</h5>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-mcu-primary mt-1"></span>}
                        </div>
                        <p className="text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-mcu-primary to-mcu-secondary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.firstName?.charAt(0) || 'ม'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-900 leading-tight">
                  {currentUser?.title}{currentUser?.firstName}
                </span>
                <span className="text-[10px] text-gray-500">
                  {currentUser?.position ? currentUser.position.slice(0, 20) + '...' : roleLabels[currentRole]?.th}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{currentUser?.title}{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-mcu-primary mt-1 font-medium">{currentUser?.organization}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>ข้อมูลส่วนตัวของฉัน</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
