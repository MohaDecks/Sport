import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionRoute } from './components/PermissionGate';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Coaches from './pages/Coaches';
import Tournaments from './pages/Tournaments';
import Matches from './pages/Matches';
import Discipline from './pages/Discipline';
import News from './pages/News';
import Notifications from './pages/Notifications';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import AdminUsers from './pages/AdminUsers';
import MobileUsers from './pages/MobileUsers';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<PermissionRoute permission="dashboard.view"><Dashboard /></PermissionRoute>} />
        <Route path="teams" element={<PermissionRoute permission="teams.view"><Teams /></PermissionRoute>} />
        <Route path="players" element={<PermissionRoute permission="players.view"><Players /></PermissionRoute>} />
        <Route path="coaches" element={<PermissionRoute permission="coaches.view"><Coaches /></PermissionRoute>} />
        <Route path="tournaments" element={<PermissionRoute permission="tournaments.view"><Tournaments /></PermissionRoute>} />
        <Route path="matches" element={<PermissionRoute permission="matches.view"><Matches /></PermissionRoute>} />
        <Route path="discipline" element={<PermissionRoute permission="discipline.view"><Discipline /></PermissionRoute>} />
        <Route path="news" element={<PermissionRoute permission="news.view"><News /></PermissionRoute>} />
        <Route path="notifications" element={<PermissionRoute permission="notifications.view"><Notifications /></PermissionRoute>} />
        <Route path="roles" element={<PermissionRoute permissions={['roles.view', 'roles.manage']}><Roles /></PermissionRoute>} />
        <Route path="permissions" element={<PermissionRoute permissions={['roles.view', 'roles.manage']}><Permissions /></PermissionRoute>} />
        <Route path="admin-users" element={<PermissionRoute permissions={['users.admins.view', 'users.admins.manage']}><AdminUsers /></PermissionRoute>} />
        <Route path="mobile-users" element={<PermissionRoute permissions={['users.mobile.view', 'users.mobile.manage']}><MobileUsers /></PermissionRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
