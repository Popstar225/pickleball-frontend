import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  selectCart,
  selectCartTotal,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '@/store/slices/equipmentSlice';
import { CartItem } from '@/services/equipmentService';
import {
  ShoppingCart, Trash2, ArrowLeft, Minus, Plus, Package, ShoppingBag,
} from 'lucide-react';
import { getFullImageUrl } from '@/common/tools';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cart = useSelector(selectCart);
  const total = useSelector(selectCartTotal);
  const authUser = useSelector((s: RootState) => s.auth.user);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center font-['DM_Sans',sans-serif]">
        <div className="w-20 h-20 rounded-2xl bg-[#13131A] border border-[#1E1E2E] flex items-center justify-center mb-5">
          <ShoppingCart className="w-8 h-8 text-[#2A2A3E]" />
        </div>
        <h2 className="font-sans text-xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-[#5A5A7A] text-sm mb-7">Agrega productos para continuar</p>
        <button
          onClick={() => navigate('/store')}
          className="flex items-center gap-2 px-6 py-3 bg-[#C8FF00] text-black font-sans font-bold text-sm rounded-xl hover:bg-[#d4ff1a] transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Ir a la tienda
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!authUser) {
      navigate('/login?redirect=/store/checkout');
      return;
    }
    navigate('/store/checkout');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif]">
      {/* Topnav */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-[#1E1E2E]">
        <div className="max-w-5xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2 text-[#9090B0] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuar comprando
          </button>
          <div className="flex items-center gap-2">
            <span className="font-sans font-extrabold text-base">Carrito</span>
            <span className="text-[#5A5A7A] text-sm">({cart.length})</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-3">
            {cart.map((item: CartItem) => (
              <div
                key={item.product.id}
                className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-4 flex gap-4"
              >
                <div
                  className="w-20 h-20 bg-[#1C1C27] rounded-xl flex-shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/store/products/${item.product.id}`)}
                >
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={getFullImageUrl(item.product.images[0]) ?? ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-7 h-7 text-[#2A2A3E]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium text-[15px] cursor-pointer hover:text-[#C8FF00] transition-colors truncate"
                    onClick={() => navigate(`/store/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-[#C8FF00] font-sans font-bold text-sm mt-1">
                    ${Number(item.product.price).toLocaleString()} MXN
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="flex items-center bg-[#1C1C27] border border-[#2A2A3E] rounded-lg overflow-hidden">
                      <button
                        onClick={() => dispatch(updateCartQuantity({ productId: item.product.id, quantity: item.quantity - 1 }))}
                        className="w-7 h-7 flex items-center justify-center text-white hover:bg-[#252535] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-sans font-bold border-x border-[#2A2A3E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(updateCartQuantity({ productId: item.product.id, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="w-7 h-7 flex items-center justify-center text-white hover:bg-[#252535] disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.product.id))}
                      className="w-7 h-7 flex items-center justify-center text-[#3A3A5A] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-sans font-bold text-base">
                    ${(Number(item.product.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={() => dispatch(clearCart())}
              className="flex items-center gap-2 text-[#3A3A5A] hover:text-[#ff6b6b] text-xs mt-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5 sticky top-20">
              <h3 className="font-sans font-bold text-base mb-4">Resumen</h3>

              <div className="space-y-2.5 mb-4">
                {cart.map((item: CartItem) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-[#5A5A7A] flex-1 truncate mr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="text-white flex-shrink-0">
                      ${(Number(item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1E1E2E] pt-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A7A]">Envío</span>
                  <span className="text-[#C8FF00] font-semibold text-xs">Gratis</span>
                </div>
              </div>

              <div className="border-t border-[#1E1E2E] pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans font-bold">Total</span>
                  <div className="text-right">
                    <span className="font-sans font-extrabold text-2xl text-[#C8FF00]">
                      ${total.toLocaleString()}
                    </span>
                    <span className="text-[#5A5A7A] text-xs ml-1">MXN</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 mt-4 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <ShoppingCart className="w-4 h-4" />
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}