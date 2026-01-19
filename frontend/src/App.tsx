import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Staff Imports
import DashboardLayout from './pages/Dashboard';
import DashboardOverview from './pages/DashboardOverview';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Engagements from './pages/Engagements';
import EngagementWorkspace from './pages/EngagementWorkspace';
import Accounting from './pages/Accounting';
import StaffManagement from './pages/StaffManagement';
import StaffDetail from './pages/StaffDetail';
import TaskDetail from './pages/TaskDetail';
import Settings from './pages/Settings';

// Auth Import
import Login from './pages/Login';

// Portal Imports
import PortalLayout from './pages/PortalLayout';
import PortalDashboard from './pages/PortalDashboard';
import PortalVault from './pages/PortalVault';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('access');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* -------------------------------------------------------------------
            CLIENT PORTAL ROUTES 
            Moved "Client Engagements" inside here to distinguish from Staff
        -------------------------------------------------------------------- */}
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect to overview */}
          <Route index element={<Navigate to="overview" replace />} />
          
          <Route path="overview" element={<PortalDashboard />} />
          <Route path="documents" element={<PortalVault />} />
          
          {/* --- MOVED HERE: Client View of Engagements --- */}
          {/* These will now be accessed via /portal/engagements */}
          <Route path="engagements" element={<Engagements />} /> 
          <Route path="engagements/:id" element={<EngagementWorkspace />} />

          <Route path="billing" element={
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              Billing Module Coming Soon
            </div>
          } />
        </Route>

        {/* -------------------------------------------------------------------
            STAFF / INTERNAL DASHBOARD ROUTES
            (Wraps everything in the Sidebar Layout)
        -------------------------------------------------------------------- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          
          {/* Staff View of Engagements (Accessed via /engagements) */}
          <Route path="engagements" element={<Engagements />} />
          <Route path="engagements/:id" element={<EngagementWorkspace />} />
          
          <Route path="/accounting/*" element={<Accounting />} />
          
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/:id" element={<StaffDetail />} />
          <Route path="/engagements/:id/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;