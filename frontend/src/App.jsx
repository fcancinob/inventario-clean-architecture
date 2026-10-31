import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductosPage from './pages/ProductosPage';
import MovimientosPage from './pages/MovimientosPage';
import ReportesPage from './pages/ReportesPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        Cargando sesión...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductosPage />} />
            <Route 
              path="movimientos" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <MovimientosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="reportes" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ReportesPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}