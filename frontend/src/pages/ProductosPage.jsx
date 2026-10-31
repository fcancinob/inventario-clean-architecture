import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  X, 
  CheckCircle2 
} from 'lucide-react';

export default function ProductosPage() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Estado para Modal de Nuevo Producto
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'Hardware',
    stockMinimo: 5,
    precioUnitario: 0,
  });

  const canEdit = user?.rol === 'ADMIN' || user?.rol === 'OPERADOR';

const fetchProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/productos');
      const rawData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      
      // Normalizamos las propiedades por si vienen en PascalCase o camelCase
      const data = rawData.map(item => ({
        id: item.id || item.Id,
        codigo: item.codigo || item.Codigo || item.codigoSku || item.sku || `--`,
        nombre: item.nombre || item.Nombre || '',
        descripcion: item.descripcion || item.Descripcion || '',
        categoria: item.categoria || item.Categoria || 'General',
        stockActual: item.stockActual ?? item.StockActual ?? 0,
        stockMinimo: item.stockMinimo ?? item.StockMinimo ?? 0,
        precioUnitario: item.precioUnitario ?? item.PrecioUnitario ?? 0,
      }));

      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar el catálogo de productos.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stockMinimo' || name === 'precioUnitario' ? Number(value) : value,
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      await api.post('/productos', formData);
      setFormSuccess('Producto registrado con éxito.');
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: 'Hardware',
        stockMinimo: 5,
        precioUnitario: 0,
      });
      fetchProductos();
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess('');
      }, 1200);
    } catch (err) {
      setFormError(err.response?.data?.detail || err.response?.data?.message || 'Error al guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

const filteredProductos = (Array.isArray(productos) ? productos : []).filter((p) =>
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-400" />
            Catálogo de Productos
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de inventario y monitoreo de stock disponible.</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Controles de Búsqueda y Recarga */}
      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
        <button
          onClick={fetchProductos}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">Stock Mínimo</th>
                <th className="px-6 py-4">Precio (USD)</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    Cargando productos de la base de datos...
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((item) => {
                  const isLowStock = item.stockActual <= item.stockMinimo;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-indigo-400 font-semibold">
                    {item.codigo || item.codigoSku || item.sku || item.code || `#${item.id}`}
                    </td>
                      <td className="px-6 py-4 font-medium text-white">{item.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{item.stockActual}</td>
                      <td className="px-6 py-4 text-slate-400">{item.stockMinimo}</td>
                      <td className="px-6 py-4 font-mono">${item.precioUnitario?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear Producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Registrar Nuevo Producto</h2>

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

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Código SKUs</label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    value={formData.codigo}
                    onChange={handleInputChange}
                    placeholder="PROD-001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Redes">Redes</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Monitor LED 27 pulgadas"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="2"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Especificaciones o notas adicionales..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    min="1"
                    required
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precioUnitario"
                    min="0"
                    required
                    value={formData.precioUnitario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}