-- ==============================================================================
-- MCU Council RSVP: ระบบตอบรับเข้าร่วมประชุมสภามหาวิทยาลัย มจร.
-- PostgreSQL & Supabase Database Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PROFILES (USER ACCOUNTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(50), -- พระธรรมวชิรคุณาธาร, ศาสตราจารย์พิเศษ, รศ.ดร., นาย, นาง
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255), -- ส่วนงาน/คณะ/หน่วยงาน
    position VARCHAR(255), -- ตำแหน่ง เช่น กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ
    avatar_url TEXT,
    role_id VARCHAR(50) REFERENCES roles(id) DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. COMMITTEES (คณะกรรมการ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    default_quorum_rule VARCHAR(50) DEFAULT 'more_than_half', -- more_than_half, not_less_than_half, custom_count, chairperson_required
    default_quorum_custom_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. COMMITTEE MEMBERS (สมาชิกในคณะกรรมการ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS committee_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_code VARCHAR(50),
    committee_role VARCHAR(100) NOT NULL, -- นายกสภา, อธิการบดี, กรรมการสภาฯ ผู้ทรงคุณวุฒิ, เลขานุการ
    has_quorum_rights BOOLEAN DEFAULT TRUE,
    has_voting_rights BOOLEAN DEFAULT TRUE,
    term_start_date DATE,
    term_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(committee_id, profile_id)
);

-- ------------------------------------------------------------------------------
-- 5. MEETINGS (การประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id UUID REFERENCES committees(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    meeting_number VARCHAR(50) NOT NULL, -- เช่น "1/2569", "8/2569"
    be_year INT NOT NULL, -- 2569
    meeting_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- regular (ปกติ), special (วาระพิเศษ), urgent (วาระเร่งด่วน)
    meeting_format VARCHAR(50) NOT NULL DEFAULT 'Hybrid', -- Onsite, Online, Hybrid
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    rsvp_open_at TIMESTAMPTZ NOT NULL,
    rsvp_deadline TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL DEFAULT 'ห้องประชุม 401 ชั้น 4 อาคารพระธรรมวชิรคุณาธาร (โกศล มหาวีโร) อาคารสำนักงานอธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
    online_platform VARCHAR(100), -- Zoom, Google Meet, Microsoft Teams, Webex
    online_url TEXT,
    online_meeting_id VARCHAR(100),
    online_passcode VARCHAR(100),
    online_instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, rsvp_open, rsvp_closed, in_progress, completed, cancelled
    description TEXT,
    invitation_template TEXT,
    notification_channels JSONB DEFAULT '["email", "link"]'::jsonb,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. MEETING DOCUMENTS (เอกสารประกอบการประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meeting_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- invitation, agenda, minute, appendix, other
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    is_confidential BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. MEETING INVITEES (ผู้ได้รับเชิญเข้าประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meeting_invitees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- External or manual invitee details if profile_id is NULL
    title VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    organization VARCHAR(255),
    position VARCHAR(255),
    invitee_type VARCHAR(50) NOT NULL DEFAULT 'member', -- member, attendee, presenter, observer
    has_quorum_rights BOOLEAN DEFAULT TRUE,
    has_voting_rights BOOLEAN DEFAULT TRUE,
    personal_token VARCHAR(100) UNIQUE NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    is_token_revoked BOOLEAN DEFAULT FALSE,
    invitation_sent_at TIMESTAMPTZ,
    last_reminded_at TIMESTAMPTZ,
    rsvp_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, attend, leave, cannot_attend, delegate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. RSVP RESPONSES (ข้อมูลการตอบรับ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_invitee_id UUID UNIQUE REFERENCES meeting_invitees(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- attend, leave, cannot_attend, delegate
    attendance_format VARCHAR(50), -- Onsite, Online
    updated_phone VARCHAR(50),
    updated_email VARCHAR(255),
    reason TEXT,
    dietary_preferences VARCHAR(100),
    checkin_qr_code_ref VARCHAR(100) UNIQUE,
    is_acknowledged_pdpa BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    is_draft BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. DELEGATE REQUESTS (คำขอมอบหมายผู้แทน)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delegate_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_invitee_id UUID REFERENCES meeting_invitees(id) ON DELETE CASCADE,
    delegate_title VARCHAR(50),
    delegate_name VARCHAR(255) NOT NULL,
    delegate_position VARCHAR(255) NOT NULL,
    delegate_organization VARCHAR(255) NOT NULL,
    delegate_phone VARCHAR(50) NOT NULL,
    delegate_email VARCHAR(255) NOT NULL,
    attendance_format VARCHAR(50) NOT NULL, -- Onsite, Online
    reason TEXT NOT NULL,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, info_requested
    review_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    can_count_as_quorum BOOLEAN DEFAULT FALSE, -- สำคัญ: ห้ามนับอัตโนมัติ ต้องกำหนดสิทธิ์
    can_vote BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. LEAVE REQUESTS (คำขอลาประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_invitee_id UUID REFERENCES meeting_invitees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'leave', -- leave (ลา), cannot_attend (ไม่สามารถเข้าร่วม)
    reason TEXT NOT NULL,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, acknowledged, rejected, info_requested
    review_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. ATTENDANCE LOGS (การเช็กชื่อจริงวันประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    meeting_invitee_id UUID REFERENCES meeting_invitees(id) ON DELETE CASCADE,
    actual_format VARCHAR(50) NOT NULL, -- Onsite, Online
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    check_in_method VARCHAR(50) NOT NULL DEFAULT 'staff_manual', -- qr_code, staff_manual, online_link
    is_delegate BOOLEAN DEFAULT FALSE,
    delegate_request_id UUID REFERENCES delegate_requests(id),
    counts_for_quorum BOOLEAN DEFAULT TRUE,
    notes TEXT, -- มาสาย, ออกก่อน, ผู้แทน
    checked_in_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. QUORUM RULES & CRITERIA (เกณฑ์องค์ประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quorum_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL DEFAULT 'more_than_half', -- more_than_half (>1/2), not_less_than_half (>=1/2), custom_count, chairperson_required
    custom_count INT,
    requires_chairperson BOOLEAN DEFAULT TRUE,
    allow_delegate_quorum BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. QUORUM LOGS (ประวัติการตรวจสอบและการรับรององค์ประชุม)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quorum_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_eligible_members INT NOT NULL,
    minimum_required INT NOT NULL,
    current_attended INT NOT NULL,
    onsite_count INT NOT NULL,
    online_count INT NOT NULL,
    leave_count INT NOT NULL,
    is_quorum_reached BOOLEAN NOT NULL,
    certified_by UUID REFERENCES profiles(id),
    certified_at TIMESTAMPTZ,
    certification_status VARCHAR(50) DEFAULT 'unverified', -- unverified, certified, adjourned
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. NOTIFICATIONS (การแจ้งเตือนในระบบ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- meeting_invitation, rsvp_reminder, review_approved, review_rejected, quorum_certified
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. NOTIFICATION LOGS (ประวัติการส่งออกภายนอก Email / LINE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    channel VARCHAR(50) NOT NULL, -- email, line, sms, token_link
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'sent', -- queued, sent, failed
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. AUDIT LOGS (ประวัติการดำเนินการและการเปลี่ยนแปลงข้อมูล)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create_meeting, update_rsvp, review_delegate, check_in, certify_quorum
    entity_type VARCHAR(100) NOT NULL, -- meetings, rsvp_responses, delegate_requests, attendance_logs
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. SYSTEM SETTINGS (การตั้งค่าระบบ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR QUERY OPTIMIZATION
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_meetings_committee ON meetings(committee_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_invitees_meeting ON meeting_invitees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_invitees_token ON meeting_invitees(personal_token);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance_logs(meeting_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quorum_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Policies
-- Members can view their own profile and edit contact details
CREATE POLICY "Users can view self profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Staff and Admins can view all meetings
CREATE POLICY "Staff and admin can view all meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id IN ('super_admin', 'staff', 'secretary', 'chairperson')
        )
    );

-- Members can view meetings they are invited to
CREATE POLICY "Members view invited meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meeting_invitees
            WHERE meeting_invitees.meeting_id = meetings.id
            AND meeting_invitees.profile_id = auth.uid()
        )
    );
