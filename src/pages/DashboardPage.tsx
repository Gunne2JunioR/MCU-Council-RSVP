import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatThaiDateShort, formatThaiTime, toBuddhistYear } from '../utils/thaiDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  UserMinus,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  QrCode,
  Calendar,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { meetings, invitees, notifications } = useData();
  const { currentRole } = useAuth();

  // Current System Date (Default to current date / 2026-09)
  const now = new Date();
  const currentYearStr = now.getFullYear().toString();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const defaultYearMonth = `${currentYearStr}-${currentMonthStr}`; // e.g. "2026-09"

  // Selected Month State (Defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultYearMonth);

  // Thai month names array
  const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Parse Year and Month for display
  const [selYear, selMonth] = selectedMonth.split('-').map(Number);
  const selectedMonthThaiName = THAI_MONTHS_FULL[selMonth - 1] || 'กันยายน';
  const selectedYearBe = toBuddhistYear(selYear || 2026);
  const isCurrentMonthSelected = selectedMonth === defaultYearMonth;

  // Filter meetings belonging to the selected month (based on meetingDate: YYYY-MM-DD)
  const monthlyMeetings = useMemo(() => {
    return meetings.filter(m => m.meetingDate && m.meetingDate.startsWith(selectedMonth));
  }, [meetings, selectedMonth]);

  // Meeting IDs in this month
  const monthlyMeetingIds = useMemo(() => {
    return new Set(monthlyMeetings.map(m => m.id));
  }, [monthlyMeetings]);

  // Filter invitees belonging to meetings in this selected month
  const monthlyInvitees = useMemo(() => {
    return invitees.filter(i => monthlyMeetingIds.has(i.meetingId));
  }, [invitees, monthlyMeetingIds]);

  // Monthly Metrics calculation
  const openMeetings = monthlyMeetings.filter(m => m.status === 'rsvp_open');
  const allInviteesCount = monthlyInvitees.length;
  const attendedCount = monthlyInvitees.filter(i => i.rsvpStatus === 'attend').length;
  const pendingCount = monthlyInvitees.filter(i => i.rsvpStatus === 'pending').length;
  const pendingLeaveCount = monthlyInvitees.filter(i => i.leaveRequest && i.leaveRequest.status === 'pending').length;
  const pendingDelegateCount = monthlyInvitees.filter(i => i.delegateRequest && i.delegateRequest.status === 'pending').length;

  // Upcoming meetings
  const upcomingMeetings = [...meetings]
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
    .slice(0, 4);

  // RSVP Status Chart Data (Monthly scoped)
  const rsvpChartData = [
    { name: 'เข้าร่วม Onsite', value: monthlyInvitees.filter(i => i.response?.status === 'attend' && i.response?.attendanceFormat === 'Onsite').length, color: '#10B981' },
    { name: 'เข้าร่วม Online', value: monthlyInvitees.filter(i => i.response?.status === 'attend' && i.response?.attendanceFormat === 'Online').length, color: '#2563EB' },
    { name: 'มอบหมายผู้แทน', value: monthlyInvitees.filter(i => i.rsvpStatus === 'delegate').length, color: '#6366F1' },
    { name: 'ลาประชุม', value: monthlyInvitees.filter(i => i.rsvpStatus === 'leave').length, color: '#EF4444' },
    { name: 'ยังไม่ตอบรับ', value: pendingCount, color: '#9CA3AF' }
  ].filter(d => d.value > 0);

  // Committee breakdown
  const committeeStats = [
    { name: 'สภามหาวิทยาลัย', count: meetings.filter(m => m.committeeId === 'comm-1').length },
    { name: 'ก.บ.ม.', count: meetings.filter(m => m.committeeId === 'comm-2').length },
    { name: 'อนุกรรมการ', count: meetings.filter(m => m.committeeId === 'comm-3').length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Primary CTA */}
      <div className="bg-gradient-to-r from-[#4B1F5E] via-[#6B3F83] to-[#341342] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C8A54B]/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8A54B]/20 text-[#C8A54B] text-xs font-medium border border-[#C8A54B]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สำนักงานสภามหาวิทยาลัย มจร.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ภาพรวมระบบตอบรับเข้าร่วมประชุม
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
            ติดตามสถานะการตอบรับ ตรวจสอบองค์ประชุมล่วงหน้า บริหารจัดการคำขอลาและผู้แทนสำหรับการประชุมสภามหาวิทยาลัย
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 flex-shrink-0">
          <Link
            to="/meetings/create"
            className="px-5 py-3 bg-[#C8A54B] hover:bg-[#b5933d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างการประชุมใหม่</span>
          </Link>

          <Link
            to="/attendance"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-xl backdrop-blur-xs transition flex items-center gap-2 border border-white/20"
          >
            <QrCode className="w-4 h-4" />
            <span>เช็กชื่อวันประชุม</span>
          </Link>
        </div>
      </div>

      {/* Monthly Statistics Section Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-mcu-primary rounded-lg">
            <Calendar className="w-5 h-5 text-mcu-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                สถิติประจำเดือน{selectedMonthThaiName} พ.ศ. {selectedYearBe}
              </h2>
              {isCurrentMonthSelected && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  เดือนปัจจุบัน
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              สรุปจำนวนรายการประชุม ผู้ได้รับเชิญ และผลการตอบรับเฉพาะรอบเดือนที่เลือก
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>เลือกรอบเดือน:</span>
          </label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="py-1.5 px-3 text-xs border border-purple-200 rounded-lg bg-purple-50/50 font-bold text-mcu-darkPurple outline-none focus:ring-2 focus:ring-mcu-primary shadow-xs"
          >
            <option value="2026-09">กันยายน 2569 (เดือนปัจจุบัน)</option>
            <option value="2026-08">สิงหาคม 2569</option>
            <option value="2026-10">ตุลาคม 2569</option>
            <option value="2026-11">พฤศจิกายน 2569</option>
            <option value="2026-12">ธันวาคม 2569</option>
          </select>

          {!isCurrentMonthSelected && (
            <button
              onClick={() => setSelectedMonth(defaultYearMonth)}
              className="px-2.5 py-1.5 text-xs text-mcu-primary hover:bg-purple-50 font-semibold rounded-lg transition"
            >
              กลับสู่เดือนปัจจุบัน
            </button>
          )}
        </div>
      </div>

      {/* 6 Key Performance Indicator Cards (Scoped to Selected Month) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Open Meetings */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">เปิดรับตอบรับ</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{openMeetings.length}</div>
          <span className="text-[10px] text-emerald-600 mt-1 inline-block font-medium">รายการประชุม ({selectedMonthThaiName})</span>
        </div>

        {/* 2. Total Invitees */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">ผู้ได้รับเชิญรวม</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-mcu-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{allInviteesCount}</div>
          <span className="text-[10px] text-gray-500 mt-1 inline-block">ท่าน</span>
        </div>

        {/* 3. Attended */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">ตอบรับเข้าร่วม</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{attendedCount}</div>
          <span className="text-[10px] text-gray-500 mt-1 inline-block">
            {allInviteesCount > 0 ? `${Math.round((attendedCount / allInviteesCount) * 100)}% ของทั้งหมด` : '0%'}
          </span>
        </div>

        {/* 4. Pending RSVP */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">ยังไม่ตอบรับ</span>
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-700">{pendingCount}</div>
          <Link to="/responses" className="text-[10px] text-mcu-primary hover:underline mt-1 inline-block font-medium">
            ส่งแจ้งเตือนด่วน &rarr;
          </Link>
        </div>

        {/* 5. Pending Leave */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">ขอลารอตรวจ</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{pendingLeaveCount}</div>
          <Link to="/approvals" className="text-[10px] text-rose-600 hover:underline mt-1 inline-block font-medium">
            ตรวจสอบ &rarr;
          </Link>
        </div>

        {/* 6. Pending Delegates */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-hover transition">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium text-gray-500">ผู้แทนรอตรวจ</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingDelegateCount}</div>
          <Link to="/approvals" className="text-[10px] text-amber-600 hover:underline mt-1 inline-block font-medium">
            ตรวจสอบ &rarr;
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Meetings & RSVP Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Meetings Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  รายการการประชุมที่กำลังจะมาถึง
                </h3>
                <p className="text-xs text-gray-500">การประชุมสภาฯ และคณะกรรมการที่กำลังดำเนินการ</p>
              </div>
              <Link
                to="/meetings"
                className="text-xs font-semibold text-mcu-primary hover:text-mcu-secondary flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 overflow-x-auto">
              {upcomingMeetings.map(meet => {
                const meetInvitees = invitees.filter(i => i.meetingId === meet.id);
                const responded = meetInvitees.filter(i => i.rsvpStatus !== 'pending').length;

                return (
                  <div key={meet.id} className="py-3.5 hover:bg-gray-50/60 rounded-lg px-2 transition flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-mcu-darkPurple truncate">
                          {meet.title}
                        </span>
                        <StatusBadge status={meet.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-gray-500">
                        <span>ครั้งที่ {meet.meetingNumber}</span>
                        <span>•</span>
                        <span>{formatThaiDateShort(meet.meetingDate)} ({formatThaiTime(meet.startTime)} น.)</span>
                        <span>•</span>
                        <span className="text-mcu-primary font-medium">{meet.meetingFormat}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0 text-right">
                      <div>
                        <div className="text-xs font-semibold text-gray-900">
                          {responded} / {meetInvitees.length}
                        </div>
                        <div className="text-[10px] text-gray-400">ตอบรับแล้ว</div>
                      </div>

                      <Link
                        to={`/meetings/${meet.id}`}
                        className="p-1.5 text-gray-400 hover:text-mcu-primary hover:bg-purple-50 rounded-lg transition"
                        title="ดูรายละเอียดการประชุม"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>แสดง {upcomingMeetings.length} จากทั้งหมด {meetings.length} รายการ</span>
            <Link to="/meetings" className="text-mcu-primary hover:underline font-medium">
              จัดการรายการประชุม &rarr;
            </Link>
          </div>
        </div>

        {/* RSVP Status Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-100 shadow-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                สัดส่วนผลการตอบรับ (RSVP)
              </h3>
              <Link to="/responses" className="text-xs text-mcu-primary hover:underline font-medium">
                รายงานละเอียด
              </Link>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              จำแนกตามรูปแบบการเข้าร่วมและสถานะคำตอบ ประจำเดือน{selectedMonthThaiName}
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              {rsvpChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rsvpChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {rsvpChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} ท่าน`, 'จำนวน']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-gray-400">ยังไม่มีข้อมูลการตอบรับ</div>
              )}
            </div>

            {/* Legend list */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
              {rsvpChartData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              to="/approvals"
              className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-mcu-primary text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <span>ตรวจสอบคำขอมอบหมายผู้แทนและคำขอลา</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Notifications & Quick Tools */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Recent Notifications */}
        <div className="md:col-span-8 bg-white rounded-xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">กิจกรรมและการแจ้งเตือนล่าสุด</h3>
            <span className="text-xs text-gray-400">อัปเดตแบบเรียลไทม์</span>
          </div>

          <div className="space-y-2.5">
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} className="p-3 bg-gray-50/70 hover:bg-gray-100/70 rounded-lg transition flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-mcu-primary mt-1.5 flex-shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-semibold text-gray-900 truncate">{n.title}</h5>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatThaiDateShort(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help & System Guide */}
        <div className="md:col-span-4 bg-gradient-to-br from-purple-50/60 to-white rounded-xl border border-purple-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-mcu-primary mb-2">
              แนวปฏิบัติสำนักงานสภาฯ
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-mcu-gold font-bold">•</span>
                <span>ควรปิดรับตอบรับล่วงหน้าอย่างน้อย 3-5 วันทำการก่อนวันประชุม</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-mcu-gold font-bold">•</span>
                <span>คำขอมอบหมายผู้แทนต้องได้รับการพิจารณาและรับรองจากเลขานุการสภาฯ</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-mcu-gold font-bold">•</span>
                <span>ผู้แทนจะไม่ถูกนับเป็นองค์ประชุม เว้นแต่มีมติระบุสิทธิ์ชัดเจน</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">สถานที่มาตรฐาน:</span>
            <span className="font-semibold text-mcu-primary">ห้อง 401 มจร. วังน้อย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
