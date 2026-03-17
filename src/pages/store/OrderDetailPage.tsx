import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchMyOrder, selectCurrentOrder } from '@/store/slices/equipmentSlice';
import EquipmentService from '@/services/equipmentService';
import {
  ArrowLeft, Package, MapPin, Loader2, Truck, CheckCircle2, XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/common/tools';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, {
  label: string;
  cls: string;
  Icon: React.ElementType;
}> = {
  pending: { label: 'Pendiente de pago', cls: 'bg-[rgba(250,199,117,0.12)] text-[#FAC775] border-[rgba(250,199,117,0.2)]', Icon: Package },
  paid: { label: 'Pagado', cls: 'bg-[rgba(55,138,221,0.12)] text-[#378ADD] border-[rgba(55,138,221,0.2)]', Icon: CheckCircle2 },
  shipped: { label: 'Enviado', cls: 'bg-[rgba(127,119,221,0.12)] text-[#7F77DD] border-[rgba(127,119,221,0.2)]', Icon: Truck },
  delivered: { label: 'Entregado', cls: 'bg-[rgba(200,255,0,0.1)] text-[#C8FF00] border-[rgba(200,255,0,0.18)]', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', cls: 'bg-[rgba(226,75,74,0.1)] text-[#E24B4A] border-[rgba(226,75,74,0.18)]', Icon: XCircle },
  refunded: { label: 'Reembolsado', cls: 'bg-[rgba(90,90,122,0.15)] text-[#9090B0] border-[rgba(90,90,122,0.2)]', Icon: XCircle },
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const order = useSelector(selectCurrentOrder);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      dispatch(fetchMyOrder(orderId)).finally(() => setLoading(false));
    }
  }, [orderId]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await EquipmentService.cancelOrder(order.id);
      dispatch(fetchMyOrder(order.id));
      toast({ title: 'Pedido cancelado' });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo cancelar el pedido',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
          <span className="text-[#5A5A7A] text-sm">Cargando pedido…</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white">
        <Package className="w-12 h-12 text-[#2A2A3E] mb-4" />
        <p className="text-[#5A5A7A] mb-5">Pedido no encontrado</p>
        <button
          onClick={() => navigate('/store/orders')}
          className="px-5 py-2.5 bg-[#13131A] border border-[#2A2A3E] rounded-xl text-sm hover:border-[#353550] transition-all"
        >
          Ver mis pedidos
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || { label: order.status, cls: 'bg-[#1C1C27] text-[#9090B0] border-[#2A2A3E]', Icon: Package };
  const StatusIcon = cfg.Icon;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif]">
      {/* Topnav */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-[#1E1E2E]">
        <div className="max-w-3xl mx-auto px-5 h-[60px] flex items-center">
          <button
            onClick={() => navigate('/store/orders')}
            className="flex items-center gap-2 text-[#9090B0] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mis pedidos
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10 space-y-4">
        {/* Status card */}
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#5A5A7A] text-xs mb-2">Pedido {order.order_number}</p>
              <div className="flex items-center gap-2.5">
                <StatusIcon className="w-4 h-4" style={{ color: 'inherit' }} />
                <span className={cn('px-2.5 py-1 rounded-lg border text-xs font-bold font-sans uppercase tracking-wide', cfg.cls)}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-[#3A3A5A] text-xs mt-2">
                {new Date(order.created_at).toLocaleDateString('es-MX', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#5A5A7A] text-xs mb-1">Total</p>
              <p className="font-sans font-extrabold text-2xl text-[#C8FF00]">
                ${Number(order.total).toLocaleString()}
                <span className="text-xs font-normal text-[#5A5A7A] ml-1">MXN</span>
              </p>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-4 p-3 bg-[rgba(127,119,221,0.08)] border border-[rgba(127,119,221,0.15)] rounded-xl">
              <p className="text-[#5A5A7A] text-xs mb-0.5">Número de rastreo</p>
              <p className="text-[#7F77DD] font-medium text-sm">{order.tracking_number}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5">
          <p className="text-[#5A5A7A] text-[10px] uppercase tracking-widest font-sans mb-4">
            Artículos
          </p>
          <div className="space-y-3">
            {(order.items ?? []).map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#1C1C27] rounded-xl overflow-hidden flex-shrink-0">
                  {item.product_snapshot?.images?.[0] ? (
                    <img
                      src={getFullImageUrl(item.product_snapshot.images[0]) ?? ''}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-5 h-5 text-[#2A2A3E]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product_snapshot?.name || 'Producto'}</p>
                  <p className="text-[#5A5A7A] text-xs mt-0.5">
                    ×{item.quantity} · ${Number(item.unit_price).toLocaleString()} c/u
                  </p>
                </div>
                <p className="font-sans font-bold text-[#C8FF00] text-sm">
                  ${Number(item.total_price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#C8FF00]" />
            <p className="text-[#5A5A7A] text-[10px] uppercase tracking-widest font-sans">
              Dirección de envío
            </p>
          </div>
          <p className="font-medium text-sm">{order.shipping_address?.full_name}</p>
          <p className="text-[#9090B0] text-sm">{order.shipping_address?.address_line1}</p>
          {order.shipping_address?.address_line2 && (
            <p className="text-[#9090B0] text-sm">{order.shipping_address.address_line2}</p>
          )}
          <p className="text-[#9090B0] text-sm">
            {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
            {order.shipping_address?.postal_code}
          </p>
          <p className="text-[#9090B0] text-sm">{order.shipping_address?.country}</p>
          {order.shipping_address?.phone && (
            <p className="text-[#5A5A7A] text-xs mt-1.5">{order.shipping_address.phone}</p>
          )}
        </div>

        {/* Totals */}
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#5A5A7A]">Subtotal</span>
            <span>${Number(order.subtotal).toLocaleString()} MXN</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5A5A7A]">Envío</span>
            <span className="text-[#C8FF00] font-semibold text-xs">Gratis</span>
          </div>
          <div className="flex justify-between border-t border-[#1E1E2E] pt-3">
            <span className="font-sans font-bold">Total</span>
            <span className="font-sans font-extrabold text-[#C8FF00]">
              ${Number(order.total).toLocaleString()} MXN
            </span>
          </div>
        </div>

        {/* Cancel */}
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-3.5 bg-transparent border border-[rgba(226,75,74,0.25)] text-[#E24B4A] hover:bg-[rgba(226,75,74,0.07)] font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Loader2 className={`w-4 h-4 animate-spin ${cancelling ? '' : 'hidden'}`} />
            <XCircle className={`w-4 h-4 ${cancelling ? 'hidden' : ''}`} />
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  );
}