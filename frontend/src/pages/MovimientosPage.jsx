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
  const [loading, setLoading] = useState(true);
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

  const fetchProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const resProds = await api.get('/productos');
      const rawProds = Array.isArray(resProds.data) 
        ? resProds.data 
        : (resProds.data?.items || []);

      setProductos(rawProds);

      if (rawProds.length > 0) {
        const firstId = rawProds[0].id || rawProds[0].Id;
        setFormEntrada(prev => ({ ...prev, productoId: prev.productoId || firstId }));
        setFormSalida(prev => ({ ...prev, productoId: prev.productoId || firstId }));
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
        await api.post('/movimientos/entradas', payload);
        setFormSuccess('Entrada registrada con éxito.');
        setFormEntrada(prev => ({ ...prev, cantidad: 1, costoUnitario: 0, numeroFactura: '' }));
      } else {
        const payload = {
          productoId: Number(formSalida.productoId),
          cantidad: Number(formSalida.cantidad),
          numeroBoleta: formSalida.numeroBoleta || 'BOL-001',
        };
        await api.post('/movimientos/salidas', payload);
        setFormSuccess('Salida registrada con éxito.');
        setFormSalida(prev => ({ ...prev, cantidad: 1, numeroBoleta: '' }));
      }

      fetchProductos();
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      console.error("Error backend:", err.response?.data);
      const errorsObj = err.response?.data?.errors;
      if (errorsObj) {
        const details = Object.entries(errorsObj)
          .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setFormError(`Error de validación: ${details}`);
      } else {
        setFormError(
          err.response?.data?.detail || 
          err.response?.data?.title || 
          err.response?.data?.message || 
          'Error 400 al registrar el movimiento.'
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
          Movimientos de Inventario
        </h1>
        <p className="text-slate-400 text-sm mt-1">Registra entradas (factura) y salidas (boleta) de stock.</p>
      </div>

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
    </div>
  );
}