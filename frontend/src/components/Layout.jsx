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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar para Escritorio */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">Inventario</h1>
            <span className="text-xs text-slate-400 font-mono">v1.0.0</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-800/50 rounded-lg">
            <div className="p-2 bg-slate-700 text-slate-300 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-emerald-400 font-mono font-semibold">{user?.rol}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

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

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior Móvil */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-white">Inventario</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Vista del Módulo Actual */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}