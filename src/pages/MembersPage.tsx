import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/ui/ToastNotification';
import { formatThaiDateShort, parseDate, getThaiRelativeTime } from '../utils/thaiDate';
import { Modal } from '../components/ui/Modal';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Clock
} from 'lucide-react';
import { CommitteeMember } from '../types';
import * as XLSX from 'xlsx';

export const MembersPage: React.FC = () => {
  const {
    committeeMembers,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    importCommitteeMembers
  } = useData();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Modal State for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('พระธรรม');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formRole, setFormRole] = useState('กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formHasQuorum, setFormHasQuorum] = useState(true);
  const [formHasVoting, setFormHasVoting] = useState(true);
  const [formStartDate, setFormStartDate] = useState('2025-01-01');
  const [formEndDate, setFormEndDate] = useState('2028-12-31');

  // Excel Import Preview Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreviewData, setImportedPreviewData] = useState<Partial<CommitteeMember>[]>([]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return committeeMembers.filter(m => {
      const name = `${m.profile?.title || ''}${m.profile?.firstName || ''} ${m.profile?.lastName || ''}`;
      const matchSearch =
        searchTerm === '' ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.memberCode && m.memberCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.profile?.organization && m.profile.organization.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = filterRole === 'all' || m.committeeRole === filterRole;
      return matchSearch && matchRole;
    });
  }, [committeeMembers, searchTerm, filterRole]);

  // Check if term is expiring soon (< 60 days)
  const isExpiringSoon = (endDateStr: string) => {
    const end = parseDate(endDateStr);
    if (!end) return false;
    const now = new Date();
    const diffDays = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  const isExpired = (endDateStr: string) => {
    const end = parseDate(endDateStr);
    if (!end) return false;
    return end.getTime() < new Date().getTime();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormCode(`MCU-M-00${committeeMembers.length + 1}`);
    setFormTitle('พระมหา');
    setFormFirstName('');
    setFormLastName('');
    setFormPosition('กรรมการสภาฯ');
    setFormOrg('มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย');
    setFormRole('กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ');
    setFormPhone('081-xxx-xxxx');
    setFormEmail('');
    setFormHasQuorum(true);
    setFormHasVoting(true);
    setFormStartDate('2025-01-01');
    setFormEndDate('2028-12-31');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (m: CommitteeMember) => {
    setEditingMember(m);
    setFormCode(m.memberCode);
    setFormTitle(m.profile?.title || '');
    setFormFirstName(m.profile?.firstName || '');
    setFormLastName(m.profile?.lastName || '');
    setFormPosition(m.profile?.position || '');
    setFormOrg(m.profile?.organization || '');
    setFormRole(m.committeeRole);
    setFormPhone(m.profile?.phone || '');
    setFormEmail(m.profile?.email || '');
    setFormHasQuorum(m.hasQuorumRights);
    setFormHasVoting(m.hasVotingRights);
    setFormStartDate(m.termStartDate);
    setFormEndDate(m.termEndDate);
    setIsFormModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) {
      showToast('warning', 'กรุณากรอกชื่อ-นามสกุล', 'ระบุชื่อและนามสกุลให้ครบถ้วน');
      return;
    }

    const profileData = {
      id: editingMember?.profileId || `user-${Date.now()}`,
      title: formTitle,
      firstName: formFirstName,
      lastName: formLastName,
      position: formPosition,
      organization: formOrg,
      phone: formPhone,
      email: formEmail,
      role: 'member' as const,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const memberPayload = {
      memberCode: formCode,
      committeeId: 'comm-1',
      profileId: profileData.id,
      committeeRole: formRole,
      hasQuorumRights: formHasQuorum,
      hasVotingRights: formHasVoting,
      termStartDate: formStartDate,
      termEndDate: formEndDate,
      isActive: true,
      profile: profileData
    };

    if (editingMember) {
      updateCommitteeMember(editingMember.id, memberPayload);
      showToast('success', 'แก้ไขข้อมูลกรรมการสำเร็จ', `อัปเดตข้อมูล ${formTitle}${formFirstName} แล้ว`);
    } else {
      addCommitteeMember(memberPayload);
      showToast('success', 'เพิ่มรายชื่อกรรมการสำเร็จ', `เพิ่ม ${formTitle}${formFirstName} ในฐานข้อมูลแล้ว`);
    }

    setIsFormModalOpen(false);
  };

  // Handle Excel File Upload and generate preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map data to CommitteeMember format
        const parsedMembers: Partial<CommitteeMember>[] = data.map((row: any, idx) => ({
          memberCode: row['รหัสสมาชิก'] || `MCU-IMP-${idx + 1}`,
          committeeRole: row['ประเภทกรรมการ'] || 'กรรมการสภามหาวิทยาลัย',
          hasQuorumRights: row['สิทธิ์นับองค์'] === 'ไม่มี' ? false : true,
          hasVotingRights: row['สิทธิ์ออกเสียง'] === 'ไม่มี' ? false : true,
          termStartDate: row['วันเริ่มวาระ'] || '2025-01-01',
          termEndDate: row['วันสิ้นสุดวาระ'] || '2028-12-31',
          profile: {
            id: `user-imp-${idx}`,
            title: row['คำนำหน้า'] || 'นาย',
            firstName: row['ชื่อ'] || row['ชื่อ-นามสกุล']?.split(' ')[0] || `กรรมการสมมุติ${idx + 1}`,
            lastName: row['นามสกุล'] || row['ชื่อ-นามสกุล']?.split(' ')[1] || 'มจร.',
            position: row['ตำแหน่ง'] || 'กรรมการสภาฯ',
            organization: row['ส่วนงาน'] || 'มจร.',
            phone: row['โทรศัพท์'] || '081-000-0000',
            email: row['อีเมล'] || `member${idx + 10}@mcu.ac.th`,
            role: 'member',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        }));

        setImportedPreviewData(parsedMembers);
        setIsImportModalOpen(true);
      } catch (err) {
        showToast('error', 'นำเข้าไฟล์ไม่สำเร็จ', 'รูปแบบไฟล์ Excel ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Confirm Import
  const handleConfirmImport = () => {
    importCommitteeMembers(importedPreviewData);
    setIsImportModalOpen(false);
    showToast('success', 'นำเข้ารายชื่อกรรมการสำเร็จ', `เพิ่มรายชื่อจำนวน ${importedPreviewData.length} รายการแล้ว`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const rows = filteredMembers.map(m => ({
      รหัสสมาชิก: m.memberCode,
      คำนำหน้า: m.profile?.title,
      ชื่อ: m.profile?.firstName,
      นามสกุล: m.profile?.lastName,
      ตำแหน่ง: m.profile?.position,
      ส่วนงาน: m.profile?.organization,
      ประเภทกรรมการ: m.committeeRole,
      โทรศัพท์: m.profile?.phone,
      อีเมล: m.profile?.email,
      สิทธิ์นับองค์: m.hasQuorumRights ? 'มีสิทธิ์' : 'ไม่มี',
      สิทธิ์ออกเสียง: m.hasVotingRights ? 'มีสิทธิ์' : 'ไม่มี',
      วันเริ่มวาระ: m.termStartDate,
      วันสิ้นสุดวาระ: m.termEndDate,
      สถานะใช้งาน: m.isActive ? 'ใช้งาน' : 'ระงับ'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อกรรมการ');
    XLSX.writeFile(wb, 'MCU_Council_Members.xlsx');
    showToast('success', 'ส่งออกข้อมูลสำเร็จ', 'ดาวน์โหลดไฟล์ Excel รายชื่อกรรมการเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-mcu-primary" />
            <span>ฐานข้อมูลกรรมการและสมาชิกสภาฯ</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            จัดการข้อมูลสมาชิก กำหนดสิทธิ์นับองค์ประชุม วันเริ่ม-สิ้นสุดวาระ และนำเข้า/ส่งออกข้อมูล
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden Excel File Input */}
          <input
            type="file"
            id="excel-import-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="excel-import-input"
            className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>นำเข้า Excel</span>
          </label>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-mcu-primary" />
            <span>ส่งออก Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#C8A54B]" />
            <span>เพิ่มกรรมการใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัสสมาชิก, หรือส่วนงาน..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mcu-primary"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-white outline-none"
          >
            <option value="all">ทุกประเภทกรรมการ</option>
            <option value="นายกสภามหาวิทยาลัย">นายกสภามหาวิทยาลัย</option>
            <option value="อธิการบดี (กรรมการโดยตำแหน่ง)">อธิการบดี</option>
            <option value="เลขานุการสภามหาวิทยาลัย">เลขานุการสภามหาวิทยาลัย</option>
            <option value="กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ">ผู้ทรงคุณวุฒิ</option>
            <option value="กรรมการสภามหาวิทยาลัยจากผู้บริหาร">จากผู้บริหาร</option>
          </select>
        </div>
      </div>

      {/* Member Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-3">รหัส</th>
                <th className="py-3 px-3">คำนำหน้า-ชื่อ-นามสกุล</th>
                <th className="py-3 px-3">ตำแหน่ง / ส่วนงาน</th>
                <th className="py-3 px-3">ประเภทกรรมการ</th>
                <th className="py-3 px-3 text-center">สิทธิ์องค์ฯ</th>
                <th className="py-3 px-3 text-center">สิทธิ์ออกเสียง</th>
                <th className="py-3 px-3">วาระการดำรงตำแหน่ง</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredMembers.map(m => {
                const expiring = isExpiringSoon(m.termEndDate);
                const expired = isExpired(m.termEndDate);

                return (
                  <tr key={m.id} className="hover:bg-purple-50/20 transition">
                    <td className="py-3 px-3 font-mono font-bold text-mcu-primary whitespace-nowrap">
                      {m.memberCode}
                    </td>

                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div>
                        {m.profile?.title}{m.profile?.firstName} {m.profile?.lastName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal">
                        {m.profile?.email} • {m.profile?.phone}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-gray-600">
                      <div>{m.profile?.position}</div>
                      <div className="text-[10px] text-gray-400">{m.profile?.organization}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-mcu-primary font-medium border border-purple-100">
                        {m.committeeRole}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {m.hasQuorumRights ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700" title="มีสิทธิ์นับองค์ประชุม">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400" title="ไม่มีสิทธิ์">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {m.hasVotingRights ? (
                        <span className="inline-flex p-1 rounded-full bg-blue-100 text-blue-700" title="มีสิทธิ์ออกเสียง">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400" title="ไม่มีสิทธิ์">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-gray-700">
                        ถึง {formatThaiDateShort(m.termEndDate)}
                      </div>
                      {/* Expiring Soon Alert Badge */}
                      {expiring && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>ใกล้หมดวาระ ({getThaiRelativeTime(m.termEndDate)})</span>
                        </span>
                      )}
                      {expired && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded mt-0.5">
                          <span>หมดวาระแล้ว</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-gray-500 hover:text-mcu-primary hover:bg-gray-100 rounded"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ยืนยันการลบสมาชิก: ${m.profile?.firstName}?`)) {
                              deleteCommitteeMember(m.id);
                              showToast('success', 'ลบสมาชิกสำเร็จ');
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingMember ? 'แก้ไขข้อมูลกรรมการ' : 'เพิ่มกรรมการสภามหาวิทยาลัยใหม่'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">รหัสสมาชิก</label>
              <input
                type="text"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">คำนำหน้า</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ประเภทกรรมการ</label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-300 rounded bg-white"
              >
                <option value="นายกสภามหาวิทยาลัย">นายกสภามหาวิทยาลัย</option>
                <option value="อธิการบดี (กรรมการโดยตำแหน่ง)">อธิการบดี</option>
                <option value="เลขานุการสภามหาวิทยาลัย">เลขานุการสภาฯ</option>
                <option value="กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ">กรรมการผู้ทรงคุณวุฒิ</option>
                <option value="กรรมการสภามหาวิทยาลัยจากผู้บริหาร">กรรมการจากผู้บริหาร</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={e => setFormFirstName(e.target.value)}
                placeholder="ชื่อจริง..."
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                นามสกุล / ฉายา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formLastName}
                onChange={e => setFormLastName(e.target.value)}
                placeholder="นามสกุล หรือ ฉายา..."
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ตำแหน่ง</label>
              <input
                type="text"
                value={formPosition}
                onChange={e => setFormPosition(e.target.value)}
                placeholder="เช่น คณบดี, รองอธิการบดี, ผู้ทรงคุณวุฒิ..."
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ส่วนงาน / สังกัด</label>
              <input
                type="text"
                value={formOrg}
                onChange={e => setFormOrg(e.target.value)}
                placeholder="เช่น คณะพุทธศาสตร์, วิทยาเขต..."
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">โทรศัพท์มือถือ</label>
              <input
                type="tel"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">วันเริ่มวาระ</label>
              <input
                type="date"
                value={formStartDate}
                onChange={e => setFormStartDate(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">วันสิ้นสุดวาระ</label>
              <input
                type="date"
                value={formEndDate}
                onChange={e => setFormEndDate(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formHasQuorum}
                onChange={e => setFormHasQuorum(e.target.checked)}
                className="rounded text-mcu-primary"
              />
              <span className="font-semibold text-gray-800">มีสิทธิ์นับเป็นองค์ประชุม</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formHasVoting}
                onChange={e => setFormHasVoting(e.target.checked)}
                className="rounded text-mcu-primary"
              />
              <span className="font-semibold text-gray-800">มีสิทธิ์ออกเสียงลงมติ</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4B1F5E] hover:bg-[#6B3F83] text-white font-semibold rounded-lg shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </Modal>

      {/* Excel Import Preview Modal (Mandatory requirement) */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="ตรวจสอบตัวอย่างข้อมูลนำเข้า (Excel Import Preview)"
        description="กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยันบันทึกเข้าสู่ฐานข้อมูล"
        maxWidth="4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันบันทึกข้อมูล ({importedPreviewData.length} รายการ)</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-900 border border-purple-200">
            พบข้อมูลนำเข้าจำนวน <strong>{importedPreviewData.length} รายการ</strong> กรุณาตรวจสอบรายชื่อและสิทธิ์ก่อนบันทึก
          </div>

          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="p-2.5">รหัส</th>
                  <th className="p-2.5">ชื่อ-นามสกุล</th>
                  <th className="p-2.5">ตำแหน่ง</th>
                  <th className="p-2.5">ส่วนงาน</th>
                  <th className="p-2.5">ประเภท</th>
                  <th className="p-2.5 text-center">นับองค์</th>
                  <th className="p-2.5 text-center">ออกเสียง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {importedPreviewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2.5 font-mono text-gray-700">{row.memberCode}</td>
                    <td className="p-2.5 font-semibold text-gray-900">
                      {row.profile?.title}{row.profile?.firstName} {row.profile?.lastName}
                    </td>
                    <td className="p-2.5 text-gray-600">{row.profile?.position}</td>
                    <td className="p-2.5 text-gray-600">{row.profile?.organization}</td>
                    <td className="p-2.5 text-gray-600">{row.committeeRole}</td>
                    <td className="p-2.5 text-center">
                      {row.hasQuorumRights ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      {row.hasVotingRights ? (
                        <span className="text-blue-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
