import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  ArrowLeftRight, 
  BarChart3, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  User 
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'OPERADOR', 'CONSULTA'] },
    { label: 'Productos', path: '/productos', icon: Package, roles: ['ADMIN', 'OPERADOR', 'CONSULTA'] },
    { label: 'Movimientos', path: '/movimientos', icon: ArrowLeftRight, roles: ['ADMIN', 'OPERADOR'] },
    { label: 'Reportes', path: '/reportes', icon: BarChart3, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.rol));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Superior Desktop */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="w-full px-6 lg:px-12 h-16 flex items-center justify-between">
          
          {/* Brand & Nav Horizontal */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white leading-tight tracking-tight">
                  Inventario<span className="text-indigo-400">Tech</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
              </div>
            </Link>

            {/* Links Navegación Escritorio */}
            <nav className="hidden md:flex items-center gap-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Status & Controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user?.username}</p>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  {user?.rol}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-slate-300 rounded-lg text-sm font-medium transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Menú Móvil Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900 p-6 flex flex-col justify-between border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-indigo-400" />
                  <span className="font-bold text-white">Inventario</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="mt-6 space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
                <User className="w-4 h-4 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                  <p className="text-xs text-emerald-400 font-mono font-semibold">{user?.rol}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de los Módulos (Ancho Completo Escritorio) */}
      <main className="flex-1 w-full px-6 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* Footer Ancho Completo */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-4 px-6 lg:px-12 text-center text-xs text-slate-500">
        Sistema de Control de Inventario y Kardex &bull; .NET 8 & React
      </footer>
    </div>
  );
}