import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileBarChart, 
  Calendar, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign 
} from 'lucide-react';

export default function ReportesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Rango de fechas por defecto: Meses del seed (Julio - Septiembre 2026) o último mes
  const [desde, setDesde] = useState('2026-07-01');
  const [hasta, setHasta] = useState('2026-09-30');

  const [reporteData, setReporteData] = useState({
    categorias: [],
    montoTotalGeneral: 0,
    totalUnidadesVendidas: 0,
  });

  const fetchReporteVentas = async () => {
    if (!desde || !hasta) {
      setError('Las fechas Desde y Hasta son obligatorias.');
      return;
    }

    if (new Date(desde) > new Date(hasta)) {
      setError('La fecha "Desde" debe ser menor o igual a la fecha "Hasta".');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get('/reportes/ventas', {
        params: { desde, hasta }
      });

      const data = res.data;
      setReporteData({
        categorias: data?.categorias || data?.Categorias || [],
        montoTotalGeneral: data?.montoTotalGeneral ?? data?.MontoTotalGeneral ?? 0,
        totalUnidadesVendidas: data?.totalUnidadesVendidas ?? data?.TotalUnidadesVendidas ?? 0,
      });
    } catch (err) {
      console.error("Error al obtener reporte de ventas:", err);
      const responseData = err.response?.data;
      setError(
        responseData?.detail || 
        responseData?.message || 
        'Error al consultar el reporte de ventas para el rango seleccionado.'
      );
      setReporteData({ categorias: [], montoTotalGeneral: 0, totalUnidadesVendidas: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporteVentas();
  }, []);

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    fetchReporteVentas();
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileBarChart className="w-7 h-7 text-indigo-400" />
          Reporte de Ventas por Categoría
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Consolidado de ventas (salidas) agrupadas por categoría de producto en un rango de fechas.
        </p>
      </div>

      {/* Filtros de Rango de Fechas */}
      <form onSubmit={handleSubmitFilter} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" /> Fecha Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" /> Fecha Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Generar Reporte
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Resumen General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto Total Vendido</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              ${reporteData.montoTotalGeneral.toLocaleString()} CLP
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Unidades Vendidas</p>
            <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
              {reporteData.totalUnidadesVendidas.toLocaleString()} u.
            </h3>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <ShoppingBag className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Tabla Desglosada por Categoría */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Desglose por Categoría
          </h3>
          <span className="text-xs text-slate-400">Ordenado por Monto Total (Descendente)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[650px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Nº Transacciones</th>
                <th className="px-6 py-4 text-center">Unidades Vendidas</th>
                <th className="px-6 py-4 text-right">Monto Total (CLP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">
                    Calculando reporte de ventas...
                  </td>
                </tr>
              ) : reporteData.categorias.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">
                    No se registraron ventas en el rango de fechas seleccionado.
                  </td>
                </tr>
              ) : (
                reporteData.categorias.map((c, index) => {
                  const categoriaNombre = c.categoria || c.Categoria || 'Sin Categoría';
                  const unidades = c.unidadesVendidas ?? c.UnidadesVendidas ?? 0;
                  const numeroVentas = c.numeroVentas ?? c.NumeroVentas ?? 0;
                  const monto = c.montoTotal ?? c.MontoTotal ?? 0;

                  return (
                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{categoriaNombre}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{numeroVentas}</td>
                      <td className="px-6 py-4 text-center font-bold text-white">{unidades}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                        ${monto.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}