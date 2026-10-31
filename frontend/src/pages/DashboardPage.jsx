import { useAuth } from '../context/AuthContext';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-slate-400 text-sm mt-1">Bienvenido de nuevo, {user?.username} ({user?.rol})</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Total Productos</span>
            <Package className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">--</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Stock Crítico</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">--</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Entradas (Mes)</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">--</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Salidas (Mes)</span>
            <ArrowUpRight className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">--</p>
        </div>
      </div>
    </div>
  );
}