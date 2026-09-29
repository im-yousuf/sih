/**
 * Root router.
 *
 * URL structure:
 *   /login                      → LoginPage        (public)
 *   /supervisor                 → SupervisorDashboard  (role: supervisor)
 *   /well/:wellId/*             → existing 15-page Digital Twin  (role: incharge OR supervisor)
 *   /                           → redirect to /login (or role home if already logged in)
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { useEffect, useRef } from 'react';

import { useAuthStore }       from './store/authStore';
import { useDigitalTwinStore } from './store/digitalTwinStore';
import { RequireAuth, RequireRole } from './components/ProtectedRoute';
import { useSidebarStore, SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './store/sidebarStore';

import Sidebar    from './components/Sidebar';
import Header     from './components/Header';

// Pages — existing 15-page app (unchanged)
import Overview    from './pages/Overview';
import LiveData    from './pages/LiveData';
import Reservoir   from './pages/Reservoir';
import Wellbore    from './pages/Wellbore';
import AIInsights  from './pages/AIInsights';
import Simulation  from './pages/Simulation';
import PumpControl from './pages/PumpControl';
import CSSControl  from './pages/CSSControl';
import Optimization from './pages/Optimization';
import Alerts      from './pages/Alerts';
import History     from './pages/History';
import Reports     from './pages/Reports';
import Settings    from './pages/Settings';

// New pages
import LoginPage          from './pages/LoginPage';
import SupervisorDashboard from './pages/SupervisorDashboard';

import { apiService }       from './services/api';
import { websocketService } from './services/websocket';

const SLOW_POLL_MS = 8000;

// ---------------------------------------------------------------------------
// The 15-page app shell — receives wellId from the parent route
// ---------------------------------------------------------------------------
function WellApp() {
  const { wellId = 'well-14' } = useParams<{ wellId: string }>();
  const location = useLocation();

  const {
    setTelemetry, setReservoir, setWellbore,
    setSRP, setDynamometer, setAI, setAlerts,
    setConnected, setLoading,
  } = useDigitalTwinStore();

  const wsUrlRef = useRef(
    import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/digital-twin',
  );

  const loadSlowData = async () => {
    try {
      const [reservoir, wellbore, srp, dynamometer, ai, alerts] = await Promise.all([
        apiService.getReservoirState(wellId),
        apiService.getWellboreState(wellId),
        apiService.getSRPState(wellId),
        apiService.getDynamometer(wellId),
        apiService.getAIInsights(wellId),
        apiService.getAlerts(wellId),
      ]);
      setReservoir(reservoir);
      setWellbore(wellbore);
      setSRP(srp);
      setDynamometer(dynamometer);
      setAI(ai);
      setAlerts(alerts);
    } catch (err) {
      console.error('Slow-poll refresh failed:', err);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [telemetry, reservoir, wellbore, srp, dynamometer, ai, alerts] =
          await Promise.all([
            apiService.getTelemetry(wellId),
            apiService.getReservoirState(wellId),
            apiService.getWellboreState(wellId),
            apiService.getSRPState(wellId),
            apiService.getDynamometer(wellId),
            apiService.getAIInsights(wellId),
            apiService.getAlerts(wellId),
          ]);
        setTelemetry(telemetry);
        setReservoir(reservoir);
        setWellbore(wellbore);
        setSRP(srp);
        setDynamometer(dynamometer);
        setAI(ai);
        setAlerts(alerts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };

    loadInitial();

    const wsUrl = wsUrlRef.current;
    websocketService.connect(wsUrl);
    websocketService.onOpen(()  => setConnected(true));
    websocketService.onClose(() => setConnected(false));
    websocketService.onMessage((data) => setTelemetry(data));

    const slowPollId = setInterval(loadSlowData, SLOW_POLL_MS);

    return () => {
      websocketService.disconnect();
      clearInterval(slowPollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellId]);   // re-run if the wellId in the URL changes

  // Build sub-path relative to /well/:wellId
  const isLoginPage = location.pathname === '/login';

  // Sidebar width drives the content left margin — reads shared store
  const sidebarExpanded = useSidebarStore((s) => s.isExpanded);
  const contentMargin   = isLoginPage ? 0
    : sidebarExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      {!isLoginPage && <Sidebar wellId={wellId} />}
      {/* Margin transitions in sync with sidebar width animation (300ms) */}
      <div
        className="flex flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: contentMargin }}
      >
        {!isLoginPage && <Header />}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index                  element={<Navigate to="overview" replace />} />
            <Route path="overview"        element={<Overview />} />
            <Route path="live-data"       element={<LiveData />} />
            <Route path="reservoir"       element={<Reservoir />} />
            <Route path="wellbore"        element={<Wellbore />} />
            <Route path="ai-insights"     element={<AIInsights />} />
            <Route path="simulation"      element={<Simulation />} />
            <Route path="pump-control"    element={<PumpControl />} />
            <Route path="css-control"     element={<CSSControl />} />
            <Route path="optimization"    element={<Optimization />} />
            <Route path="alerts"          element={<Alerts />} />
            <Route path="history"         element={<History />} />
            <Route path="reports"         element={<Reports />} />
            <Route path="settings"        element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Smart root redirect based on auth state
// ---------------------------------------------------------------------------
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'supervisor') return <Navigate to="/supervisor" replace />;
  return <Navigate to={`/well/${user.assignedWellId}/overview`} replace />;
}

// ---------------------------------------------------------------------------
// Top-level router
// ---------------------------------------------------------------------------
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Supervisor only */}
      <Route element={<RequireRole role="supervisor" />}>
        <Route path="/supervisor" element={<SupervisorDashboard />} />
      </Route>

      {/* Well Digital Twin — both roles can access */}
      <Route element={<RequireAuth />}>
        <Route path="/well/:wellId/*" element={<WellApp />} />
      </Route>

      {/* Root → smart redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
