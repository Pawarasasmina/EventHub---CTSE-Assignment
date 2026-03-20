import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import EventDetailsPage from './pages/EventDetailsPage';
import EventListPage from './pages/EventListPage';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyNotificationsPage from './pages/MyNotificationsPage';
import NotFoundPage from './pages/NotFoundPage';
import OrganizerEventManagementPage from './pages/OrganizerEventManagementPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<EventListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/notifications" element={<MyNotificationsPage />} />
            </Route>
            <Route element={<RoleRoute roles={['organizer', 'admin']} />}>
              <Route path="/organizer/events" element={<OrganizerEventManagementPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
