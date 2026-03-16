import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchAdminProducts,
  removeAdminProduct,
  selectAdminProducts,
  selectAdminProductsPagination,
  selectAdminProductsLoading,
} from '@/store/slices/equipmentSlice';
import EquipmentService, { Product, ProductCategory } from '@/services/equipmentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Plus, Edit, Trash2, Package, Loader2, Search, Upload, X, Image as ImageIcon,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { getFullImageUrl } from '@/common/tools';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'paddles', label: 'Paletas' },
  { value: 'balls', label: 'Pelotas' },
  { value: 'bags', label: 'Bolsas' },
  { value: 'apparel', label: 'Ropa' },
  { value: 'accessories', label: 'Accesorios' },
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  stock_quantity: string;
  category: ProductCategory | '';
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  weight: string;
}

const emptyForm = (): ProductForm => ({
  name: '', description: '', price: '', compare_price: '',
  stock_quantity: '0', category: '', sku: '', is_active: true,
  is_featured: false, weight: '',
});

export default function StoreManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const products = useSelector(selectAdminProducts);
  const pagination = useSelector(selectAdminProductsPagination);
  const loading = useSelector(selectAdminProductsLoading);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = (p = page) => {
    dispatch(fetchAdminProducts({
      search: search || undefined,
      category: categoryFilter as ProductCategory || undefined,
      status: statusFilter as 'active' | 'inactive' | undefined || undefined,
      page: p,
      limit: 20,
    }));
  };

  useEffect(() => { load(1); setPage(1); }, [search, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm());
    setNewImages([]);
    setExistingImages([]);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      stock_quantity: String(p.stock_quantity),
      category: p.category,
      sku: p.sku || '',
      is_active: p.is_active,
      is_featured: p.is_featured,
      weight: p.weight ? String(p.weight) : '',
    });
    setExistingImages(p.images || []);
    setNewImages([]);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setFormError('Nombre, precio y categoría son requeridos');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.compare_price) fd.append('compare_price', form.compare_price);
      fd.append('stock_quantity', form.stock_quantity);
      fd.append('category', form.category);
      if (form.sku) fd.append('sku', form.sku);
      fd.append('is_active', String(form.is_active));
      fd.append('is_featured', String(form.is_featured));
      if (form.weight) fd.append('weight', form.weight);
      if (editProduct) {
        fd.append('existing_images', JSON.stringify(existingImages));
      }
      newImages.forEach(f => fd.append('product_image', f));

      if (editProduct) {
        await EquipmentService.adminUpdateProduct(editProduct.id, fd);
        toast({ title: 'Producto actualizado' });
      } else {
        await EquipmentService.adminCreateProduct(fd);
        toast({ title: 'Producto creado' });
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await EquipmentService.adminDeleteProduct(deleteConfirm.id);
      dispatch(removeAdminProduct(deleteConfirm.id));
      toast({ title: 'Producto eliminado' });
      setDeleteConfirm(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Error al eliminar' });
    } finally {
      setDeleting(false);
    }
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    setNewImages(prev => [...prev, ...Array.from(files)]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tienda — Productos</h1>
          <p className="text-slate-400 text-sm">Administra el catálogo de equipamiento</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-black font-bold" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="__all__" className="text-white">Todas</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="__all__" className="text-white">Todos</SelectItem>
              <SelectItem value="active" className="text-white">Activos</SelectItem>
              <SelectItem value="inactive" className="text-white">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-400" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Sin productos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Producto</TableHead>
                  <TableHead className="text-slate-400">Categoría</TableHead>
                  <TableHead className="text-slate-400">Precio</TableHead>
                  <TableHead className="text-slate-400">Stock</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={getFullImageUrl(p.images[0]) ?? ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-4 w-4 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.name}</p>
                          {p.sku && <p className="text-xs text-slate-500">SKU: {p.sku}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 capitalize text-sm">{p.category}</TableCell>
                    <TableCell>
                      <p className="text-green-400 font-semibold text-sm">${Number(p.price).toLocaleString()}</p>
                      {p.compare_price && (
                        <p className="text-slate-500 text-xs line-through">${Number(p.compare_price).toLocaleString()}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${p.stock_quantity === 0 ? 'text-red-400' : p.stock_quantity < 5 ? 'text-yellow-400' : 'text-white'}`}>
                        {p.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-slate-500'}`} />
                        <span className="text-xs text-slate-400">{p.is_active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300" onClick={() => openEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => setDeleteConfirm(p)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 border-t border-slate-700">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="border-slate-600 text-slate-300">
                Anterior
              </Button>
              <span className="text-slate-400 text-sm">Página {page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="border-slate-600 text-slate-300">
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-slate-300">Nombre *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300">Descripción</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1 resize-none" rows={3} />
              </div>
              <div>
                <Label className="text-slate-300">Precio (MXN) *</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">Precio comparación</Label>
                <Input type="number" min="0" step="0.01" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="Original (opcional)" />
              </div>
              <div>
                <Label className="text-slate-300">Stock</Label>
                <Input type="number" min="0" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">Categoría *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ProductCategory }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">SKU</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">Peso (gramos)</Label>
                <Input type="number" min="0" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="bg-slate-800 border-slate-600 text-white mt-1" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-green-500" />
                  <span className="text-slate-300 text-sm">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="h-4 w-4 accent-yellow-500" />
                  <span className="text-slate-300 text-sm">Destacado</span>
                </label>
              </div>
            </div>

            {/* Image management */}
            <div>
              <Label className="text-slate-300">Imágenes</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Existing images */}
                {existingImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-600 group">
                    <img src={getFullImageUrl(img) ?? ''} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingImages(imgs => imgs.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
                {/* New images preview */}
                {newImages.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-600 group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImages(imgs => imgs.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-green-600 transition-colors"
                >
                  <Plus className="h-5 w-5 text-slate-400" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addImages(e.target.files)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-black font-bold" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Guardar</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar producto</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm">
            ¿Seguro que deseas eliminar <span className="font-semibold text-white">{deleteConfirm?.name}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 border-slate-600 text-slate-300" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
