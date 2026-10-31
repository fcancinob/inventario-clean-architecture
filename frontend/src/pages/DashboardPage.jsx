import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [metrics, setMetrics] = useState({
    totalProductos: 0,
    productosCriticos: 0,
    entradasMes: 0,
    salidasMes: 0,
  });

  const [productosBajoMinimo, setProductosBajoMinimo] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Obtener todos los productos (pageSize=100)
      const resProductos = await api.get('/productos?pageSize=100&incluirInactivos=true');
      const rawProductos = Array.isArray(resProductos.data) 
        ? resProductos.data 
        : (resProductos.data?.items || []);

      const productosMap = rawProductos.map((p) => ({
        id: p.id || p.Id,
        sku: p.sku || p.Sku || p.codigo || '--',
        nombre: p.nombre || p.Nombre || '',
        stockActual: p.stockActual ?? p.StockActual ?? 0,
        stockMinimo: p.stockMinimo ?? p.StockMinimo ?? 0,
        activo: p.activo ?? p.Activo ?? true,
      }));

      // Productos en Alerta Crítica (Stock Actual <= Stock Mínimo)
      const criticos = productosMap.filter((p) => p.activo && p.stockActual <= p.stockMinimo);

      // 2. Obtener movimientos de todos los productos vía GET /api/productos/{sku}/movimientos
      let todosLosMovimientos = [];
      try {
        const kardexPromises = productosMap.map(p => 
          api.get(`/productos/${p.sku}/movimientos`).catch(() => null)
        );
        const kardexResponses = await Promise.all(kardexPromises);

        kardexResponses.forEach((res, index) => {
          if (!res) return;
          const prodInfo = productosMap[index];
          const rawMovs = res.data?.movimientos || (Array.isArray(res.data) ? res.data : []);

          rawMovs.forEach((m) => {
            todosLosMovimientos.push({
              id: m.id || m.Id,
              tipo: (m.tipo || m.Tipo || '').toString().toUpperCase(),
              cantidad: m.cantidad ?? m.Cantidad ?? 0,
              fecha: m.fecha || m.Fecha || '',
              producto: `${prodInfo.nombre} (${prodInfo.sku})`,
              documento: m.documento || m.Documento || '--',
            });
          });
        });
      } catch (e) {
        console.warn("Error al consolidar movimientos Kardex:", e);
      }

      // Ordenar cronológicamente descendente (los más recientes primero)
      todosLosMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      // Calcular acumulados de entradas y salidas
      const totalEntradas = todosLosMovimientos
        .filter((m) => m.tipo.includes('ENTRADA') || m.tipo === 'IN')
        .reduce((sum, m) => sum + m.cantidad, 0);

      const totalSalidas = todosLosMovimientos
        .filter((m) => m.tipo.includes('SALIDA') || m.tipo === 'OUT')
        .reduce((sum, m) => sum + m.cantidad, 0);

      setMetrics({
        totalProductos: productosMap.length,
        productosCriticos: criticos.length,
        entradasMes: totalEntradas,
        salidasMes: totalSalidas,
      });

      setProductosBajoMinimo(criticos);
      setUltimosMovimientos(todosLosMovimientos.slice(0, 5));

    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar las métricas del Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel Principal (Dashboard)</h1>
          <p className="text-slate-400 text-sm mt-1">Visión general del estado del inventario y rotación de stock.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer"
          title="Recargar Métricas"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Productos</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{loading ? '--' : metrics.totalProductos}</h3>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Crítico</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{loading ? '--' : metrics.productosCriticos}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entradas Registradas</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{loading ? '--' : metrics.entradasMes}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salidas / Ventas</p>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-2">{loading ? '--' : metrics.salidasMes}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tablas Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productos bajo stock mínimo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Productos Bajo Stock Mínimo ({productosBajoMinimo.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-center">Actual</th>
                  <th className="px-4 py-3 text-center">Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {productosBajoMinimo.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500 text-xs">
                      No hay productos en estado crítico.
                    </td>
                  </tr>
                ) : (
                  productosBajoMinimo.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-400">{p.stockActual}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{p.stockMinimo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            Últimos Movimientos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Producto / SKU</th>
                  <th className="px-4 py-3 text-center">Cant.</th>
                  <th className="px-4 py-3">Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ultimosMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500 text-xs">
                      Sin movimientos registrados.
                    </td>
                  </tr>
                ) : (
                  ultimosMovimientos.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.tipo.includes('ENTRADA') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{m.producto}</td>
                      <td className="px-4 py-3 text-center font-bold text-white">{m.cantidad}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{m.documento}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}