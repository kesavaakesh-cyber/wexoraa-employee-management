import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Tasks from './pages/admin/Tasks';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import EmployeeDashboard from './pages/employee/Dashboard';
import MyTasks from './pages/employee/Tasks';
import DailyReport from './pages/employee/Report';
import Analytics from './pages/admin/Analytics';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/employees" element={
            <PrivateRoute role="admin"><Employees /></PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/admin/tasks" element={
  <PrivateRoute role="admin"><Tasks /></PrivateRoute>
} />
<Route path="/admin/attendance" element={
  <PrivateRoute role="admin"><Attendance /></PrivateRoute>
} />
<Route path="/admin/reports" element={
  <PrivateRoute role="admin"><Reports /></PrivateRoute>
} />
<Route path="/employee/dashboard" element={
  <PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>
} />
<Route path="/employee/dashboard" element={
  <PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>
} />
<Route path="/employee/tasks" element={
  <PrivateRoute role="employee"><MyTasks /></PrivateRoute>
} />
<Route path="/employee/report" element={
  <PrivateRoute role="employee"><DailyReport /></PrivateRoute>
} />
<Route path="/admin/analytics" element={
  <PrivateRoute role="admin"><Analytics /></PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;