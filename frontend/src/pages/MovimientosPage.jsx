import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';

export default function MovimientosPage() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(false);
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [tipo, setTipo] = useState('ENTRADA'); // ENTRADA o SALIDA

  // Formulario Entrada (RegistrarEntradaDto)
  const [formEntrada, setFormEntrada] = useState({
    productoId: '',
    proveedorId: 1,
    cantidad: 1,
    costoUnitario: 0,
    numeroFactura: '',
  });

  // Formulario Salida (RegistrarSalidaDto)
  const [formSalida, setFormSalida] = useState({
    productoId: '',
    cantidad: 1,
    numeroBoleta: '',
  });

  // 1. Cargar Ficha Kardex por SKU (GET /api/productos/{sku}/movimientos)
  const fetchKardexPorSku = async (sku) => {
    if (!sku) return;
    setLoadingMovs(true);
    try {
      const res = await api.get(`/productos/${sku}/movimientos`);
      const rawMovs = res.data?.movimientos || (Array.isArray(res.data) ? res.data : []);
      
      const listMapped = rawMovs.map((m) => ({
        id: m.id || m.Id,
        tipo: (m.tipo || m.Tipo || '').toString().toUpperCase(),
        cantidad: m.cantidad ?? m.Cantidad ?? 0,
        precioUnitario: m.precioUnitario ?? m.PrecioUnitario ?? 0,
        documento: m.documento || m.Documento || '--',
        proveedor: m.proveedor || m.Proveedor || '--',
        usuario: m.usuario || m.Usuario || '--',
        fecha: m.fecha || m.Fecha || new Date().toISOString(),
        saldoAcumulado: m.saldoAcumulado ?? m.SaldoAcumulado ?? 0
      }));

      // Ordenar por fecha descendente
      listMapped.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(listMapped);
    } catch (err) {
      console.warn(`No se pudieron obtener movimientos para el SKU ${sku}:`, err);
      setMovimientos([]);
    } finally {
      setLoadingMovs(false);
    }
  };

  // 2. Cargar Catálogo de Productos
  const fetchProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const resProds = await api.get('/productos?pageSize=100');
      const rawProds = Array.isArray(resProds.data) 
        ? resProds.data 
        : (resProds.data?.items || []);

      setProductos(rawProds);

      if (rawProds.length > 0) {
        const firstProd = rawProds[0];
        const firstId = firstProd.id || firstProd.Id;
        const firstSku = firstProd.sku || firstProd.Sku || firstProd.codigo;
        
        setSelectedSku(firstSku);
        setFormEntrada(prev => ({ ...prev, productoId: prev.productoId || firstId }));
        setFormSalida(prev => ({ ...prev, productoId: prev.productoId || firstId }));
        
        fetchKardexPorSku(firstSku);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError('Error al cargar la lista de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSelectSkuChange = (e) => {
    const sku = e.target.value;
    setSelectedSku(sku);
    fetchKardexPorSku(sku);
  };

const prodSeleccionado = productos.find(p => (p.id || p.Id) === Number(formSalida.productoId));
if (prodSeleccionado && formSalida.cantidad > (prodSeleccionado.stockActual ?? prodSeleccionado.StockActual ?? 0)) {
  setFormError(`Stock insuficiente. Stock actual disponible: ${prodSeleccionado.stockActual} unidades.`);
  setSubmitting(false);
  return;
}

  // 3. Submit con Rutas Correctas: /movimientos/entradas y /movimientos/salidas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (tipo === 'ENTRADA') {
        const payload = {
          productoId: Number(formEntrada.productoId),
          proveedorId: Number(formEntrada.proveedorId),
          cantidad: Number(formEntrada.cantidad),
          costoUnitario: Number(formEntrada.costoUnitario),
          numeroFactura: formEntrada.numeroFactura || 'FAC-001',
        };

        // RUTA CORRECTA SEGÚN TU CONTROLLER: /movimientos/entradas
        await api.post('/movimientos/entradas', payload);
        setFormSuccess('Entrada registrada con éxito.');
        setFormEntrada(prev => ({ ...prev, cantidad: 1, costoUnitario: 0, numeroFactura: '' }));
      } else {
        const payload = {
          productoId: Number(formSalida.productoId),
          cantidad: Number(formSalida.cantidad),
          numeroBoleta: formSalida.numeroBoleta || 'BOL-001',
        };

        // RUTA CORRECTA SEGÚN TU CONTROLLER: /movimientos/salidas
        await api.post('/movimientos/salidas', payload);
        setFormSuccess('Salida registrada con éxito.');
        setFormSalida(prev => ({ ...prev, cantidad: 1, numeroBoleta: '' }));
      }

      await fetchProductos();
      if (selectedSku) {
        await fetchKardexPorSku(selectedSku);
      }
      setTimeout(() => setFormSuccess(''), 3000);

    } catch (err) {
      console.error("Error backend:", err.response?.data);
      const responseData = err.response?.data;
      const errorsObj = responseData?.errors;

      if (errorsObj) {
        const details = Object.entries(errorsObj)
          .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setFormError(`Error de validación: ${details}`);
      } else {
        setFormError(
          responseData?.detail || 
          responseData?.title || 
          responseData?.message || 
          'Error al registrar el movimiento.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="w-7 h-7 text-indigo-400" />
          Movimientos e Historial (Kardex)
        </h1>
        <p className="text-slate-400 text-sm mt-1">Registra entradas (factura), salidas (boleta) y consulta la ficha por producto.</p>
      </div>

      {/* Formulario de Registro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Registrar Operación
          </h2>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                tipo === 'ENTRADA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 inline mr-1" /> Entrada (Factura)
            </button>
            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                tipo === 'SALIDA' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 inline mr-1" /> Salida (Boleta)
            </button>
          </div>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tipo === 'ENTRADA' ? (
            /* Campos para RegistrarEntradaDto */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Producto</label>
                <select
                  value={formEntrada.productoId}
                  onChange={(e) => setFormEntrada({ ...formEntrada, productoId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                >
                  {productos.map((p) => (
                    <option key={p.id || p.Id} value={p.id || p.Id}>
                      {p.nombre || p.Nombre} ({p.sku || p.Sku || `#${p.id}`}) - Stock: {p.stockActual ?? p.StockActual ?? 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ID Proveedor</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formEntrada.proveedorId}
                  onChange={(e) => setFormEntrada({ ...formEntrada, proveedorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formEntrada.cantidad}
                  onChange={(e) => setFormEntrada({ ...formEntrada, cantidad: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Costo Unitario ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formEntrada.costoUnitario}
                  onChange={(e) => setFormEntrada({ ...formEntrada, costoUnitario: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Número de Factura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: FAC-2026-99"
                  value={formEntrada.numeroFactura}
                  onChange={(e) => setFormEntrada({ ...formEntrada, numeroFactura: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          ) : (
            /* Campos para RegistrarSalidaDto */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Producto</label>
                <select
                  value={formSalida.productoId}
                  onChange={(e) => setFormSalida({ ...formSalida, productoId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                >
                  {productos.map((p) => (
                    <option key={p.id || p.Id} value={p.id || p.Id}>
                      {p.nombre || p.Nombre} ({p.sku || p.Sku || `#${p.id}`}) - Stock: {p.stockActual ?? p.StockActual ?? 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formSalida.cantidad}
                  onChange={(e) => setFormSalida({ ...formSalida, cantidad: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Número de Boleta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BOL-5001"
                  value={formSalida.numeroBoleta}
                  onChange={(e) => setFormSalida({ ...formSalida, numeroBoleta: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || productos.length === 0}
              className={`py-2.5 px-6 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer ${
                tipo === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              } disabled:opacity-50`}
            >
              {submitting ? 'Procesando...' : `Registrar ${tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}`}
            </button>
          </div>
        </form>
      </div>

      {/* Ficha Kardex por Producto */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Historial Kardex por Producto
            </h3>
            <select
              value={selectedSku}
              onChange={handleSelectSkuChange}
              className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400 font-mono text-xs font-bold focus:outline-none focus:border-indigo-500"
            >
              {productos.map((p) => {
                const sku = p.sku || p.Sku || p.codigo;
                return (
                  <option key={p.id || p.Id} value={sku}>
                    {sku} - {p.nombre || p.Nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => fetchKardexPorSku(selectedSku)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            title="Recargar Kardex"
          >
            <RefreshCw className={`w-4 h-4 ${loadingMovs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4">P. Unitario</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Saldo Acum.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loadingMovs ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    Cargando movimientos para {selectedSku}...
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    Sin movimientos registrados para el producto {selectedSku}.
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const isEntrada = m.tipo.includes('ENTRADA') || m.tipo === 'IN';
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isEntrada 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-white">{m.cantidad}</td>
                      <td className="px-6 py-4 font-mono">${m.precioUnitario?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{m.documento}</td>
                      <td className="px-6 py-4 text-slate-400">{m.proveedor}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{m.usuario}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {m.fecha ? new Date(m.fecha).toLocaleString() : '--'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-400 font-mono">
                        {m.saldoAcumulado}
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