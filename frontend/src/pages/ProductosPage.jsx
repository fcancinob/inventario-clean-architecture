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
  CheckCircle2,
  Edit2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ProductosPage() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Estados de Paginación (CA-02)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estado para Modal (Crear / Editar)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const initialFormState = {
    sku: '',
    nombre: '',
    marca: '',
    categoriaId: 1,
    precioCosto: 0,
    precioVenta: 0,
    stockMinimo: 5,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Solo ADMIN y OPERADOR pueden crear o editar
  const canEdit = user?.rol === 'ADMIN' || user?.rol === 'OPERADOR';

  const fetchProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/productos', {
        params: {
          texto: search || undefined,
          page,
          pageSize,
          incluirInactivos: true
        }
      });

      const rawData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      const total = res.data?.totalRecords ?? res.data?.totalCount ?? rawData.length;

      const data = rawData.map(item => ({
        id: item.id || item.Id,
        sku: item.sku || item.Sku || item.codigo || '--',
        nombre: item.nombre || item.Nombre || '',
        marca: item.marca || item.Marca || '',
        categoria: item.categoria || item.Categoria || 'General',
        stockActual: item.stockActual ?? item.StockActual ?? 0,
        stockMinimo: item.stockMinimo ?? item.StockMinimo ?? 0,
        precioVenta: item.precioVenta ?? item.PrecioVenta ?? 0,
      }));

      setProductos(data);
      setTotalRecords(total);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar el catálogo de productos.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProductos();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (producto) => {
    setEditingId(producto.id);
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      marca: producto.marca || 'Genérica',
      categoriaId: 1,
      precioCosto: producto.precioVenta || 0,
      precioVenta: producto.precioVenta || 0,
      stockMinimo: producto.stockMinimo || 5,
    });
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['precioCosto', 'precioVenta', 'stockMinimo', 'categoriaId'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (formData.precioVenta < formData.precioCosto) {
      setFormError('El Precio de Venta debe ser mayor o igual al Precio de Costo.');
      return;
    }

    setSubmitting(true);

    const payload = {
      sku: formData.sku.trim(),
      nombre: formData.nombre.trim(),
      marca: formData.marca.trim(),
      categoriaId: parseInt(formData.categoriaId, 10),
      precioCosto: parseFloat(formData.precioCosto),
      precioVenta: parseFloat(formData.precioVenta),
      stockMinimo: parseInt(formData.stockMinimo, 10),
    };

    try {
      if (editingId) {
        await api.put(`/productos/${editingId}`, payload);
        setFormSuccess('Producto actualizado con éxito.');
      } else {
        await api.post('/productos', payload);
        setFormSuccess('Producto registrado con éxito.');
      }

      fetchProductos();
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      const responseData = err.response?.data;
      const validationErrors = responseData?.errors 
        ? Object.values(responseData.errors).flat().join(' | ')
        : null;

      setFormError(
        validationErrors || 
        responseData?.detail || 
        responseData?.message || 
        'Error al guardar el producto.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
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
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Controles de Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre o categoría... (presiona Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={fetchProductos}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[800px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">Stock Mínimo</th>
                <th className="px-6 py-4">Precio Venta (CLP)</th>
                <th className="px-6 py-4">Estado</th>
                {canEdit && <th className="px-6 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? "8" : "7"} className="text-center py-8 text-slate-500">
                    Cargando productos de la base de datos...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? "8" : "7"} className="text-center py-8 text-slate-500">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                productos.map((item) => {
                  const isLowStock = item.stockActual <= item.stockMinimo;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-indigo-400 font-bold whitespace-nowrap">{item.sku}</td>
                      <td className="px-6 py-4 font-semibold text-white">{item.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{item.stockActual}</td>
                      <td className="px-6 py-4 text-slate-400">{item.stockMinimo}</td>
                      <td className="px-6 py-4 font-mono whitespace-nowrap">${item.precioVenta?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Normal
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar Producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación Integrado (CA-02) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 border-t border-slate-800 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>registros por página &bull; Total: {totalRecords}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono">Página {page} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    disabled={!!editingId}
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="PROD-001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca</label>
                  <input
                    type="text"
                    name="marca"
                    required
                    value={formData.marca}
                    onChange={handleInputChange}
                    placeholder="Ej: Kingston, ASUS"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Cable Red Cat6 2m"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value={1}>1 - Notebooks</option>
                    <option value={2}>2 - Monitores</option>
                    <option value={3}>3 - Periféricos</option>
                    <option value={4}>4 - Almacenamiento</option>
                    <option value={5}>5 - Componentes</option>
                    <option value={6}>6 - Redes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">P. Costo (CLP)</label>
                  <input
                    type="number"
                    name="precioCosto"
                    min="1"
                    required
                    value={formData.precioCosto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">P. Venta (CLP)</label>
                  <input
                    type="number"
                    name="precioVenta"
                    min="1"
                    required
                    value={formData.precioVenta}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Mín.</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    min="0"
                    required
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}