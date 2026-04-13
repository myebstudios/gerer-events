/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const EventsPage = React.lazy(() => import('./pages/dashboard/EventsPage'));
const CreateEventPage = React.lazy(() => import('./pages/dashboard/CreateEventPage'));
const EventDetailsPage = React.lazy(() => import('./pages/dashboard/EventDetailsPage'));
const PublicEventPage = React.lazy(() => import('./pages/public/PublicEventPage'));
const RSVPPage = React.lazy(() => import('./pages/public/RSVPPage'));
const QRPassPage = React.lazy(() => import('./pages/public/QRPassPage'));
const UploadPage = React.lazy(() => import('./pages/public/UploadPage'));
const CheckInPage = React.lazy(() => import('./pages/dashboard/CheckInPage'));
const QuickQRPage = React.lazy(() => import('./pages/dashboard/QuickQRPage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));
const QrCheckInPage = React.lazy(() => import('./pages/QrCheckInPage'));
const AcceptInvitePage = React.lazy(() => import('./pages/AcceptInvitePage'));
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminOverviewPage = React.lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminEventsPage = React.lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminContractsPage = React.lazy(() => import('./pages/admin/AdminContractsPage'));

function Loader() {
  return <div className="min-h-screen flex items-center justify-center text-text-muted font-medium bg-background">Loading...</div>;
}

export default function App() {
  return (
    <Router>
      <React.Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/check-in" element={<QrCheckInPage />} />
          <Route path="/invite" element={<AcceptInvitePage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<EventsPage />} />
            <Route path="events/new" element={<CreateEventPage />} />
            <Route path="events/:id" element={<EventDetailsPage />} />
            <Route path="events/:id/checkin" element={<CheckInPage />} />
            <Route path="tools/quick-qr" element={<QuickQRPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="contracts" element={<AdminContractsPage />} />
          </Route>

          <Route path="/e/:id" element={<PublicEventPage />} />
          <Route path="/e/:id/rsvp" element={<RSVPPage />} />
          <Route path="/e/:id/pass/:guestId" element={<QRPassPage />} />
          <Route path="/e/:id/upload" element={<UploadPage />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}
