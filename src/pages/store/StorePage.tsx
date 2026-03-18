import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store';
import {
  fetchProducts,
  addToCart,
  selectProducts,
  selectProductsPagination,
  selectProductsLoading,
  selectProductFilters,
  selectCartCount,
  setFilter,
} from '@/store/slices/equipmentSlice';
import { Product, ProductCategory, SortOption } from '@/services/equipmentService';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart, Search, Grid3X3, List, Star, Package, ShoppingBag,
  Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, X, Tag,
  TrendingUp, Zap, Award, ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFullImageUrl } from '@/common/tools';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ProductCategory | ''; label: string; icon: string }[] = [
  { value: '', label: 'Todo el catálogo', icon: '◈' },
  { value: 'paddles', label: 'Paletas', icon: '◉' },
  { value: 'balls', label: 'Pelotas', icon: '●' },
  { value: 'bags', label: 'Bolsas', icon: '◫' },
  { value: 'apparel', label: 'Ropa', icon: '◻' },
  { value: 'accessories', label: 'Accesorios', icon: '◆' },
];

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A–Z' },
  { value: 'popularity', label: 'Popularidad' },
];

const PRICE_RANGES = [
  { label: 'Todos los precios', min: 0, max: Infinity },
  { label: 'Hasta $500', min: 0, max: 500 },
  { label: '$500 – $1,500', min: 500, max: 1500 },
  { label: '$1,500 – $3,000', min: 1500, max: 3000 },
  { label: 'Más de $3,000', min: 3000, max: Infinity },
];

const NAV_LINKS = [
  { label: 'Tienda', href: '/store', active: true },
  { label: 'Mis pedidos', href: '/store/orders' },
  { label: 'Carrito', href: '/store/cart', isCart: true },
];

const productImageUrl = (images: string[]) => getFullImageUrl(images?.[0]);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const products = useSelector(selectProducts);
  const pagination = useSelector(selectProductsPagination);
  const loading = useSelector(selectProductsLoading);
  const filters = useSelector(selectProductFilters);
  const cartCount = useSelector(selectCartCount);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const load = (p = page) => {
    dispatch(fetchProducts({
      category: filters.category || undefined,
      search: filters.search || undefined,
      sort: filters.sort,
      page: p,
      limit: 20,
    }));
  };

  useEffect(() => { load(1); setPage(1); }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ search: searchInput }));
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity === 0) return;
    dispatch(addToCart({ product, quantity: 1 }));
    toast({ title: '¡Agregado!', description: product.name });
  };

  const activeCategory = CATEGORIES.find(c => c.value === filters.category) || CATEGORIES[0];

  // client-side price filtering on top of server results
  const visibleProducts = products.filter(p => {
    const range = PRICE_RANGES[priceRange];
    const price = Number(p.price);
    if (price < range.min || price > range.max) return false;
    if (featuredOnly && !p.is_featured) return false;
    return true;
  });

  const hasActiveFilters = filters.category !== '' || filters.search !== '' || priceRange !== 0 || featuredOnly;

  const clearAllFilters = () => {
    dispatch(setFilter({ category: '', search: '' }));
    setSearchInput('');
    setPriceRange(0);
    setFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white font-['DM_Sans',sans-serif]">

      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#080810]/96 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 h-[58px] flex items-center justify-between gap-6">

          {/* Logo + back link */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-white/40 hover:text-white text-[12px] font-medium transition-colors pr-3 border-r border-white/[0.08]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#C8FF00] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-sans font-extrabold text-[15px] tracking-[-0.3px] text-white">
              PADELSTORE
            </span>
          </div>

          {/* Search — center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar productos, marcas…"
              className="w-full h-9 pl-9 pr-4 bg-white/[0.05] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-white/[0.15] focus:bg-white/[0.07] transition-all"
            />
          </form>

          {/* Right nav */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => navigate('/store/orders')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] text-[13px] transition-all"
            >
              Mis pedidos
            </button>
            <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
            <button
              onClick={() => navigate('/store/cart')}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-[#C8FF00]/30 rounded-xl text-[13px] font-medium transition-all group"
            >
              <ShoppingCart className="w-3.5 h-3.5 group-hover:text-[#C8FF00] transition-colors" />
              <span className="group-hover:text-[#C8FF00] transition-colors">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#C8FF00] text-black text-[10px] font-bold rounded-full flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-7">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={cn(
              'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto',
              'w-[260px] flex-shrink-0',
              'bg-[#080810] lg:bg-transparent border-r border-white/[0.06] lg:border-none',
              'flex flex-col gap-6 overflow-y-auto',
              'transition-transform duration-300 lg:transition-none',
              'lg:translate-x-0',
              sidebarOpen ? 'translate-x-0 pt-6 px-5 pb-10' : '-translate-x-full',
              'lg:pt-0 lg:px-0 lg:pb-0',
            )}
          >
            {/* Mobile close */}
            <div className="flex items-center justify-between lg:hidden mb-1">
              <span className="font-sans font-bold text-sm text-white/60 uppercase tracking-widest">
                Filtros
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-white/30 mb-3 px-1">
                Categorías
              </p>
              <nav className="flex flex-col gap-0.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      dispatch(setFilter({ category: c.value as ProductCategory | '' }));
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-left transition-all group',
                      filters.category === c.value
                        ? 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    )}
                  >
                    <span className={cn(
                      'text-[11px] w-4 text-center transition-colors',
                      filters.category === c.value ? 'text-[#C8FF00]' : 'text-white/25 group-hover:text-white/50'
                    )}>
                      {c.icon}
                    </span>
                    <span className="flex-1 font-medium">{c.label}</span>
                    {filters.category === c.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Price range */}
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-white/30 mb-3 px-1">
                Precio
              </p>
              <div className="flex flex-col gap-0.5">
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPriceRange(idx)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-left transition-all',
                      priceRange === idx
                        ? 'bg-white/[0.07] text-white border border-white/[0.1]'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="font-medium">{range.label}</span>
                    {priceRange === idx && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Quick filters */}
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[1.5px] text-white/30 mb-3 px-1">
                Filtros rápidos
              </p>
              <div className="flex flex-col gap-1.5">
                <label className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group',
                  featuredOnly
                    ? 'bg-[#C8FF00]/10 border border-[#C8FF00]/20'
                    : 'hover:bg-white/[0.04]'
                )}>
                  <div className={cn(
                    'w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all',
                    featuredOnly
                      ? 'bg-[#C8FF00] border-[#C8FF00]'
                      : 'border-white/20 group-hover:border-white/40'
                  )}>
                    {featuredOnly && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={cn('w-3 h-3', featuredOnly ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-white/30')} />
                    <span className={cn('text-[13px] font-medium', featuredOnly ? 'text-[#C8FF00]' : 'text-white/50 group-hover:text-white')}>
                      Solo destacados
                    </span>
                  </div>
                  <input type="checkbox" className="sr-only" checked={featuredOnly} onChange={e => setFeaturedOnly(e.target.checked)} />
                </label>

                <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group hover:bg-white/[0.04]">
                  <div className="w-4 h-4 rounded-md border border-white/20 group-hover:border-white/40 flex items-center justify-center flex-shrink-0 transition-all" />
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-white/30" />
                    <span className="text-[13px] font-medium text-white/50 group-hover:text-white">
                      En stock
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}

            {/* Promo block */}
            <div className="mt-auto bg-[#C8FF00]/[0.06] border border-[#C8FF00]/[0.12] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-3.5 h-3.5 text-[#C8FF00]" />
                <span className="text-[#C8FF00] text-[11px] font-bold font-sans uppercase tracking-wide">
                  Envío gratis
                </span>
              </div>
              <p className="text-white/40 text-[12px] leading-relaxed">
                En todos los pedidos. Sin mínimo de compra.
              </p>
            </div>
          </aside>
        </>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-[13px] text-white/60 hover:text-white hover:border-white/[0.15] transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                )}
              </button>

              {/* Breadcrumb / active filter label */}
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-xl tracking-tight text-white">
                  {activeCategory.label}
                </span>
                {pagination && (
                  <span className="text-white/25 text-[13px]">
                    {pagination.total} productos
                  </span>
                )}
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {filters.search && (
                    <FilterChip
                      label={`"${filters.search}"`}
                      onRemove={() => { dispatch(setFilter({ search: '' })); setSearchInput(''); }}
                    />
                  )}
                  {priceRange > 0 && (
                    <FilterChip
                      label={PRICE_RANGES[priceRange].label}
                      onRemove={() => setPriceRange(0)}
                    />
                  )}
                  {featuredOnly && (
                    <FilterChip label="Destacados" onRemove={() => setFeaturedOnly(false)} />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={v => dispatch(setFilter({ sort: v as SortOption }))}
              >
                <SelectTrigger className="w-48 h-9 bg-white/[0.05] border-white/[0.07] text-white/70 rounded-xl text-[13px] focus:ring-0 hover:border-white/[0.15] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-white/[0.1] rounded-xl">
                  {SORTS.map(s => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="text-white/60 focus:bg-white/[0.07] focus:text-white text-[13px]"
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="flex bg-white/[0.04] border border-white/[0.07] rounded-xl p-0.5 gap-0.5">
                {[
                  { mode: 'grid' as const, Icon: Grid3X3 },
                  { mode: 'list' as const, Icon: List },
                ].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-[9px] transition-all',
                      viewMode === mode
                        ? 'bg-white/[0.1] text-white'
                        : 'text-white/25 hover:text-white/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex md:hidden mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar productos…"
                className="w-full h-10 pl-9 pr-4 bg-white/[0.05] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-white/[0.15] transition-all"
              />
            </div>
          </form>

          {/* Products grid/list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#C8FF00]/60" />
              <span className="text-white/25 text-sm">Cargando productos…</span>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Package className="w-6 h-6 text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-white/40 font-medium mb-1">Sin resultados</p>
                <p className="text-white/20 text-sm">Intenta ajustar los filtros</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/50 hover:text-white transition-all"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {visibleProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAddToCart={() => handleAddToCart(product)}
                  onClick={() => navigate(`/store/products/${product.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {visibleProducts.map(product => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onClick={() => navigate(`/store/products/${product.id}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); load(page - 1); }}
                className="w-9 h-9 flex items-center justify-center bg-white/[0.05] border border-white/[0.07] rounded-xl text-white/40 disabled:opacity-20 hover:border-white/[0.15] hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { setPage(p); load(p); }}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-medium transition-all',
                    page === p
                      ? 'bg-[#C8FF00] text-black font-bold font-sans'
                      : 'bg-white/[0.05] border border-white/[0.07] text-white/40 hover:border-white/[0.15] hover:text-white'
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === pagination.pages}
                onClick={() => { setPage(p => p + 1); load(page + 1); }}
                className="w-9 h-9 flex items-center justify-center bg-white/[0.05] border border-white/[0.07] rounded-xl text-white/40 disabled:opacity-20 hover:border-white/[0.15] hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] border border-white/[0.09] rounded-full text-[12px] text-white/60">
      <span>{label}</span>
      <button onClick={onRemove} className="ml-0.5 text-white/30 hover:text-white transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Product Card (Grid) ──────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
  onAddToCart,
  onClick,
}: {
  product: Product;
  index: number;
  onAddToCart: () => void;
  onClick: () => void;
}) {
  const imgSrc = productImageUrl(product.images);
  const discount = product.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <div
      className="group relative bg-[#0E0E18] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Image */}
      <div
        className="aspect-[4/3] bg-[#12121E] relative overflow-hidden"
        onClick={onClick}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.is_featured && (
            <div className="flex items-center gap-1 bg-[#C8FF00]/90 rounded-md px-2 py-0.5">
              <Star className="w-2.5 h-2.5 text-black fill-black" />
              <span className="text-black text-[10px] font-extrabold font-sans tracking-wide">
                TOP
              </span>
            </div>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#FF5A1F] rounded-md px-2 py-0.5">
            <span className="text-white text-[10px] font-bold font-sans">
              -{discount}%
            </span>
          </div>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white/50 font-sans font-bold text-[11px] tracking-[2px] uppercase border border-white/20 px-3 py-1 rounded-full">
              Agotado
            </span>
          </div>
        )}

        {/* Quick add — appears on hover */}
        {product.stock_quantity > 0 && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              className="w-full py-2 bg-[#C8FF00] rounded-xl text-black text-[12px] font-extrabold font-sans flex items-center justify-center gap-1.5 hover:bg-[#d6ff26] active:scale-[0.98] transition-all"
            >
              <ShoppingCart className="w-3 h-3" />
              Añadir al carrito
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <p className="text-white/25 text-[10px] uppercase tracking-[1.2px] mb-1 font-sans">
          {product.category}
        </p>
        <h3
          className="text-white/85 text-[13px] font-medium leading-snug mb-2.5 line-clamp-2 group-hover:text-white transition-colors"
          onClick={onClick}
        >
          {product.name}
        </h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="font-sans font-bold text-[#C8FF00] text-[16px] leading-none">
              ${Number(product.price).toLocaleString()}
              <span className="text-white/30 text-[11px] font-normal ml-1">MXN</span>
            </div>
            {product.compare_price && (
              <div className="text-white/25 text-[11px] line-through mt-0.5">
                ${Number(product.compare_price).toLocaleString()}
              </div>
            )}
          </div>
          {product.stock_quantity > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              className="w-7 h-7 flex items-center justify-center bg-white/[0.08] rounded-lg hover:bg-[#C8FF00] hover:text-black text-white/50 transition-all active:scale-90 group/btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product List Item ────────────────────────────────────────────────────────

function ProductListItem({
  product,
  onAddToCart,
  onClick,
}: {
  product: Product;
  onAddToCart: () => void;
  onClick: () => void;
}) {
  const imgSrc = productImageUrl(product.images);
  const discount = product.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <div className="group bg-[#0E0E18] border border-white/[0.06] rounded-2xl p-3.5 flex items-center gap-4 hover:border-white/[0.11] transition-all duration-200">
      {/* Thumbnail */}
      <div
        className="w-16 h-16 bg-[#12121E] rounded-xl flex-shrink-0 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-5 h-5 text-white/15" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white/25 text-[10px] uppercase tracking-[1.2px] font-sans">
            {product.category}
          </span>
          {product.is_featured && (
            <span className="flex items-center gap-0.5 text-[#C8FF00] text-[9px] font-bold font-sans uppercase tracking-wide">
              <Star className="w-2.5 h-2.5 fill-[#C8FF00]" /> Top
            </span>
          )}
        </div>
        <h3
          className="text-white/85 font-medium text-[14px] truncate cursor-pointer group-hover:text-white transition-colors"
          onClick={onClick}
        >
          {product.name}
        </h3>
        {product.description && (
          <p className="text-white/30 text-[12px] truncate mt-0.5">{product.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {product.stock_quantity > 0 ? (
            <span className="text-white/30 text-[11px]">{product.stock_quantity} en stock</span>
          ) : (
            <span className="text-[#FF5A1F] text-[11px]">Agotado</span>
          )}
          {discount > 0 && (
            <span className="text-[#FF5A1F] text-[11px] font-semibold">-{discount}%</span>
          )}
        </div>
      </div>

      {/* Price + Add */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="font-sans font-bold text-[#C8FF00] text-[15px] leading-none">
            ${Number(product.price).toLocaleString()}
          </div>
          <div className="text-white/25 text-[11px] mt-0.5">MXN</div>
          {product.compare_price && (
            <div className="text-white/20 text-[11px] line-through">
              ${Number(product.compare_price).toLocaleString()}
            </div>
          )}
        </div>
        <button
          disabled={product.stock_quantity === 0}
          onClick={onAddToCart}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C8FF00] hover:bg-[#d6ff26] text-black text-[12px] font-extrabold font-sans rounded-xl disabled:bg-white/[0.06] disabled:text-white/20 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>
    </div>
  );
}