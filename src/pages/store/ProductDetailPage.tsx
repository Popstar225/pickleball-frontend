import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchProduct,
  addToCart,
  selectCurrentProduct,
  selectCartCount,
} from '@/store/slices/equipmentSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, ArrowLeft, Package, Star, Minus, Plus, Loader2, Tag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/common/tools';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  paddles: 'Paletas',
  balls: 'Pelotas',
  bags: 'Bolsas',
  apparel: 'Ropa',
  accessories: 'Accesorios',
};

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const product = useSelector(selectCurrentProduct);
  const cartCount = useSelector(selectCartCount);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      dispatch(fetchProduct(productId)).finally(() => setLoading(false));
    }
  }, [productId]);

  useEffect(() => { setSelectedImage(0); }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
          <span className="text-[#5A5A7A] text-sm">Cargando producto…</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white">
        <Package className="w-12 h-12 text-[#2A2A3E] mb-4" />
        <p className="text-[#5A5A7A] mb-5">Producto no encontrado</p>
        <button
          onClick={() => navigate('/store')}
          className="px-5 py-2.5 bg-[#13131A] border border-[#2A2A3E] rounded-xl text-sm hover:border-[#353550] transition-all"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: qty }));
    toast({ title: 'Agregado al carrito', description: `${qty}× ${product.name}` });
  };

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif]">
      {/* Topnav */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2 text-[#9090B0] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </button>

          <button
            onClick={() => navigate('/store/cart')}
            className="relative flex items-center gap-2 px-4 py-2 bg-[#13131A] border border-[#2A2A3E] hover:border-[#C8FF00] hover:text-[#C8FF00] rounded-xl text-sm font-medium transition-all duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C8FF00] text-black text-[11px] font-bold rounded-full flex items-center justify-center font-['Syne',sans-serif]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-[#13131A] border border-[#1E1E2E] rounded-2xl overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getFullImageUrl(product.images[selectedImage]) ?? ''}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-20 h-20 text-[#2A2A3E]" />
                </div>
              )}
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-[#9090B0] font-['Syne',sans-serif] font-bold text-sm tracking-widest uppercase">
                    Agotado
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-[#FF6B35] rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-bold font-['Syne',sans-serif]">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all',
                      selectedImage === i
                        ? 'border-[#C8FF00]'
                        : 'border-[#1E1E2E] hover:border-[#2A2A3E]'
                    )}
                  >
                    <img src={getFullImageUrl(img) ?? ''} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#5A5A7A] text-xs border border-[#2A2A3E] rounded-lg px-3 py-1 capitalize">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
              {product.is_featured && (
                <span className="flex items-center gap-1.5 text-[#C8FF00] text-xs bg-[rgba(200,255,0,0.1)] border border-[rgba(200,255,0,0.2)] rounded-lg px-3 py-1">
                  <Star className="w-3 h-3 fill-[#C8FF00]" />
                  Destacado
                </span>
              )}
            </div>

            {/* Name */}
            <div>
              <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight leading-tight">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-[#3A3A5A] text-xs mt-1.5">SKU: {product.sku}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-['Syne',sans-serif] text-4xl font-extrabold text-[#C8FF00]">
                  ${Number(product.price).toLocaleString()}
                </span>
                <span className="text-[#5A5A7A] text-base">MXN</span>
                {product.compare_price && (
                  <span className="text-[#3A3A5A] text-xl line-through">
                    ${Number(product.compare_price).toLocaleString()}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Tag className="w-3 h-3 text-[#FF6B35]" />
                  <span className="text-[#FF6B35] text-sm font-medium">
                    {discount}% de descuento
                  </span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  product.stock_quantity > 0 ? 'bg-[#C8FF00] shadow-[0_0_8px_rgba(200,255,0,0.5)]' : 'bg-[#FF6B35]'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  product.stock_quantity > 0 ? 'text-[#C8FF00]' : 'text-[#FF6B35]'
                )}
              >
                {product.stock_quantity > 0
                  ? `En stock — ${product.stock_quantity} disponibles`
                  : 'Agotado'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-[#1E1E2E] pt-5">
                <h3 className="text-[#9090B0] text-xs uppercase tracking-widest font-['Syne',sans-serif] mb-2">
                  Descripción
                </h3>
                <p className="text-[#9090B0] leading-relaxed text-sm">{product.description}</p>
              </div>
            )}

            {/* Qty + CTA */}
            {product.stock_quantity > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-[#5A5A7A] text-sm">Cantidad:</span>
                  <div className="flex items-center bg-[#13131A] border border-[#2A2A3E] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-white hover:bg-[#1C1C27] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-['Syne',sans-serif] font-bold text-base border-x border-[#2A2A3E]">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-white hover:bg-[#1C1C27] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-['Syne',sans-serif] font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito — ${(Number(product.price) * qty).toLocaleString()} MXN
                </button>

                <button
                  onClick={() => {
                    dispatch(addToCart({ product, quantity: qty }));
                    navigate('/store/cart');
                  }}
                  className="w-full py-3.5 bg-transparent border border-[rgba(200,255,0,0.35)] text-[#C8FF00] font-['Syne',sans-serif] font-bold text-base rounded-xl hover:bg-[rgba(200,255,0,0.05)] transition-all"
                >
                  Comprar ahora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}