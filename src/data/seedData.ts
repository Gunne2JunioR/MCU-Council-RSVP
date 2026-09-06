import {
  UserProfile,
  Committee,
  CommitteeMember,
  Meeting,
  MeetingInvitee,
  MeetingDocument,
  SystemSettings,
  AuditLog,
  AppNotification
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  defaultVenue: 'ห้องประชุม 401 ชั้น 4 อาคารพระธรรมวชิรคุณาธาร (โกศล มหาวีโร) อาคารสำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
  invitationEmailTemplate: 'เรียน {title}{first_name} {last_name}\n\nสำนักงานสภามหาวิทยาลัย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ขอเชิญท่านเข้าร่วมการประชุม{committee_name} ครั้งที่ {meeting_number} ในวันที่ {meeting_date_th} เวลา {meeting_time} น. รูปแบบ {meeting_format}\n\nณ {venue}\n\nกรุณาตอบรับการเข้าร่วมประชุมผ่านลิงก์เฉพาะบุคคลด้านล่างนี้ ภายในวันที่ {rsvp_deadline_th}\n{rsvp_url}\n\nขอแสดงความนับถืออย่างสูง\nสำนักงานสภามหาวิทยาลัย มจร.',
  defaultQuorumRule: 'more_than_half',
  tokenExpiryDays: 14,
  allowSelfRegistration: false,
  lineNotifyEnabled: true
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin.mcu@example.com',
    title: 'นาย',
    firstName: 'สมศักดิ์',
    lastName: 'พิทักษ์ธรรม (เจ้าหน้าที่สภาฯ)',
    phone: '081-234-5678',
    organization: 'สำนักงานสภามหาวิทยาลัย',
    position: 'หัวหน้าสำนักงานสภามหาวิทยาลัย',
    role: 'super_admin',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'user-staff',
    email: 'staff.mcu@example.com',
    title: 'นางสาว',
    firstName: 'วราภรณ์',
    lastName: 'กัลยาณมิตร (เจ้าหน้าที่สภาฯ)',
    phone: '089-876-5432',
    organization: 'สำนักงานสภามหาวิทยาลัย',
    position: 'นักวิชาการสำนักงานสภาฯ',
    role: 'staff',
    isActive: true,
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: 'user-sec',
    email: 'secretary.mcu@example.com',
    title: 'รศ.ดร.',
    firstName: 'พระมหาบุญรอด',
    lastName: 'ปิยธมฺโม',
    phone: '086-555-1234',
    organization: 'สำนักงานอธิการบดี',
    position: 'รองอธิการบดีฝ่ายบริหาร / เลขานุการสภาฯ',
    role: 'secretary',
    isActive: true,
    createdAt: '2024-12-01T08:00:00Z'
  },
  {
    id: 'user-delegate',
    email: 'delegate.mcu@example.com',
    title: 'ผศ.ดร.',
    firstName: 'อภิชาต',
    lastName: 'สิริปัญโญ',
    phone: '089-444-1234',
    organization: 'คณะพุทธศาสตร์',
    position: 'รองคณบดีฝ่ายวิชาการ (ผู้แทน)',
    role: 'delegate',
    isActive: true,
    createdAt: '2025-02-01T08:00:00Z'
  },
  // --- 21 ท่าน คณะกรรมการสภามหาวิทยาลัย มจร. ---
  {
    id: 'user-chair',
    email: 'chairperson@mcu.ac.th',
    title: 'สมเด็จพระ',
    firstName: 'มหาวชิราธิบดี',
    lastName: '',
    phone: '081-999-0001',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'นายกสภามหาวิทยาลัย',
    role: 'chairperson',
    isActive: true,
    createdAt: '2024-11-01T08:00:00Z'
  },
  {
    id: 'user-m-2',
    email: 'vicechair@mcu.ac.th',
    title: 'พระพรหมบัณฑิต',
    firstName: ', ศ.ดร.',
    lastName: '',
    phone: '081-999-0002',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'อุปนายกสภามหาวิทยาลัย',
    role: 'member',
    isActive: true,
    createdAt: '2024-11-01T08:00:00Z'
  },
  {
    id: 'user-rector',
    email: 'rector@mcu.ac.th',
    title: 'พระพรหมวัชรธีราจารย์',
    firstName: ', ศ.ดร.',
    lastName: '',
    phone: '081-999-0003',
    organization: 'สำนักงานอธิการบดี',
    position: 'อธิการบดี',
    role: 'member',
    isActive: true,
    createdAt: '2024-11-01T08:00:00Z'
  },
  {
    id: 'user-m-4',
    email: 'member04@mcu.ac.th',
    title: 'สมเด็จพระ',
    firstName: 'วชิรรัตนโมลี',
    lastName: '',
    phone: '081-999-0004',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'กรรมการผู้ทรงคุณวุฒิ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-5',
    email: 'member05@mcu.ac.th',
    title: 'สมเด็จพระ',
    firstName: 'พุฒาจารย์',
    lastName: '',
    phone: '081-999-0005',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'กรรมการผู้ทรงคุณวุฒิ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-6',
    email: 'member06@mcu.ac.th',
    title: 'พระพรหม',
    firstName: 'วชิรปัญญาจารย์',
    lastName: '',
    phone: '081-999-0006',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'กรรมการผู้ทรงคุณวุฒิ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-7',
    email: 'academic.vp@mcu.ac.th',
    title: 'พระปัญญาวัชรบัณฑิต',
    firstName: ', รศ.ดร.',
    lastName: '',
    phone: '081-999-0007',
    organization: 'สำนักงานอธิการบดี',
    position: 'รองอธิการบดีฝ่ายวิชาการ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-8',
    email: 'student.vp@mcu.ac.th',
    title: 'พระราชญาณวัชิรเวที',
    firstName: ', ผศ.ดร.',
    lastName: '',
    phone: '081-999-0008',
    organization: 'สำนักงานอธิการบดี',
    position: 'รองอธิการบดีฝ่ายกิจการนิสิต',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-9',
    email: 'planning.vp@mcu.ac.th',
    title: 'พระเทพวัชรสารบัณฑิต',
    firstName: ', รศ.ดร.',
    lastName: '',
    phone: '081-999-0009',
    organization: 'สำนักงานอธิการบดี',
    position: 'รองอธิการบดีฝ่ายวางแผนและพัฒนา',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-10',
    email: 'nakhon.vp@mcu.ac.th',
    title: 'พระวัชรพุทธิบัณฑิต',
    firstName: ', รศ.ดร.',
    lastName: '',
    phone: '081-999-0010',
    organization: 'วิทยาเขตนครศรีธรรมราช',
    position: 'รองอธิการบดีวิทยาเขตนครศรีธรรมราช',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-11',
    email: 'ubon.vp@mcu.ac.th',
    title: 'พระศรีรัตโนบล',
    firstName: ', ผศ.ดร.',
    lastName: '',
    phone: '081-999-0011',
    organization: 'วิทยาเขตอุบลราชธานี',
    position: 'รองอธิการบดีวิทยาเขตอุบลราชธานี',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-12',
    email: 'chiangmai.vp@mcu.ac.th',
    title: 'พระสุธีวัชรบัณฑิต',
    firstName: ', ผศ.ดร.',
    lastName: '',
    phone: '081-999-0012',
    organization: 'วิทยาเขตเชียงใหม่',
    position: 'รองอธิการบดีวิทยาเขตเชียงใหม่',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-13',
    email: 'grad.dean@mcu.ac.th',
    title: 'พระราชสุทธิวัชรสุธี',
    firstName: ', รศ.ดร.',
    lastName: '',
    phone: '081-999-0013',
    organization: 'บัณฑิตวิทยาลัย มจร.',
    position: 'คณบดีบัณฑิตวิทยาลัย',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-14',
    email: 'wannee@mhesi.go.th',
    title: 'นาย',
    firstName: 'วันนี',
    lastName: 'นนท์ศิริ',
    phone: '081-888-0014',
    organization: 'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม',
    position: 'หัวหน้าผู้ตรวจราชการกระทรวง อว.',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-15',
    email: 'prachayawan@moe.go.th',
    title: 'นางสาว',
    firstName: 'ปรัชญวรรณ',
    lastName: 'วนานันท์',
    phone: '081-888-0015',
    organization: 'กระทรวงศึกษาธิการ',
    position: 'ที่ปรึกษาด้านระบบบริหารจัดการศึกษา',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-16',
    email: 'waraporn.t@ocsc.go.th',
    title: 'นางสาว',
    firstName: 'วราภรณ์',
    lastName: 'ตั้งตระกูล',
    phone: '081-888-0016',
    organization: 'สำนักงานคณะกรรมการข้าราชการพลเรือน (ก.พ.)',
    position: 'รองเลขาธิการ ก.พ.',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-17',
    email: 'pareena@onab.go.th',
    title: 'ผศ.',
    firstName: 'ปารีณา',
    lastName: 'ศรีวนิชย์',
    phone: '081-888-0017',
    organization: 'สำนักงานพระพุทธศาสนาแห่งชาติ',
    position: 'ที่ปรึกษาด้านวิจัยและพัฒนาวิชาการพระพุทธศาสนา',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-18',
    email: 'ampa.p@onec.go.th',
    title: 'นาง',
    firstName: 'อำภา',
    lastName: 'พรหมวาทย์',
    phone: '081-888-0018',
    organization: 'สำนักงานเลขาธิการสภาการศึกษา',
    position: 'ที่ปรึกษาด้านนโยบายและแผนการศึกษา',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-19',
    email: 'pattarapong@bb.go.th',
    title: 'นาย',
    firstName: 'ภัทรพงศ์',
    lastName: 'พุ่มผลึก',
    phone: '081-888-0019',
    organization: 'สำนักงบประมาณ',
    position: 'ผอ.กองจัดทำงบประมาณด้านสังคม แทน ผอ.สำนักงบประมาณ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-20',
    email: 'jamnong@mcu.ac.th',
    title: 'ศาสตราจารย์พิเศษ',
    firstName: 'จำนงค์',
    lastName: 'ทองประเสริฐ',
    phone: '081-888-0020',
    organization: 'สภามหาวิทยาลัย มจร.',
    position: 'กรรมการผู้ทรงคุณวุฒิ',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-m-21',
    email: 'kritsada@mcu.ac.th',
    title: 'ดร.',
    firstName: 'กฤษฎา',
    lastName: 'ดิษบรรจง',
    phone: '081-888-0021',
    organization: 'สำนักงานอธิการบดี มจร.',
    position: 'ที่ปรึกษาอธิการบดีด้านกฎหมาย',
    role: 'member',
    isActive: true,
    createdAt: '2025-01-01T08:00:00Z'
  }
];

export const INITIAL_COMMITTEES: Committee[] = [
  {
    id: 'comm-1',
    code: 'MCU-COUNCIL',
    nameTh: 'สภามหาวิทยาลัย',
    nameEn: 'MCU University Council',
    description: 'คณะกรรมการสภามหาวิทยาลัย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    defaultQuorumRule: 'more_than_half',
    isActive: true
  },
  {
    id: 'comm-2',
    code: 'MCU-ADMIN',
    nameTh: 'คณะกรรมการบริหารมหาวิทยาลัย',
    nameEn: 'University Administrative Committee',
    description: 'คณะกรรมการบริหารมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (ก.บ.ม.)',
    defaultQuorumRule: 'more_than_half',
    isActive: true
  }
];

export const INITIAL_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    id: 'cm-1',
    committeeId: 'comm-1',
    profileId: 'user-chair',
    memberCode: 'MCU-M-001',
    committeeRole: 'นายกสภามหาวิทยาลัย',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-chair')
  },
  {
    id: 'cm-2',
    committeeId: 'comm-1',
    profileId: 'user-m-2',
    memberCode: 'MCU-M-002',
    committeeRole: 'อุปนายกสภามหาวิทยาลัย',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-2')
  },
  {
    id: 'cm-3',
    committeeId: 'comm-1',
    profileId: 'user-rector',
    memberCode: 'MCU-M-003',
    committeeRole: 'อธิการบดี (กรรมการโดยตำแหน่ง)',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-rector')
  },
  {
    id: 'cm-4',
    committeeId: 'comm-1',
    profileId: 'user-m-4',
    memberCode: 'MCU-M-004',
    committeeRole: 'กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-4')
  },
  {
    id: 'cm-5',
    committeeId: 'comm-1',
    profileId: 'user-m-5',
    memberCode: 'MCU-M-005',
    committeeRole: 'กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-5')
  },
  {
    id: 'cm-6',
    committeeId: 'comm-1',
    profileId: 'user-m-6',
    memberCode: 'MCU-M-006',
    committeeRole: 'กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-6')
  },
  {
    id: 'cm-7',
    committeeId: 'comm-1',
    profileId: 'user-m-7',
    memberCode: 'MCU-M-007',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-7')
  },
  {
    id: 'cm-8',
    committeeId: 'comm-1',
    profileId: 'user-m-8',
    memberCode: 'MCU-M-008',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-8')
  },
  {
    id: 'cm-9',
    committeeId: 'comm-1',
    profileId: 'user-m-9',
    memberCode: 'MCU-M-009',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2026-10-31', // ใกล้หมดวาระเพื่อทดสอบแจ้งเตือน
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-9')
  },
  {
    id: 'cm-10',
    committeeId: 'comm-1',
    profileId: 'user-m-10',
    memberCode: 'MCU-M-010',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-10')
  },
  {
    id: 'cm-11',
    committeeId: 'comm-1',
    profileId: 'user-m-11',
    memberCode: 'MCU-M-011',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-11')
  },
  {
    id: 'cm-12',
    committeeId: 'comm-1',
    profileId: 'user-m-12',
    memberCode: 'MCU-M-012',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-12')
  },
  {
    id: 'cm-13',
    committeeId: 'comm-1',
    profileId: 'user-m-13',
    memberCode: 'MCU-M-013',
    committeeRole: 'กรรมการสภามหาวิทยาลัยจากผู้บริหาร',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-06-01',
    termEndDate: '2027-05-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-13')
  },
  {
    id: 'cm-14',
    committeeId: 'comm-1',
    profileId: 'user-m-14',
    memberCode: 'MCU-M-014',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-14')
  },
  {
    id: 'cm-15',
    committeeId: 'comm-1',
    profileId: 'user-m-15',
    memberCode: 'MCU-M-015',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-15')
  },
  {
    id: 'cm-16',
    committeeId: 'comm-1',
    profileId: 'user-m-16',
    memberCode: 'MCU-M-016',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-16')
  },
  {
    id: 'cm-17',
    committeeId: 'comm-1',
    profileId: 'user-m-17',
    memberCode: 'MCU-M-017',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-17')
  },
  {
    id: 'cm-18',
    committeeId: 'comm-1',
    profileId: 'user-m-18',
    memberCode: 'MCU-M-018',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-18')
  },
  {
    id: 'cm-19',
    committeeId: 'comm-1',
    profileId: 'user-m-19',
    memberCode: 'MCU-M-019',
    committeeRole: 'กรรมการสภามหาวิทยาลัยโดยตำแหน่ง',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2024-01-01',
    termEndDate: '2027-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-19')
  },
  {
    id: 'cm-20',
    committeeId: 'comm-1',
    profileId: 'user-m-20',
    memberCode: 'MCU-M-020',
    committeeRole: 'กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-20')
  },
  {
    id: 'cm-21',
    committeeId: 'comm-1',
    profileId: 'user-m-21',
    memberCode: 'MCU-M-021',
    committeeRole: 'กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ',
    hasQuorumRights: true,
    hasVotingRights: true,
    termStartDate: '2025-01-01',
    termEndDate: '2028-12-31',
    isActive: true,
    profile: INITIAL_USERS.find(u => u.id === 'user-m-21')
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    committeeId: 'comm-1',
    committeeName: 'สภามหาวิทยาลัย',
    title: 'การประชุมสภามหาวิทยาลัย ครั้งที่ 8/2569',
    meetingNumber: '8/2569',
    beYear: 2569,
    meetingType: 'regular',
    meetingFormat: 'Hybrid',
    meetingDate: '2026-08-26',
    startTime: '09:30',
    endTime: '16:30',
    rsvpOpenAt: '2026-08-10T08:00:00Z',
    rsvpDeadline: '2026-08-24T17:00:00Z',
    venue: 'ห้องประชุม 401 ชั้น 4 อาคารพระธรรมวชิรคุณาธาร (โกศล มหาวีโร) มจร. วังน้อย',
    onlinePlatform: 'Zoom Meetings',
    onlineUrl: 'https://zoom.us/j/mcu2569council8',
    onlineMeetingId: '824 5569 8812',
    onlinePasscode: 'MCU2569',
    onlineInstructions: 'กรุณาเข้าห้องประชุมก่อนเวลา 15 นาที และตั้งชื่อผู้ใช้เป็น ชื่อ-นามสกุลจริง',
    status: 'rsvp_open',
    description: 'พิจารณารับรองรายงานการประชุมครั้งที่ 7/2569 และการขออนุมัติหลักสูตรปรับปรุงใหม่ประจำปีการศึกษา 2569',
    invitationTemplate: 'ขออาราธนา/เรียนเชิญ ประชุมสภามหาวิทยาลัย มจร. ครั้งที่ 8/2569',
    notificationChannels: ['email', 'link'],
    createdBy: 'user-staff',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z'
  },
  {
    id: 'meet-2',
    committeeId: 'comm-1',
    committeeName: 'สภามหาวิทยาลัย',
    title: 'การประชุมสภามหาวิทยาลัย ครั้งที่ 9/2569',
    meetingNumber: '9/2569',
    beYear: 2569,
    meetingType: 'regular',
    meetingFormat: 'Hybrid',
    meetingDate: '2026-09-24',
    startTime: '09:30',
    endTime: '16:00',
    rsvpOpenAt: '2026-09-01T08:00:00Z',
    rsvpDeadline: '2026-09-20T17:00:00Z',
    venue: 'ห้องประชุม 401 ชั้น 4 อาคารพระธรรมวชิรคุณาธาร (โกศล มหาวีโร) มจร. วังน้อย',
    onlinePlatform: 'Zoom Meetings',
    onlineUrl: 'https://zoom.us/j/mcu2569council9',
    onlineMeetingId: '915 3344 7788',
    onlinePasscode: 'MCU2569',
    onlineInstructions: 'กรุณาเข้าห้องประชุมก่อนเวลา 15 นาที และตั้งชื่อผู้ใช้เป็น ชื่อ-นามสกุลจริง',
    status: 'rsvp_open',
    description: 'การประชุมสภามหาวิทยาลัยประจำเดือนกันยายน 2569 พิจารณางบประมาณรายจ่ายและแผนยุทธศาสตร์',
    invitationTemplate: 'ขออาราธนา/เรียนเชิญ ประชุมสภามหาวิทยาลัย มจร. ครั้งที่ 9/2569',
    notificationChannels: ['email', 'link'],
    createdBy: 'user-staff',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

export const INITIAL_DOCUMENTS: MeetingDocument[] = [
  {
    id: 'doc-1',
    meetingId: 'meet-1',
    docType: 'invitation',
    title: 'หนังสือนิมนต์/เชิญประชุมสภามหาวิทยาลัย ครั้งที่ 8/2569',
    fileUrl: '/sample-docs/invitation-8-2569.pdf',
    fileName: 'หนังสือเชิญ_สภา_8-2569.pdf',
    fileSize: 450210,
    uploadedBy: 'user-staff',
    createdAt: '2026-08-10T08:30:00Z'
  },
  {
    id: 'doc-2',
    meetingId: 'meet-1',
    docType: 'agenda',
    title: 'ระเบียบวาระการประชุมสภามหาวิทยาลัย ครั้งที่ 8/2569',
    fileUrl: '/sample-docs/agenda-8-2569.pdf',
    fileName: 'ระเบียบวาระ_สภา_8-2569.pdf',
    fileSize: 1250400,
    uploadedBy: 'user-staff',
    createdAt: '2026-08-10T08:35:00Z'
  }
];

// 21 Invitees for Meeting 8/2569 matching the official document status
export const INITIAL_INVITEES: MeetingInvitee[] = [
  {
    id: 'inv-1', meetingId: 'meet-1', profileId: 'user-chair',
    title: 'สมเด็จพระ', firstName: 'มหาวชิราธิบดี', lastName: '',
    email: 'chairperson@mcu.ac.th', phone: '081-999-0001',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'นายกสภามหาวิทยาลัย',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_001', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'leave',
    leaveRequest: {
      id: 'leave-1', meetingInviteeId: 'inv-1', leaveType: 'leave',
      reason: 'ติดศาสนกิจสำคัญ', status: 'approved',
      reviewedBy: 'user-sec', reviewedAt: '2026-08-13T09:00:00Z',
      reviewNotes: 'รับทราบการลาและบันทึกลงสารบรรณ',
      createdAt: '2026-08-12T10:00:00Z', updatedAt: '2026-08-13T09:00:00Z'
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-12T10:00:00Z'
  },
  {
    id: 'inv-2', meetingId: 'meet-1', profileId: 'user-m-2',
    title: 'พระพรหมบัณฑิต', firstName: ', ศ.ดร.', lastName: '',
    email: 'vicechair@mcu.ac.th', phone: '081-999-0002',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'อุปนายกสภามหาวิทยาลัย',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_002', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-2', meetingInviteeId: 'inv-2', status: 'attend',
      attendanceFormat: 'Online', reason: 'ปฏิบัติศาสนกิจและเข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_002:inv-2', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-11T14:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-11T14:00:00Z'
  },
  {
    id: 'inv-3', meetingId: 'meet-1', profileId: 'user-rector',
    title: 'พระพรหมวัชรธีราจารย์', firstName: ', ศ.ดร.', lastName: '',
    email: 'rector@mcu.ac.th', phone: '081-999-0003',
    organization: 'สำนักงานอธิการบดี', position: 'อธิการบดี',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_003', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-3', meetingInviteeId: 'inv-3', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง ๔๐๕',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_003:inv-3', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-11T09:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-11T09:00:00Z'
  },
  {
    id: 'inv-4', meetingId: 'meet-1', profileId: 'user-m-4',
    title: 'สมเด็จพระ', firstName: 'วชิรรัตนโมลี', lastName: '',
    email: 'member04@mcu.ac.th', phone: '081-999-0004',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'กรรมการผู้ทรงคุณวุฒิ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_004', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'leave',
    leaveRequest: {
      id: 'leave-4', meetingInviteeId: 'inv-4', leaveType: 'leave',
      reason: 'ติดศาสนกิจคณะสงฆ์', status: 'approved',
      reviewedBy: 'user-sec', reviewedAt: '2026-08-16T10:00:00Z',
      reviewNotes: 'อนุมัติการลา',
      createdAt: '2026-08-15T11:00:00Z', updatedAt: '2026-08-16T10:00:00Z'
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'inv-5', meetingId: 'meet-1', profileId: 'user-m-5',
    title: 'สมเด็จพระ', firstName: 'พุฒาจารย์', lastName: '',
    email: 'member05@mcu.ac.th', phone: '081-999-0005',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'กรรมการผู้ทรงคุณวุฒิ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_005', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'leave',
    leaveRequest: {
      id: 'leave-5', meetingInviteeId: 'inv-5', leaveType: 'leave',
      reason: 'มีศาสนกิจสำคัญ', status: 'approved',
      reviewedBy: 'user-sec', reviewedAt: '2026-08-15T10:00:00Z',
      reviewNotes: 'อนุมัติการลา',
      createdAt: '2026-08-14T09:00:00Z', updatedAt: '2026-08-15T10:00:00Z'
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-14T09:00:00Z'
  },
  {
    id: 'inv-6', meetingId: 'meet-1', profileId: 'user-m-6',
    title: 'พระพรหม', firstName: 'วชิรปัญญาจารย์', lastName: '',
    email: 'member06@mcu.ac.th', phone: '081-999-0006',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'กรรมการผู้ทรงคุณวุฒิ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_006', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-6', meetingInviteeId: 'inv-6', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าประชุมระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_006:inv-6', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-12T13:30:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-12T13:30:00Z'
  },
  {
    id: 'inv-7', meetingId: 'meet-1', profileId: 'user-m-7',
    title: 'พระปัญญาวัชรบัณฑิต', firstName: ', รศ.ดร.', lastName: '',
    email: 'academic.vp@mcu.ac.th', phone: '081-999-0007',
    organization: 'สำนักงานอธิการบดี', position: 'รองอธิการบดีฝ่ายวิชาการ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_007', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-7', meetingInviteeId: 'inv-7', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง ๔๐๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_007:inv-7', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-11T10:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-11T10:00:00Z'
  },
  {
    id: 'inv-8', meetingId: 'meet-1', profileId: 'user-m-8',
    title: 'พระราชญาณวัชิรเวที', firstName: ', ผศ.ดร.', lastName: '',
    email: 'student.vp@mcu.ac.th', phone: '081-999-0008',
    organization: 'สำนักงานอธิการบดี', position: 'รองอธิการบดีฝ่ายกิจการนิสิต',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_008', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-8', meetingInviteeId: 'inv-8', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง ๔๐๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_008:inv-8', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-11T11:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-11T11:00:00Z'
  },
  {
    id: 'inv-9', meetingId: 'meet-1', profileId: 'user-m-9',
    title: 'พระเทพวัชรสารบัณฑิต', firstName: ', รศ.ดร.', lastName: '',
    email: 'planning.vp@mcu.ac.th', phone: '081-999-0009',
    organization: 'สำนักงานอธิการบดี', position: 'รองอธิการบดีฝ่ายวางแผนและพัฒนา',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_009', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-9', meetingInviteeId: 'inv-9', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง 40๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_009:inv-9', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-12T09:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-12T09:00:00Z'
  },
  {
    id: 'inv-10', meetingId: 'meet-1', profileId: 'user-m-10',
    title: 'พระวัชรพุทธิบัณฑิต', firstName: ', รศ.ดร.', lastName: '',
    email: 'nakhon.vp@mcu.ac.th', phone: '081-999-0010',
    organization: 'วิทยาเขตนครศรีธรรมราช', position: 'รองอธิการบดีวิทยาเขตนครศรีธรรมราช',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_010', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-10', meetingInviteeId: 'inv-10', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง ๔๐๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_010:inv-10', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-13T10:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-13T10:00:00Z'
  },
  {
    id: 'inv-11', meetingId: 'meet-1', profileId: 'user-m-11',
    title: 'พระศรีรัตโนบล', firstName: ', ผศ.ดร.', lastName: '',
    email: 'ubon.vp@mcu.ac.th', phone: '081-999-0011',
    organization: 'วิทยาเขตอุบลราชธานี', position: 'รองอธิการบดีวิทยาเขตอุบลราชธานี',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_011', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-11', meetingInviteeId: 'inv-11', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านออนไลน์จากอุบลราชธานี',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_011:inv-11', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-12T16:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-12T16:00:00Z'
  },
  {
    id: 'inv-12', meetingId: 'meet-1', profileId: 'user-m-12',
    title: 'พระสุธีวัชรบัณฑิต', firstName: ', ผศ.ดร.', lastName: '',
    email: 'chiangmai.vp@mcu.ac.th', phone: '081-999-0012',
    organization: 'วิทยาเขตเชียงใหม่', position: 'รองอธิการบดีวิทยาเขตเชียงใหม่',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_012', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-12', meetingInviteeId: 'inv-12', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เดินทางมาเข้าประชุม ณ ห้อง ๔๐๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_012:inv-12', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-13T09:30:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-13T09:30:00Z'
  },
  {
    id: 'inv-13', meetingId: 'meet-1', profileId: 'user-m-13',
    title: 'พระราชสุทธิวัชรสุธี', firstName: ', รศ.ดร.', lastName: '',
    email: 'grad.dean@mcu.ac.th', phone: '081-999-0013',
    organization: 'บัณฑิตวิทยาลัย มจร.', position: 'คณบดีบัณฑิตวิทยาลัย',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_013', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-13', meetingInviteeId: 'inv-13', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง ๔๐๑',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_013:inv-13', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-12T11:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-12T11:00:00Z'
  },
  {
    id: 'inv-14', meetingId: 'meet-1', profileId: 'user-m-14',
    title: 'นาย', firstName: 'วันนี', lastName: 'นนท์ศิริ',
    email: 'wannee@mhesi.go.th', phone: '081-888-0014',
    organization: 'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม', position: 'หัวหน้าผู้ตรวจราชการกระทรวง อว.',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_014', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-14', meetingInviteeId: 'inv-14', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_014:inv-14', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-14T10:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-14T10:00:00Z'
  },
  {
    id: 'inv-15', meetingId: 'meet-1', profileId: 'user-m-15',
    title: 'นางสาว', firstName: 'ปรัชญวรรณ', lastName: 'วนานันท์',
    email: 'prachayawan@moe.go.th', phone: '081-888-0015',
    organization: 'กระทรวงศึกษาธิการ', position: 'ที่ปรึกษาด้านระบบบริหารจัดการศึกษา',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_015', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-15', meetingInviteeId: 'inv-15', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_015:inv-15', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-15T09:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'inv-16', meetingId: 'meet-1', profileId: 'user-m-16',
    title: 'นางสาว', firstName: 'วราภรณ์', lastName: 'ตั้งตระกูล',
    email: 'waraporn.t@ocsc.go.th', phone: '081-888-0016',
    organization: 'สำนักงานคณะกรรมการข้าราชการพลเรือน (ก.พ.)', position: 'รองเลขาธิการ ก.พ.',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_016', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-16', meetingInviteeId: 'inv-16', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_016:inv-16', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-15T11:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'inv-17', meetingId: 'meet-1', profileId: 'user-m-17',
    title: 'ผศ.', firstName: 'ปารีณา', lastName: 'ศรีวนิชย์',
    email: 'pareena@onab.go.th', phone: '081-888-0017',
    organization: 'สำนักงานพระพุทธศาสนาแห่งชาติ', position: 'ที่ปรึกษาด้านวิจัยและพัฒนาวิชาการพระพุทธศาสนา',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_017', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-17', meetingInviteeId: 'inv-17', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_017:inv-17', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-16T14:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-16T14:00:00Z'
  },
  {
    id: 'inv-18', meetingId: 'meet-1', profileId: 'user-m-18',
    title: 'นาง', firstName: 'อำภา', lastName: 'พรหมวาทย์',
    email: 'ampa.p@onec.go.th', phone: '081-888-0018',
    organization: 'สำนักงานเลขาธิการสภาการศึกษา', position: 'ที่ปรึกษาด้านนโยบายและแผนการศึกษา',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_018', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-18', meetingInviteeId: 'inv-18', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_018:inv-18', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-16T15:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-16T15:00:00Z'
  },
  {
    id: 'inv-19', meetingId: 'meet-1', profileId: 'user-m-19',
    title: 'นาย', firstName: 'ภัทรพงศ์', lastName: 'พุ่มผลึก',
    email: 'pattarapong@bb.go.th', phone: '081-888-0019',
    organization: 'สำนักงบประมาณ', position: 'ผอ.กองจัดทำงบประมาณด้านสังคม แทน ผอ.สำนักงบประมาณ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_019', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-19', meetingInviteeId: 'inv-19', status: 'attend',
      attendanceFormat: 'Online', reason: 'เข้าร่วมผ่านระบบออนไลน์',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_019:inv-19', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-17T09:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-17T09:00:00Z'
  },
  {
    id: 'inv-20', meetingId: 'meet-1', profileId: 'user-m-20',
    title: 'ศาสตราจารย์พิเศษ', firstName: 'จำนงค์', lastName: 'ทองประเสริฐ',
    email: 'jamnong@mcu.ac.th', phone: '081-888-0020',
    organization: 'สภามหาวิทยาลัย มจร.', position: 'กรรมการผู้ทรงคุณวุฒิ',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_020', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'leave',
    leaveRequest: {
      id: 'leave-20', meetingInviteeId: 'inv-20', leaveType: 'leave',
      reason: 'สุขภาพไม่เอื้ออำนวย', status: 'approved',
      reviewedBy: 'user-sec', reviewedAt: '2026-08-17T11:00:00Z',
      reviewNotes: 'อนุมัติการลา',
      createdAt: '2026-08-16T10:00:00Z', updatedAt: '2026-08-17T11:00:00Z'
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-16T10:00:00Z'
  },
  {
    id: 'inv-21', meetingId: 'meet-1', profileId: 'user-m-21',
    title: 'ดร.', firstName: 'กฤษฎา', lastName: 'ดิษบรรจง',
    email: 'kritsada@mcu.ac.th', phone: '081-888-0021',
    organization: 'สำนักงานอธิการบดี มจร.', position: 'ที่ปรึกษาอธิการบดีด้านกฎหมาย',
    inviteeType: 'member', hasQuorumRights: true, hasVotingRights: true,
    personalToken: 'tok_mcu_021', tokenExpiresAt: '2026-08-26T23:59:59Z',
    isTokenRevoked: false, invitationSentAt: '2026-08-10T09:00:00Z',
    rsvpStatus: 'attend',
    response: {
      id: 'resp-21', meetingInviteeId: 'inv-21', status: 'attend',
      attendanceFormat: 'Onsite', reason: 'เข้าประชุม ณ ห้อง 401',
      checkinQrCodeRef: 'MCU-RSVP:tok_mcu_021:inv-21', isAcknowledgedPdpa: true,
      submittedAt: '2026-08-15T09:00:00Z', isDraft: false
    },
    createdAt: '2026-08-10T08:00:00Z', updatedAt: '2026-08-15T09:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    action: 'สร้างการประชุม',
    entityType: 'meetings',
    entityId: 'meet-1',
    userId: 'user-staff',
    userName: 'นางสาววราภรณ์ กัลยาณมิตร',
    userRole: 'staff',
    details: 'สร้างการประชุมสภามหาวิทยาลัย ครั้งที่ 8/2569 รูปแบบ Hybrid',
    ipAddress: '192.168.1.105',
    timestamp: '2026-08-10T08:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    recipientId: 'user-chair',
    meetingId: 'meet-1',
    title: 'หนังสือนิมนต์ประชุมสภามหาวิทยาลัย ครั้งที่ 8/2569',
    message: 'สำนักงานสภามหาวิทยาลัย ขอนิมนต์เข้าร่วมการประชุมในวันที่ 26 สิงหาคม 2569 เวลา 09:30 น. ณ ห้อง 401 มจร. วังน้อย',
    type: 'meeting_invitation',
    linkUrl: '/rsvp/tok_mcu_001',
    isRead: false,
    createdAt: '2026-08-10T09:00:00Z'
  }
];
