import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Campaign from "@/pages/Campaign";
import StoryFlow from "@/pages/StoryFlow";
import Characters from "@/pages/Characters";
import Maps from "@/pages/Maps";
import MapDetail from "@/pages/MapDetail";
import Sessions from "@/pages/Sessions";
import Gruppe from "@/pages/Gruppe";
import Utskrift from "@/pages/Utskrift";
import Spill from "@/pages/Spill";
import Oversikt from "@/pages/Oversikt";
import Spelarar from "@/pages/Spelarar";
import System from "@/pages/System";
import MedDm from "@/pages/MedDm";
import Brett from "@/pages/Brett";
import Lab from "@/pages/Lab";
import SysLanding from "@/pages/sys/SysLanding";
import SysTerminal from "@/pages/sys/SysTerminal";
import SysGameDisplay from "@/pages/sys/SysGameDisplay";
import SysGame from "@/pages/sys/SysGame";
import JoinGame from "@/pages/sys/JoinGame";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/sys/terminal/:deviceId" element={<SysTerminal />} />
      <Route path="/sys/gamedisplay/:deviceId" element={<SysGameDisplay />} />
      <Route path="/sys/game/:deviceId" element={<SysGame />} />
      <Route path="/joingame/:code" element={<JoinGame />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/oversikt" element={<Oversikt />} />
          <Route path="/kampanje" element={<Campaign />} />
          <Route path="/historie" element={<StoryFlow />} />
          <Route path="/karakterer" element={<Characters />} />
          <Route path="/kart" element={<Maps />} />
          <Route path="/kart/:mapId" element={<MapDetail />} />
          <Route path="/sesjoner" element={<Sessions />} />
          <Route path="/gruppe" element={<Gruppe />} />
          <Route path="/spill" element={<Spill />} />
          <Route path="/spelarar" element={<Spelarar />} />
          <Route path="/system" element={<System />} />
          <Route path="/med-dm" element={<MedDm />} />
          <Route path="/brett" element={<Brett />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/sys" element={<SysLanding />} />
          <Route path="/utskrift" element={<Utskrift />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App