import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSuccess, productToEdit, categorias = [] }) {
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

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.codigo || productToEdit.sku || '',
        nombre: productToEdit.nombre || '',
        marca: productToEdit.marca || '',
        categoriaId: productToEdit.categoriaId || productToEdit.categoria?.id || (categorias.length > 0 ? categorias[0].id : 1),
        precioCosto: productToEdit.precioCosto ?? productToEdit.PrecioCosto ?? 0,
        precioVenta: productToEdit.precioVenta ?? productToEdit.precioUnitario ?? 0,
        stockMinimo: productToEdit.stockMinimo ?? 5,
      });
    } else {
      setFormData(initialFormState);
    }
    setFormError('');
    setFormSuccess('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

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

    // Payload defensivo con ambas nomenclaturas
    const payload = {
      sku: formData.sku.trim(),
      nombre: formData.nombre.trim(),
      marca: formData.marca.trim(),
      categoriaId: parseInt(formData.categoriaId, 10),
      precioCosto: parseFloat(formData.precioCosto),
      precioVenta: parseFloat(formData.precioVenta),
      stockMinimo: parseInt(formData.stockMinimo, 10),
      
      // Fallback PascalCase
      Sku: formData.sku.trim(),
      Nombre: formData.nombre.trim(),
      Marca: formData.marca.trim(),
      CategoriaId: parseInt(formData.categoriaId, 10),
      PrecioCosto: parseFloat(formData.precioCosto),
      PrecioVenta: parseFloat(formData.precioVenta),
      StockMinimo: parseInt(formData.stockMinimo, 10),
    };

    try {
      if (productToEdit) {
        await api.put(`/productos/${productToEdit.id}`, payload);
        setFormSuccess('Producto actualizado correctamente.');
      } else {
        await api.post('/productos', payload);
        setFormSuccess('Producto registrado con éxito.');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      const responseData = err.response?.data;
      const validationErrors = responseData?.errors 
        ? Object.values(responseData.errors).flat().join(' | ')
        : null;

      setFormError(
        validationErrors || 
        responseData?.detail || 
        responseData?.title || 
        'Error al procesar la solicitud.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
        </h2>

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                disabled={!!productToEdit}
                required
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="NB-001"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                required
                value={formData.marca}
                onChange={handleInputChange}
                placeholder="Ej: ASUS, Lenovo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Notebook Gamer 15.6"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {categorias.length > 0 ? (
                  categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={1}>Notebooks</option>
                    <option value={2}>Monitores</option>
                    <option value={3}>Periféricos</option>
                    <option value={4}>Almacenamiento</option>
                    <option value={5}>Componentes</option>
                    <option value={6}>Redes</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">P. Costo (CLP)</label>
              <input
                type="number"
                name="precioCosto"
                min="1"
                required
                value={formData.precioCosto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">P. Venta (CLP)</label>
              <input
                type="number"
                name="precioVenta"
                min="1"
                required
                value={formData.precioVenta}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stock Mín.</label>
              <input
                type="number"
                name="stockMinimo"
                min="0"
                required
                value={formData.stockMinimo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Guardando...' : productToEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}