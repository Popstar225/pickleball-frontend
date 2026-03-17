import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EquipmentService, { Order } from '@/services/equipmentService';
import { CheckCircle2, Package, ShoppingBag, Loader2, MapPin } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await EquipmentService.getMyOrders({ limit: 50 });
        const found = res.data.orders.find((o: Order) => o.order_number === orderNumber);
        setOrder(found || null);
      } catch { /* noop */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
          <span className="text-[#5A5A7A] text-sm">Cargando confirmación…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif] flex flex-col items-center justify-center px-5 py-14">
      <div className="max-w-lg w-full space-y-6">
        {/* Success */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgba(200,255,0,0.1)] border-2 border-[rgba(200,255,0,0.25)] mb-5"
            style={{ animation: 'popIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275)' }}
          >
            <CheckCircle2 className="w-9 h-9 text-[#C8FF00]" />
          </div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight">
            ¡Pedido confirmado!
          </h1>
          <p className="text-[#9090B0] mt-2 text-sm">
            Tu pedido{' '}
            <span className="text-white font-medium">{orderNumber}</span>{' '}
            ha sido recibido.
          </p>
        </div>

        {/* Order card */}
        {order && (
          <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5 space-y-4">
            {/* Meta rows */}
            <div className="space-y-3">
              {[
                { label: 'Número de pedido', value: <span className="font-sans font-bold">{order.order_number}</span> },
                {
                  label: 'Estado',
                  value: <span className="text-[#C8FF00] font-semibold text-sm">
                    {{
                      pending: 'Pendiente',
                      paid: 'Pagado',
                      shipped: 'Enviado',
                      delivered: 'Entregado',
                      cancelled: 'Cancelado',
                    }[order.status] || order.status}
                  </span>
                },
                {
                  label: 'Total',
                  value: <span className="font-sans font-bold text-[#C8FF00]">
                    ${Number(order.total).toLocaleString()} MXN
                  </span>
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-[#5A5A7A]">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            {/* Shipping */}
            <div className="border-t border-[#1E1E2E] pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3 text-[#5A5A7A]" />
                <p className="text-[#5A5A7A] text-[10px] uppercase tracking-widest font-sans">
                  Enviar a
                </p>
              </div>
              <p className="text-white text-sm font-medium">{order.shipping_address?.full_name}</p>
              <p className="text-[#9090B0] text-sm">{order.shipping_address?.address_line1}</p>
              <p className="text-[#9090B0] text-sm">
                {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
                {order.shipping_address?.postal_code}
              </p>
            </div>

            {/* Items */}
            <div className="border-t border-[#1E1E2E] pt-4 space-y-2.5">
              {(order.items ?? []).map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#9090B0] flex-1 truncate mr-2">
                    {item.product_snapshot?.name || 'Producto'} ×{item.quantity}
                  </span>
                  <span className="text-white flex-shrink-0">
                    ${Number(item.total_price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/store/orders')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#13131A] border border-[#2A2A3E] hover:border-[#353550] text-white rounded-xl text-sm transition-all"
          >
            <Package className="w-4 h-4" />
            Mis pedidos
          </button>
          <button
            onClick={() => navigate('/store')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-bold text-sm rounded-xl transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Seguir comprando
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}