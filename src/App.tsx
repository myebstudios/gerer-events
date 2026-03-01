/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import EventsPage from './pages/dashboard/EventsPage';
import CreateEventPage from './pages/dashboard/CreateEventPage';
import EventDetailsPage from './pages/dashboard/EventDetailsPage';
import PublicEventPage from './pages/public/PublicEventPage';
import RSVPPage from './pages/public/RSVPPage';
import QRPassPage from './pages/public/QRPassPage';
import UploadPage from './pages/public/UploadPage';
import CheckInPage from './pages/dashboard/CheckInPage';
import QuickQRPage from './pages/dashboard/QuickQRPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Host Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<EventsPage />} />
          <Route path="events/new" element={<CreateEventPage />} />
          <Route path="events/:id" element={<EventDetailsPage />} />
          <Route path="events/:id/checkin" element={<CheckInPage />} />
          <Route path="tools/quick-qr" element={<QuickQRPage />} />
        </Route>

        {/* Public Event Pages */}
        <Route path="/e/:id" element={<PublicEventPage />} />
        <Route path="/e/:id/rsvp" element={<RSVPPage />} />
        <Route path="/e/:id/pass/:guestId" element={<QRPassPage />} />
        <Route path="/e/:id/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}
