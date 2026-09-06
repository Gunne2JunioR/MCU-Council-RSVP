import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/ToastNotification';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingListPage } from './pages/MeetingListPage';
import { MeetingFormPage } from './pages/MeetingFormPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { RSVPPage } from './pages/RSVPPage';
import { ResponsesPage } from './pages/ResponsesPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { MembersPage } from './pages/MembersPage';
import { AttendancePage } from './pages/AttendancePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MyMeetingsPage } from './pages/MyMeetingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { InviteesPage } from './pages/InviteesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <Routes>
              {/* Standalone Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rsvp" element={<RSVPPage />} />
              <Route path="/rsvp/:token" element={<RSVPPage />} />

              {/* Main Layout Pages */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/meetings" element={<MeetingListPage />} />
                <Route path="/meetings/create" element={<MeetingFormPage />} />
                <Route path="/meetings/:id" element={<MeetingDetailPage />} />
                <Route path="/meetings/:id/edit" element={<MeetingFormPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/invitees" element={<InviteesPage />} />
                <Route path="/responses" element={<ResponsesPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Member Specific Routes */}
                <Route path="/my-meetings" element={<MyMeetingsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
