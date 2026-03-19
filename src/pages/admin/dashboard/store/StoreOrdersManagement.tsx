import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchAdminOrders,
  fetchAdminOrderStats,
  updateAdminOrder,
  selectAdminOrders,
  selectAdminOrdersPagination,
  selectAdminOrdersLoading,
  selectAdminOrderStats,
} from '@/store/slices/equipmentSlice';
import EquipmentService, { Order, OrderStatus } from '@/services/equipmentService';
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
  Package, Search, Loader2, ShoppingBag, DollarSign, Truck, CheckCircle2,
  Eye, Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-600' },
  paid: { label: 'Pagado', color: 'bg-blue-500/20 text-blue-400 border-blue-600' },
  shipped: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400 border-purple-600' },
  delivered: { label: 'Entregado', color: 'bg-green-500/20 text-green-400 border-green-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-600' },
  refunded: { label: 'Reembolsado', color: 'bg-slate-500/20 text-slate-200 border-slate-600' },
};

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export default function StoreOrdersManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const orders = useSelector(selectAdminOrders);
  const pagination = useSelector(selectAdminOrdersPagination);
  const loading = useSelector(selectAdminOrdersLoading);
  const stats = useSelector(selectAdminOrderStats);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('paid');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = (p = page) => {
    dispatch(fetchAdminOrders({
      search: search || undefined,
      status: statusFilter as OrderStatus || undefined,
      page: p,
      limit: 20,
    }));
  };

  useEffect(() => { load(1); setPage(1); }, [search, statusFilter]);
  useEffect(() => { dispatch(fetchAdminOrderStats()); }, []);

  const openEdit = (order: Order) => {
    setEditOrderId(order.id);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setAdminNotes(order.admin_notes || '');
  };

  const handleSaveStatus = async () => {
    if (!editOrderId) return;
    setSaving(true);
    try {
      const res = await EquipmentService.adminUpdateOrderStatus(editOrderId, {
        status: newStatus,
        tracking_number: trackingNumber || undefined,
        admin_notes: adminNotes || undefined,
      });
      dispatch(updateAdminOrder(res.data));
      toast({ title: 'Pedido actualizado' });
      setEditOrderId(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Error al actualizar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tienda — Pedidos</h1>
        <p className="text-slate-200 text-sm">Gestiona todos los pedidos de la tienda</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total pedidos" value={String(stats.total_orders)} icon={ShoppingBag} />
          <StatCard label="Pagados" value={String(stats.by_status.paid || 0)} icon={CheckCircle2} color="text-blue-400" />
          <StatCard label="En camino" value={String(stats.by_status.shipped || 0)} icon={Truck} color="text-purple-400" />
          <StatCard label="Ingresos" value={`$${Number(stats.total_revenue).toLocaleString()} MXN`} icon={DollarSign} color="text-green-400" />
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" />
            <Input
              placeholder="Buscar por número de pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="__all__" className="text-white">Todos</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-400" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-200">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No hay pedidos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-200">Pedido</TableHead>
                  <TableHead className="text-slate-200">Cliente</TableHead>
                  <TableHead className="text-slate-200">Artículos</TableHead>
                  <TableHead className="text-slate-200">Total</TableHead>
                  <TableHead className="text-slate-200">Estado</TableHead>
                  <TableHead className="text-slate-200">Fecha</TableHead>
                  <TableHead className="text-slate-200 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => {
                  const statusConf = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-700 text-slate-300' };
                  return (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-medium text-white text-sm">{order.order_number}</TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {order.user ? `${order.user.first_name} ${order.user.last_name}` : '—'}
                        {order.user?.email && <p className="text-xs text-slate-300">{order.user.email}</p>}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{order.items?.length ?? 0}</TableCell>
                      <TableCell className="text-green-400 font-semibold text-sm">
                        ${Number(order.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusConf.color}`}>
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-200 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300" onClick={() => setViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => openEdit(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 border-t border-slate-700">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="border-slate-600 text-slate-300">Anterior</Button>
              <span className="text-slate-200 text-sm">Página {page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="border-slate-600 text-slate-300">Siguiente</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      {viewOrder && (
        <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Pedido {viewOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-200">Cliente</p>
                  <p className="text-white font-semibold">{viewOrder.user ? `${viewOrder.user.first_name} ${viewOrder.user.last_name}` : '—'}</p>
                  {viewOrder.user?.email && <p className="text-slate-200 text-sm">{viewOrder.user.email}</p>}
                </div>
                <Badge variant="outline" className={STATUS_CONFIG[viewOrder.status]?.color || ''}>
                  {STATUS_CONFIG[viewOrder.status]?.label || viewOrder.status}
                </Badge>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Artículos</p>
                {viewOrder.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm bg-slate-800 rounded-lg p-2">
                    <div>
                      <p className="text-white">{item.product_snapshot?.name || 'Producto'}</p>
                      <p className="text-slate-200 text-xs">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-green-400 font-semibold">${Number(item.total_price).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-1">Dirección de envío</p>
                <p className="text-white text-sm">{viewOrder.shipping_address?.full_name}</p>
                <p className="text-slate-300 text-sm">{viewOrder.shipping_address?.address_line1}</p>
                <p className="text-slate-300 text-sm">{viewOrder.shipping_address?.city}, {viewOrder.shipping_address?.state} {viewOrder.shipping_address?.postal_code}</p>
              </div>

              {/* Totals */}
              <div className="space-y-1 border-t border-slate-700 pt-3">
                <div className="flex justify-between text-sm"><span className="text-slate-200">Subtotal</span><span>${Number(viewOrder.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-200">Envío</span><span className="text-green-400">Gratis</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-green-400">${Number(viewOrder.total).toLocaleString()} MXN</span></div>
              </div>

              {viewOrder.tracking_number && (
                <p className="text-sm text-slate-300">Rastreo: <span className="font-semibold text-white">{viewOrder.tracking_number}</span></p>
              )}
              {viewOrder.admin_notes && (
                <p className="text-sm text-slate-200">Notas: {viewOrder.admin_notes}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Status Dialog */}
      <Dialog open={!!editOrderId} onOpenChange={() => setEditOrderId(null)}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Actualizar estado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Estado</Label>
              <Select value={newStatus} onValueChange={v => setNewStatus(v as OrderStatus)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Número de rastreo</Label>
              <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="Opcional" />
            </div>
            <div>
              <Label className="text-slate-300">Notas (admin)</Label>
              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-slate-800 border-slate-600 text-white mt-1 resize-none" rows={2} placeholder="Opcional" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300" onClick={() => setEditOrderId(null)}>Cancelar</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-black font-bold" onClick={handleSaveStatus} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'text-white' }: {
  label: string; value: string; icon: any; color?: string;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-slate-700 rounded-lg">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-slate-200">{label}</p>
          <p className={`font-bold text-lg ${color}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
