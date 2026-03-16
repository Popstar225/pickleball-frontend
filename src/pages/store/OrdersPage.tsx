// ─── OrdersPage.tsx ───────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store';
import {
  fetchMyOrders,
  selectMyOrders,
  selectOrdersLoading,
} from '@/store/slices/equipmentSlice';
import { Order } from '@/services/equipmentService';
import { Package, ShoppingBag, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-[rgba(250,199,117,0.12)] text-[#FAC775] border-[rgba(250,199,117,0.2)]' },
  paid: { label: 'Pagado', cls: 'bg-[rgba(55,138,221,0.12)] text-[#378ADD] border-[rgba(55,138,221,0.2)]' },
  shipped: { label: 'Enviado', cls: 'bg-[rgba(127,119,221,0.12)] text-[#7F77DD] border-[rgba(127,119,221,0.2)]' },
  delivered: { label: 'Entregado', cls: 'bg-[rgba(200,255,0,0.1)] text-[#C8FF00] border-[rgba(200,255,0,0.18)]' },
  cancelled: { label: 'Cancelado', cls: 'bg-[rgba(226,75,74,0.1)] text-[#E24B4A] border-[rgba(226,75,74,0.18)]' },
  refunded: { label: 'Reembolsado', cls: 'bg-[rgba(90,90,122,0.15)] text-[#9090B0] border-[rgba(90,90,122,0.2)]' },
};

export function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const orders = useSelector(selectMyOrders);
  const loading = useSelector(selectOrdersLoading);

  useEffect(() => {
    dispatch(fetchMyOrders({ limit: 50 }));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif]">
      {/* Topnav */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-[#1E1E2E]">
        <div className="max-w-3xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2 text-[#9090B0] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tienda
          </button>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C8FF00]" />
            <span className="font-['Syne',sans-serif] font-extrabold text-base">Mis pedidos</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
            <span className="text-[#5A5A7A] text-sm">Cargando pedidos…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[#13131A] border border-[#1E1E2E] flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-[#2A2A3E]" />
            </div>
            <p className="text-[#5A5A7A] mb-6">No tienes pedidos aún</p>
            <button
              onClick={() => navigate('/store')}
              className="flex items-center gap-2 px-6 py-3 bg-[#C8FF00] text-black font-['Syne',sans-serif] font-bold text-sm rounded-xl hover:bg-[#d4ff1a] transition-all mx-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar tienda
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: Order) => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, cls: 'bg-[#1C1C27] text-[#9090B0] border-[#2A2A3E]' };
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/store/orders/${order.id}`)}
                  className="w-full bg-[#13131A] border border-[#1E1E2E] hover:border-[#2A2A3E] rounded-2xl p-4 flex items-center gap-4 text-left transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-['Syne',sans-serif] font-bold text-[15px]">
                        {order.order_number}
                      </span>
                      <span className={cn('px-2.5 py-0.5 rounded-lg border text-[10px] font-bold font-["Syne",sans-serif] uppercase tracking-wide', cfg.cls)}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[#5A5A7A] text-sm">
                      {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? 'artículo' : 'artículos'} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-['Syne',sans-serif] font-bold text-[#C8FF00]">
                      ${Number(order.total).toLocaleString()}
                    </p>
                    <p className="text-[#5A5A7A] text-xs">MXN</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#3A3A5A] group-hover:text-[#9090B0] flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;